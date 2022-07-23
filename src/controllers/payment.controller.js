const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { paymentService, emailService, userService } = require('../services');
const { TRANSACTION_TYPES, TRANSACTION_SOURCES } = require('../config/constants');
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

  const accountInfo = await paymentService.queryAccountInfoByReference(reference);

  const transactionDump = await TransactionDump.create({ data, user: accountInfo.user || null });

  const updatedBalance = Number((accountInfo.balance + Number(data.amount)).toFixed(2));

  await paymentService.updateBalance(updatedBalance, accountInfo.user);

  // Confirm that there is no prior log of this particular transaction
  const getTransactions = await paymentService.getTransactions(
    {
      reference: { $eq: data.transactionReference },
    },
    '',
    { id: accountInfo.user },
    true
  );
  if (getTransactions.results.length > 0) {
    return res.send({ status: 'SUCCESS', message: 'Already logged' });
  }
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
      accountNumber: data.accountNumber,
      accountName: data.accountName,
    },
  };

  await paymentService.createTransactionRecord(transactionData);

  const message = `NGN${data.amount} was credited to your account (${data.payerDetails.payerName}/${data.payerDetails.payerBankName})`;
  const user = await userService.getUserById(accountInfo.user);

  emailService.creditEmail(user.email, user.firstName, message);

  addNotification(message, accountInfo.user);
  res.send({ status: 'SUCCESS' });
});

const withdrawMoney = catchAsync(async (req, res) => {
  const accountInfo = await paymentService.queryAccountInfoByUser(req.user.id);
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
        phoneNumber: req.body.phoneNumber,
        message: airtimeResponse.response.message,
        reference: airtimeResponse.response.reference,
      },
    });
    res.send(transaction);
  } else throw new ApiError(httpStatus.BAD_REQUEST, 'Insufficient balance');
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
};
