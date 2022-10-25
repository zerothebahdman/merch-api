/* eslint-disable no-nested-ternary */
/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const moment = require('moment');
const catchAsync = require('../utils/catchAsync');
const {
  paymentService,
  emailService,
  userService,
  orderService,
  chargeService,
  creatorPageService,
  merchService,
} = require('../services');
const { TRANSACTION_TYPES, TRANSACTION_SOURCES, ORDER_STATUSES, CURRENCIES } = require('../config/constants');
const { TransactionDump } = require('../models');
const ApiError = require('../utils/ApiError');
const Bank = require('../models/bank.model');
const { Paga } = require('../utils/paga');
const pick = require('../utils/pick');
const { addNotification } = require('../utils/notification');

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

  try {
    const accountInfo = await paymentService.queryAccountInfoByReference(reference);
    const transactionDump = await TransactionDump.create({ data, user: accountInfo.user || null });
    data.amount = data.amount.replaceAll(',', '');
    const updatedBalance = Number((accountInfo.balance + Number(data.amount)).toFixed(2));

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
      emailService.sendPaymentTrackingEmail(`
        Transaction record exists for this particular transaction with code ${data.transactionReference}
        <br>
        User: ${accountInfo.user || null}
        <br>
        Amount: New: ${data.amount}, Updated balance: ${updatedBalance}
      `);
      return res.send({ status: 'SUCCESS', message: 'Already logged' });
    }

    await paymentService.updateBalance(updatedBalance, accountInfo.user);

    const transactionData = {
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
    };

    await paymentService.createTransactionRecord(transactionData);

    const message = `NGN${data.amount} was credited to your account (${data.payerDetails.payerName}/${data.payerDetails.payerBankName})`;
    const user = await userService.getUserById(accountInfo.user);

    emailService.creditEmail(user.email, user.firstName, message);

    addNotification(message, accountInfo.user);
    res.send({ status: 'SUCCESS' });
  } catch (error) {
    paymentService.logError(error);
    res.send({ status: 'FAILED' });
  }
});

const withdrawMoney = catchAsync(async (req, res) => {
  const accountInfo = await paymentService.queryAccountInfoByUser(req.user.id);
  const proceed = await paymentService.controlTransaction(req.body);
  if (!proceed) throw new ApiError(httpStatus.BAD_REQUEST, 'Duplicate transaction, withdrawal already initialized');

  if (!accountInfo) throw new ApiError(httpStatus.FORBIDDEN, 'You cannot make transfers until your account is fully setup');
  if (Number(req.body.amount) <= accountInfo.balance) {
    const updatedBalance = Number((accountInfo.balance - Number(req.body.amount)).toFixed(2));
    const withdrawResponse = await paymentService.withdrawMoney(req.body, req.user);
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
        accountNumber: req.body.accountNumber,
        accountName: withdrawResponse.response.destinationAccountHolderNameAtBank,
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
  } else throw new ApiError(httpStatus.BAD_REQUEST, 'Insufficient balance');
});

const validateAccount = catchAsync(async (req, res) => {
  let account = await Paga.checkAccount(req.body);
  if (account.error) throw new ApiError(httpStatus.BAD_REQUEST, account.response.message);
  else
    account = {
      accountNumber: req.body.accountNumber,
      accountName: account.response.destinationAccountHolderNameAtBank,
      fee: account.response.fee,
      vat: account.response.vat,
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
  if (Number(req.body.amount) <= accountInfo.balance) {
    const updatedBalance = Number((accountInfo.balance - Number(req.body.amount)).toFixed(2));
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
        const creatorPage = await creatorPageService.queryCreatorPageById(order.creatorPage);
        const charge = await chargeService.saveCharge(amount, order.id, creator.id);
        amount -= charge;
        await paymentService.createTransactionRecord({
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

        paymentService.addToBalance(amount, creator.id);
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
        const link = `https://${creatorPage.slug}.merchro.store`;
        order.paymentStatus = ORDER_STATUSES.PICKUP;
        await emailService.sendUserOrderFulfillmentEmail(purchaser, order, link);
        res.send(order);
      }
    } else {
      // Inform the customer their payment was unsuccessful
      throw new ApiError(httpStatus.BAD_REQUEST, 'Payment was unsuccessful');
    }
  }
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
  const transactions = await paymentService.getTransactions(filterForCurrentPeriod, {}, req.user, false);
  if (!transactions) throw new ApiError(httpStatus.NOT_FOUND, 'No transactions found');
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
    transactionOverview.moneyIn = currentPeriodCreditAmount;
    transactionOverview.moneyOut = currentPeriodDebitAmount;
    transactionOverview.percentageChangeForMoneyIn = percentageChangeForMoneyIn;
    transactionOverview.percentageChangeForMoneyOut = percentageChangeForMoneyOut;
    transactionOverview.profit = profit;
    return transactionOverview;
  };
  let duration;
  if (req.query.period === 'today') duration = 1;
  if (req.query.period === 'week') duration = 7;
  if (req.query.period === 'month') duration = 30;
  if (req.query.period === 'year') duration = 365;

  const filterForLastWeek = {
    createdAt: {
      $gte: moment()
        .subtract(duration * 2, 'days')
        .startOf('day')
        .toDate(),
      $lte: moment().subtract(duration, 'days').endOf('day').toDate(),
    },
  };
  const transactionsThatHappenedLastWeek = await paymentService.getTransactions(filterForLastWeek, {}, req.user, false);
  const transactionOverview = calculateTransaction(transactionsThatHappenedLastWeek, transactions);
  res.send(transactionOverview);
});

module.exports = {
  getAccountInfo,
  getBanks,
  creditAccount,
  withdrawMoney,
  validateAccount,
  getTransactions,
  billPayment,
  buyAirtime,
  validatePaymentCallback,
  getTransactionOverview,
};
