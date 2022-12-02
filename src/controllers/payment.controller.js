/* eslint-disable no-nested-ternary */
/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const moment = require('moment');
const catchAsync = require('../utils/catchAsync');
const {
  paymentService,
  emailService,
  userService,
  // creatorPageService,
  chargeService,
  orderService,
  merchService,
} = require('../services');
const { TRANSACTION_TYPES, TRANSACTION_SOURCES, CURRENCIES, ORDER_STATUSES, EVENTS } = require('../config/constants');
const { TransactionDump, Report } = require('../models');
const ApiError = require('../utils/ApiError');
const { Paga } = require('../utils/paga');
const pick = require('../utils/pick');
const { addNotification } = require('../utils/notification');
const { generateRandomChar, calculateProfit } = require('../utils/helpers');
const config = require('../config/config');
const mixPanel = require('../utils/mixpanel');
const Bank = require('../models/wallet/bank.model');

const getAccountInfo = catchAsync(async (req, res) => {
  const accountInfo = await paymentService.queryAccountInfoByUser(req.user.id);
  if (!accountInfo) {
    const newAccountInfo = await paymentService.setupAccount(req.user);
    return res.send(newAccountInfo);
  }
  res.send(accountInfo);
});

const getBanks = catchAsync(async (req, res) => {
  let banks = await Bank.find();
  if (banks.length > 0) return res.send(banks);
  banks = await Paga.getBanks();
  res.send(banks);
});

const creditAccount = catchAsync(async (req, res) => {
  const { reference } = req.params;
  let data = {};
  if (req.query && req.query.statusCode === '0') {
    data = { ...req.query };
  } else if (req.body && req.body.statusCode === '0') data = { ...req.body };

  data.idempotentKey = data.transactionReference;

  const proceed = await paymentService.controlTransaction(data);

  if (!proceed) return res.send({ status: 'SUCCESS', message: 'Information already received' });

  const errorTracker = [
    `<strong>Account credit process for user account. Reference: ${reference}</strong><br>`,
    `Credit request initiated for TrxId: ${data.transactionReference}`,
  ];

  try {
    const accountInfo = await paymentService.queryAccountInfoByReference(reference);
    errorTracker.push(`Account info retrieved sucessfully for user ${accountInfo.user}`);
    const transactionDump = await TransactionDump.create({ data, user: accountInfo.user || null });
    errorTracker.push(`Transaction data dumped sucessfully. DumpId ${transactionDump._id.toString()}`);
    data.amount = data.amount.split(',').join('');
    errorTracker.push(`Transaction amount converted to number successfully (${data.amount})`);
    const updatedBalance = Number((accountInfo.balance.naira + Number(data.amount)).toFixed(2));
    errorTracker.push(`New balance calculated successfully (${updatedBalance})`);

    emailService.sendPaymentTrackingEmail(`
        Balance updated for transaction with reference ${data.transactionReference}
        <br>
        User: ${accountInfo.user || null}
        <br>
        Amount: New: ${data.amount}, Updated balance: ${updatedBalance}
      `);

    // Confirm that there is no prior log of this particular transaction
    const getTransactions = await paymentService.getTransactions(
      {
        reference: { $eq: data.transactionReference },
      },
      {},
      false,
      true
    );
    if (getTransactions.results.length > 0) {
      errorTracker.push(`Transaction previous log check returns true`);
      return res.send({ status: 'SUCCESS', message: 'Already logged' });
    }
    await paymentService.updateBalance(updatedBalance, accountInfo.user);
    errorTracker.push(`New balance updated successfully for user (${updatedBalance})`);

    let charge = Number(((Number(config.paymentProcessing.depositCharge) / 100) * data.amount).toFixed(2));
    charge = charge > 500 ? 500 : charge;

    const transaction = await paymentService.createTransactionRecord({
      amount: Number(data.amount),
      type: TRANSACTION_TYPES.CREDIT,
      source: TRANSACTION_SOURCES.BANK_TRANSFER,
      user: accountInfo.user,
      transactionDump: transactionDump.id,
      createdBy: accountInfo.user,
      reference: data.transactionReference,
      meta: {
        payerName: data.payerDetails.payerName,
        bankName: data.payerDetails.payerBankName,
        paymentReferenceNumber: data.payerDetails.paymentReferenceNumber,
        fundingPaymentReference: data.fundingPaymentReference,
        accountNumber: accountInfo.accountInfo.accountNumber,
        accountName: accountInfo.accountInfo.accountName,
      },
    });
    mixPanel(EVENTS.DEPOSIT, transaction);
    await paymentService.createMerchroEarningsRecord({
      user: accountInfo.user,
      source: TRANSACTION_SOURCES.PAYMENT_LINK,
      amount: Number(data.amount),
      charge: 0,
      profit: `-${charge}`,
      transaction: transaction._id,
      amountSpent: 0,
    });

    errorTracker.push(`Transaction logged successfully for user`);
    const message = `NGN${data.amount} was credited to your account (${data.payerDetails.payerName}/${data.payerDetails.payerBankName})`;
    const user = await userService.getUserById(accountInfo.user);

    emailService.creditEmail(user.email, user.firstName, message);
    errorTracker.push(`Credit notification email sent`);

    errorTracker.push(`All required step completed successfully`);

    emailService.sendPaymentTrackingEmail(errorTracker.join(' <br> '));

    addNotification(message, accountInfo.user);
    res.send({ status: 'SUCCESS' });
  } catch (error) {
    paymentService.logError({ status: errorTracker.join(' <br> ') });
    emailService.sendPaymentTrackingEmail(errorTracker.join(' <br> '));
    res.send({ status: 'FAILED' });
  }
});

const withdrawMoney = catchAsync(async (req, res) => {
  const accountInfo = await paymentService.queryAccountInfoByUser(req.user.id);
  const proceed = await paymentService.controlTransaction(req.body);
  if (!proceed) throw new ApiError(httpStatus.BAD_REQUEST, 'Duplicate transaction, withdrawal already initialized');

  if (!accountInfo) throw new ApiError(httpStatus.FORBIDDEN, 'You cannot make transfers until your account is fully setup');
  let charge = Number(Number(config.paymentProcessing.withdrawalCharge).toFixed(2));
  if (Number(req.body.amount) + charge <= accountInfo.balance.naira) {
    const processingCost = Number(config.paymentProcessing.withdrawalProcessingCost);
    const profit = charge - processingCost;
    const updatedBalance = Number((accountInfo.balance.naira - Number(req.body.amount)).toFixed(2));
    const withdrawResponse = await paymentService.withdrawMoney(req.body, req.user);
    charge = withdrawResponse.response.fee && withdrawResponse.response.fee === 0 ? 0 : charge;
    await paymentService.updateBalance(updatedBalance + charge, accountInfo.user);
    const transactionDump = await TransactionDump.create({ data: withdrawResponse, user: accountInfo.user });
    // Store transaction
    const transaction = await paymentService.createTransactionRecord({
      user: accountInfo.user,
      source: TRANSACTION_SOURCES.SAVINGS,
      type: TRANSACTION_TYPES.DEBIT,
      amount: Number(req.body.amount),
      purpose: req.body.purpose || null,
      createdBy: accountInfo.user,
      transactionDump: transactionDump.id,
      reference: withdrawResponse.response.reference,
      meta: {
        accountNumber: req.body.accountNumber,
        accountName: withdrawResponse.response.destinationAccountHolderNameAtBank,
        currency: withdrawResponse.response.currency,
        fee: charge,
        message: withdrawResponse.response.message,
        reference: withdrawResponse.response.reference,
      },
    });

    mixPanel(EVENTS.WITHDRAW, transaction);
    await paymentService.createMerchroEarningsRecord({
      user: accountInfo._id,
      source: TRANSACTION_SOURCES.SAVINGS,
      amount: Number(req.body.amount),
      charge,
      profit: withdrawResponse.response.fee && withdrawResponse.response.fee === 0 ? 0 : profit,
      transaction: transaction._id,
      amountSpent: withdrawResponse.response.fee && withdrawResponse.response.fee === 0 ? 0 : processingCost,
    });
    const message = `NGN${req.body.amount} was debited from your account to (${withdrawResponse.response.destinationAccountHolderNameAtBank}/${req.body.accountNumber})`;
    const user = await userService.getUserById(accountInfo.user);

    emailService.debitEmail(user.email, user.firstName, message);

    addNotification(message, accountInfo.user);
    res.send(transaction);
  } else
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Oops! you don't have enough funds ${Number(req.body.amount) + charge} to perform this transaction`
    );
});

// In-app cash transfers
const transferMoney = catchAsync(async (req, res) => {
  const accountInfo = await paymentService.queryAccountInfoByUser(req.user.id);
  const proceed = await paymentService.controlTransaction(req.body);
  const { currency } = req.body;
  if (!proceed) throw new ApiError(httpStatus.BAD_REQUEST, 'Duplicate transaction, withdrawal already initialized');

  if (!accountInfo) throw new ApiError(httpStatus.FORBIDDEN, 'You cannot make transfers until your account is fully setup');
  if (Number(req.body.amount) <= accountInfo.balance[currency]) {
    const updatedBalance = Number((accountInfo.balance[currency] - Number(req.body.amount)).toFixed(2));
    const withdrawResponse = await paymentService.transferMoney(req.params.userId, req.body, req.user);
    await paymentService.updateBalance(updatedBalance, accountInfo.user);
    const transactionDump = await TransactionDump.create({ data: withdrawResponse, user: accountInfo.user });
    // Store transaction
    const transaction = await paymentService.createTransactionRecord({
      user: accountInfo.user,
      source: TRANSACTION_SOURCES.SAVINGS,
      type: TRANSACTION_TYPES.DEBIT,
      amount: Number(req.body.amount),
      purpose: req.body.purpose || null,
      createdBy: accountInfo.user,
      transactionDump: transactionDump.id,
      reference: withdrawResponse.response.reference,
      meta: {
        accountName: withdrawResponse.response.destinationAccountHolderNameAtBank,
        payerName: withdrawResponse.response.destinationAccountHolderNameAtBank,
        currency: withdrawResponse.response.currency,
        fee: withdrawResponse.response.fee,
        message: withdrawResponse.response.message,
        reference: withdrawResponse.response.reference,
      },
    });

    const message = `NGN${req.body.amount} was debited from your account to (${withdrawResponse.response.destinationAccountHolderNameAtBank}/${req.body.accountNumber})`;
    const user = await userService.getUserById(accountInfo.user);

    emailService.debitEmail(user.email, user.firstName, message);

    addNotification(message, accountInfo.user);
    res.send(transaction);
  } else throw new ApiError(httpStatus.BAD_REQUEST, `Oops! you don't have enough funds to perform this transaction`);
});

const validateAccount = catchAsync(async (req, res) => {
  let account = await Paga.checkAccount(req.body);
  if (account.error) throw new ApiError(httpStatus.BAD_REQUEST, account.response.message);
  else
    account = {
      accountNumber: req.body.accountNumber,
      accountName: account.response.destinationAccountHolderNameAtBank,
      fee: 60,
    };
  res.send(account);
});

const getTransactions = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['user', 'type', 'source']);
  if (req.query.startDate && req.query.endDate) {
    filter.createdAt = { $gte: moment(req.query.startDate).startOf('day'), $lte: moment(req.query.endDate).endOf('day') };
  } else if (req.query.startDate) {
    filter.createdAt = { $gte: moment(req.query.startDate).startOf('day') };
  } else if (req.query.endDate) {
    filter.createdAt = { $lte: moment(req.query.endDate).endOf('day') };
  }
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  if (req.query.include) options.populate = req.query.include.toString();
  else options.populate = '';
  const transactions = await paymentService.getTransactions(filter, options, req.user, req.query.paginate);
  res.send(transactions);
});

const billPayment = catchAsync(async (req, res) => {
  const bill = await paymentService.billPayment();
  res.send(bill);
});

const buyAirtime = catchAsync(async (req, res) => {
  const accountInfo = await paymentService.queryAccountInfoByUser(req.user.id);
  if (!accountInfo) throw new ApiError(httpStatus.FORBIDDEN, 'You cannot make transfers until your account is fully setup');
  if (Number(req.body.amount) <= accountInfo.balance.naira) {
    const updatedBalance = Number((accountInfo.balance.naira - Number(req.body.amount)).toFixed(2));
    const airtimeResponse = await paymentService.buyAirtime(req.body, req.user);
    await paymentService.updateBalance(updatedBalance, accountInfo.user);
    const transactionDump = await TransactionDump.create({ data: airtimeResponse, user: accountInfo.user });
    // Store transaction
    const transaction = await paymentService.createTransactionRecord({
      user: accountInfo.user,
      source: TRANSACTION_SOURCES.SAVINGS,
      type: TRANSACTION_TYPES.DEBIT,
      amount: Number(req.body.amount),
      purpose: 'Airtime purchase',
      createdBy: accountInfo.user,
      transactionDump: transactionDump.id,
      meta: {
        payerName: `Airtime/${req.body.phoneNumber}`,
        phoneNumber: req.body.phoneNumber,
        message: airtimeResponse.response.message,
        reference: airtimeResponse.response.reference,
      },
    });
    mixPanel(EVENTS.WITHDRAW, transaction);
    await paymentService.createMerchroEarningsRecord({
      user: accountInfo.user,
      amount: req.body.amount,
      source: TRANSACTION_SOURCES.SAVINGS,
      charge: 0,
      profit: Number((Number(config.paymentProcessing.airtimeRechargeCharge / 100) * req.body.amount).toFixed(2)),
      transaction: transaction.id,
      amountSpent: 0,
    });
    res.send(transaction);
  } else throw new ApiError(httpStatus.BAD_REQUEST, 'Insufficient balance');
});

const validatePaymentCallback = catchAsync(async (req, res) => {
  if (req.body.status === 'successful') {
    const proceed = await paymentService.controlTransaction(req.body);
    if (!proceed) throw new ApiError(httpStatus.BAD_REQUEST, 'Transaction already processed.');
    const validatePayment = await paymentService.validatePayment(req.body.transactionId);
    if (validatePayment.data.status === 'successful') {
      const order = await orderService.getOrderByOrderCode(validatePayment.data.meta.orderCode);
      const purchaser = await userService.getUserById(validatePayment.data.meta.purchaser);
      const creator = await userService.getUserByCreatorPage(order.creatorPage);
      if (order) {
        await orderService.updateOrderById(order._id, { status: ORDER_STATUSES.PICKUP }, creator);
        const orderJson = order.toJSON();
        let { amount } = validatePayment.data;
        // const creatorPage = await creatorPageService.queryCreatorPageById(order.creatorPage);
        const charge = await chargeService.saveCharge(amount, order.id, creator.id);
        amount -= charge;
        const processingCost = (Number(config.paymentProcessing.invoiceProcessingCost) / 100) * amount;
        const profit = charge - processingCost;
        const transaction = await paymentService.createTransactionRecord({
          user: creator.id,
          source: TRANSACTION_SOURCES.STORE,
          type: TRANSACTION_TYPES.CREDIT,
          amount: Number(amount),
          purpose: 'Store purchase',
          createdBy: purchaser.id,
          reference: orderJson.orderCode,
          meta: {
            user: purchaser.id,
            payerName: `${purchaser.firstName} ${purchaser.lastName}`,
            email: purchaser.email,
            currency: CURRENCIES.NAIRA,
          },
        });
        await paymentService.addToBalance(amount, creator.id);
        mixPanel(EVENTS.SALE_FROM_STORE, transaction);
        await paymentService.createMerchroEarningsRecord({
          user: creator._id,
          source: TRANSACTION_SOURCES.STORE,
          amount: Number(amount),
          charge,
          profit,
          transaction: transaction._id,
          amountSpent: processingCost,
        });

        const orderedMerches = [];
        const orderMerch = order.merches.map(async (merch) => {
          const data = await merchService.queryMerchById(merch.merchId);
          orderedMerches.push(data);
        });
        await Promise.all(orderMerch);
        order.merches.forEach((merch) => {
          orderedMerches.forEach((merchData) => {
            if (merch.merchId.toString() === merchData.id.toString()) {
              merch.merchId = merchData;
            }
          });
        });
        // const link = `https://${creatorPage.slug}.merchro.store`;
        order.paymentStatus = ORDER_STATUSES.PICKUP;
        await emailService.sendUserOrderFulfillmentEmail(purchaser, order, order.paymentUrl);
        res.send(order);
      }
    } else {
      // Inform the customer their payment was unsuccessful
      throw new ApiError(httpStatus.BAD_REQUEST, 'Payment was unsuccessful');
    }
  }
});
const buyData = catchAsync(async (req, res) => {
  const accountInfo = await paymentService.queryAccountInfoByUser(req.user.id);
  if (!accountInfo) throw new ApiError(httpStatus.FORBIDDEN, 'You cannot make transfers until your account is fully setup');
  if (Number(req.body.amount) <= accountInfo.balance.naira) {
    const updatedBalance = Number((accountInfo.balance.naira - Number(req.body.amount)).toFixed(2));
    const dataResponse = await paymentService.buyData(req.body, req.user);
    await paymentService.updateBalance(updatedBalance, accountInfo.user);
    const transactionDump = await TransactionDump.create({ data: dataResponse, user: accountInfo.user });
    // Store transaction
    const transaction = await paymentService.createTransactionRecord({
      user: accountInfo.user,
      source: TRANSACTION_SOURCES.SAVINGS,
      type: TRANSACTION_TYPES.DEBIT,
      amount: Number(req.body.amount),
      purpose: 'Data purchase',
      createdBy: accountInfo.user,
      transactionDump: transactionDump.id,
      meta: {
        destinationPhoneNumber: req.body.destinationPhoneNumber,
        message: dataResponse.message,
        reference: dataResponse.referenceNumber,
        payerName: `Data Sub/${req.body.destinationPhoneNumber}`,
      },
    });
    mixPanel(EVENTS.WITHDRAW, transaction);
    await paymentService.createMerchroEarningsRecord({
      user: accountInfo.user,
      amount: req.body.amount,
      source: TRANSACTION_SOURCES.SAVINGS,
      profit: Number(((config.paymentProcessing.airtimeRechargeCharge / 100) * req.body.amount).toFixed(2)),
      transaction: transaction.id,
      charge: 0,
      amountSpent: 0,
    });
    res.send(transaction);
  } else throw new ApiError(httpStatus.BAD_REQUEST, 'Insufficient balance');
});

const purchaseUtilities = catchAsync(async (req, res) => {
  const accountInfo = await paymentService.queryAccountInfoByUser(req.user.id);
  if (!accountInfo) throw new ApiError(httpStatus.FORBIDDEN, 'You cannot make transfers until your account is fully setup');
  if (Number(req.body.amount) <= accountInfo.balance.naira) {
    const profit = calculateProfit(req.body.amount, req.body.utilityType);
    delete req.body.utilityType;
    const updatedBalance = Number((accountInfo.balance.naira - Number(req.body.amount)).toFixed(2));
    const utilitiesResponse = await paymentService.purchaseUtilities(req.body, req.user);
    await paymentService.updateBalance(updatedBalance, accountInfo.user);
    const transactionDump = await TransactionDump.create({ data: utilitiesResponse, user: accountInfo.user });
    // Store transaction
    const transaction = await paymentService.createTransactionRecord({
      user: accountInfo.user,
      source: TRANSACTION_SOURCES.SAVINGS,
      type: TRANSACTION_TYPES.DEBIT,
      amount: Number(req.body.amount),
      purpose: 'Utilities purchase',
      createdBy: accountInfo.user,
      transactionDump: transactionDump.id,
      meta: {
        payerName: `Utilities/${req.user.firstName} ${req.user.lastName}`,
        phoneNumber: req.body.phoneNumber,
        message: utilitiesResponse.response.message,
        reference: utilitiesResponse.response.reference,
      },
    });
    mixPanel(EVENTS.WITHDRAW, transaction);
    await paymentService.createMerchroEarningsRecord({
      user: accountInfo.user,
      amount: req.body.amount,
      source: TRANSACTION_SOURCES.SAVINGS,
      charge: 0,
      profit,
      transaction: transaction.id,
      amountSpent: 0,
    });
    res.send(transaction);
  } else throw new ApiError(httpStatus.BAD_REQUEST, 'Insufficient balance');
});

const getUtilitiesProviders = catchAsync(async (req, res) => {
  const utilityProvider = await paymentService.getUtilitiesProviders();
  const filteredCableUtilities = utilityProvider.response.merchants.filter(
    (utility) => utility.name === 'DStv' || utility.name === 'GOtv' || utility.name === 'Startimes'
  );
  const filteredElectricityUtilities = utilityProvider.response.merchants.filter(
    (utility) =>
      utility.displayName === 'Ikeja Electric' ||
      utility.displayName === 'Eko Electricity (EKEDC)' ||
      utility.displayName === 'PHED' ||
      utility.displayName === 'KEDCO' ||
      utility.displayName === 'AEDC' ||
      utility.displayName === 'Jos Electricity Distribution (JED)' ||
      utility.displayName === 'Ibadan Electricity Distribution Company' ||
      utility.displayName === 'Enugu Disco' ||
      utility.displayName === 'Kaduna Electric'
  );
  const cableSubUtility = [];
  const referenceNumber = req.query.referenceNumber ? req.query.referenceNumber : generateRandomChar(10, 'num');
  const promise = filteredCableUtilities.map(async (cable) => {
    const cableUtility = {};
    cableUtility.name = cable.name;
    cableUtility.displayName = cable.displayName;
    cableUtility.uuid = cable.uuid;
    const providers = await paymentService.getUtilitiesProvidersServices(cable.uuid, referenceNumber);
    cableUtility.services = providers.response.services;
    cableSubUtility.push(cableUtility);
  });
  const electricitySubUtility = [];
  const promise2 = filteredElectricityUtilities.map(async (electricity) => {
    const electricityUtility = {};
    electricityUtility.name = electricity.name;
    electricityUtility.displayName = electricity.displayName;
    electricityUtility.uuid = electricity.uuid;
    const providers = await paymentService.getUtilitiesProvidersServices(electricity.uuid, referenceNumber);
    electricityUtility.services = providers.response.services;
    electricitySubUtility.push(electricityUtility);
  });
  await Promise.all(promise);
  await Promise.all(promise2);
  const utilities = {};
  utilities.cableSubscription = cableSubUtility;
  utilities.electricitySubscription = electricitySubUtility;
  res.send(utilities);
});

const getMobileOperators = catchAsync(async (req, res) => {
  const mobileOperators = await paymentService.getMobileOperators();
  const mobileOperatorServices = [];
  const promise = mobileOperators.response.mobileOperator.map(async (operator) => {
    const mobileOperator = {};
    mobileOperator.name = operator.name;
    mobileOperator.mobileOperatorCode = operator.mobileOperatorCode;
    const providers = await paymentService.getDataBundles(operator.mobileOperatorCode);
    mobileOperator.services = providers.response.mobileOperatorServices;
    mobileOperatorServices.push(mobileOperator);
  });
  await Promise.all(promise);
  const mobileOperatorServicesObject = mobileOperatorServices.reduce((obj, item) => {
    obj[item.name] = item;
    return obj;
  }, {});
  res.send(mobileOperatorServicesObject);
});

const getTransactionOverview = catchAsync(async (req, res) => {
  const filterForCurrentPeriod = {
    createdAt:
      req.query.period === 'week'
        ? {
            $gte: moment().subtract(7, 'days').startOf('day').toDate(),
            $lte: moment().endOf('day').toDate(),
          }
        : req.query.period === 'month'
        ? { $gte: moment().subtract(30, 'days').startOf('day').toDate(), $lte: moment().endOf('day').toDate() }
        : req.query.period === 'year'
        ? { $gte: moment().subtract(365, 'days').startOf('day').toDate(), $lte: moment().endOf('day').toDate() }
        : req.query.period === 'today'
        ? { $gte: moment().startOf('D').toDate(), $lte: moment().endOf('D').toDate() }
        : null,
  };
  const currentTransactions = await paymentService.getTransactions(filterForCurrentPeriod, {}, req.user, false);
  if (!currentTransactions) throw new ApiError(httpStatus.NOT_FOUND, 'No transactions found');
  const calculateTransaction = (previousPeriodTransaction, currentPeriodTransaction) => {
    const transactionOverview = {};
    const previousPeriodCreditTransactions = previousPeriodTransaction.filter(
      (transaction) => transaction.type === TRANSACTION_TYPES.CREDIT
    );
    const previousPeriodDebitTransactions = previousPeriodTransaction.filter(
      (transaction) => transaction.type === TRANSACTION_TYPES.DEBIT
    );

    const currentPeriodCreditTransactions = currentPeriodTransaction.filter(
      (transaction) => transaction.type === TRANSACTION_TYPES.CREDIT
    );
    const currentPeriodDebitTransactions = currentPeriodTransaction.filter(
      (transaction) => transaction.type === TRANSACTION_TYPES.DEBIT
    );

    const totalDebitAmountPreviousPeriod =
      previousPeriodDebitTransactions.length > 0
        ? previousPeriodDebitTransactions.reduce((acc, cur) => acc + cur.amount, 0)
        : 0;
    const totalCreditAmountPreviousPeriod =
      previousPeriodCreditTransactions.length > 0
        ? previousPeriodCreditTransactions.reduce((acc, cur) => acc + cur.amount, 0)
        : 0;

    const currentPeriodCreditAmount = currentPeriodCreditTransactions.reduce((acc, cur) => acc + cur.amount, 0);
    const currentPeriodDebitAmount = currentPeriodDebitTransactions.reduce((acc, cur) => acc + cur.amount, 0);
    const percentageChangeForMoneyIn = Math.round((currentPeriodCreditAmount / totalCreditAmountPreviousPeriod) * 100);
    const percentageChangeForMoneyOut = Math.round((currentPeriodDebitAmount / totalDebitAmountPreviousPeriod) * 100);
    const profit = currentPeriodCreditAmount - currentPeriodDebitAmount;
    transactionOverview.moneyIn = Number(currentPeriodCreditAmount.toFixed(2));
    transactionOverview.moneyOut = Number(currentPeriodDebitAmount.toFixed(2));
    transactionOverview.percentageChangeForMoneyIn = percentageChangeForMoneyIn;
    transactionOverview.percentageChangeForMoneyOut = percentageChangeForMoneyOut;
    transactionOverview.profit = Number(profit.toFixed(2));
    return transactionOverview;
  };
  let duration;
  if (req.query.period === 'today') duration = 1;
  if (req.query.period === 'week') duration = 7;
  if (req.query.period === 'month') duration = 30;
  if (req.query.period === 'year') duration = 365;

  const previousTransaction = {
    createdAt: {
      $gte: moment()
        .subtract(duration * 2, 'days')
        .startOf('day')
        .toDate(),
      $lte: moment().subtract(duration, 'days').endOf('day').toDate(),
    },
  };
  const transactionsThatHappenedPreviously = await paymentService.getTransactions(previousTransaction, {}, req.user, false);
  const transactionOverview = calculateTransaction(transactionsThatHappenedPreviously, currentTransactions);
  res.send(transactionOverview);
});

const getStartimesUtilities = catchAsync(async (req, res) => {
  const startimesUtilities = await paymentService.getUtilitiesProvidersServices(req.query.uuid, req.query.referenceNumber);
  const startTimesPayload = {};
  startTimesPayload.name = 'Startimes';
  startTimesPayload.displayName = 'Startimes';
  startTimesPayload.uuid = req.query.uuid;
  startTimesPayload.services = startimesUtilities.response.services;
  res.send(startTimesPayload);
});

const submitReport = catchAsync(async (req, res) => {
  req.body.user = req.user.id;
  req.body.createdAt = moment().format();
  req.body.email = req.user.email;
  const report = await Report.create(req.body);
  res.status(httpStatus.CREATED).send(report);
});

const getReports = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['user', 'email', 'status']);
  filter.deletedAt = null;
  const reports = await Report.find(filter);
  res.send(reports);
});

const updateReport = catchAsync(async (req, res) => {
  const update = { status: req.body.status, updatedAt: moment().format() };
  await Report.updateOne({ _id: req.params.reportId }, update);
  const report = await Report.findOne({ _id: req.params.reportId });
  res.send(report);
});

module.exports = {
  getAccountInfo,
  getBanks,
  creditAccount,
  withdrawMoney,
  transferMoney,
  validateAccount,
  getTransactions,
  billPayment,
  buyAirtime,
  validatePaymentCallback,
  purchaseUtilities,
  getUtilitiesProviders,
  getMobileOperators,
  buyData,
  getTransactionOverview,
  getStartimesUtilities,
  submitReport,
  getReports,
  updateReport,
};
