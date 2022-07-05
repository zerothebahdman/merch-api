const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { paymentService } = require('../services');
const { TRANSACTION_TYPES, TRANSACTION_SOURCES } = require('../config/constants');
const { TransactionDump } = require('../models');
const { addNotification } = require('../utils/notification');
const ApiError = require('../utils/ApiError');
const Bank = require('../models/bank.model');
const { Paga } = require('../utils/paga');

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

const creditAccount = catchAsync(async (req) => {
  const { reference } = req.params;
  let data = {};
  if (req.query && req.query.statusCode === '0') {
    data = { ...req.query };
  } else if (req.body && req.body.statusCode === '0') data = { ...req.body };

  TransactionDump.create({ data });

  const accountInfo = await paymentService.queryAccountInfoByReference(reference);
  const updatedBalance = Number((Number(accountInfo.balance) + Number(data.amount)).toFixed(2));

  await paymentService.updateBalance(updatedBalance, accountInfo.user);

  const transactionData = {
    amount: Number(data.amount),
    type: TRANSACTION_TYPES.CREDIT,
    source: TRANSACTION_SOURCES.BANK_TRANSFER,
    user: accountInfo.user,
    meta: { ...data },
    createdBy: accountInfo.user,
  };

  await paymentService.createTransactionRecord(transactionData);

  addNotification(
    `NGN${data.amount} was credited to your account (${data.payerDetails.payerName}/${data.payerDetails.payerBankName}`,
    accountInfo.user
  );
});

const withdrawMoney = catchAsync(async (req, res) => {
  const accountInfo = await paymentService.queryAccountInfoByUser(req.user.id);
  if (!accountInfo) throw new ApiError(httpStatus.FORBIDDEN, 'You cannot make transfers until your account is fully setup');
  if (Number(req.body.amount) <= accountInfo.balance) {
    const updatedBalance = Number((accountInfo.balance - Number(req.body.amount)).toFixed(2));
    await paymentService.updateBalance(updatedBalance, accountInfo.user);
    const withdrawResponse = await paymentService.withdrawMoney(req.body);
    // Store transaction
    await paymentService.createTransactionRecord({
      user: accountInfo.user,
      source: TRANSACTION_SOURCES.SAVINGS,
      type: TRANSACTION_TYPES.DEBIT,
      amount: Number(req.body.amount),
      createdBy: accountInfo.user,
      meta: { ...withdrawResponse },
    });
    res.send(withdrawResponse);
  } else throw new ApiError(httpStatus.BAD_REQUEST, 'Insufficient balance');
});

const billPayment = catchAsync(async (req, res) => {
  const bill = await paymentService.billPayment();
  res.send(bill);
});

const buyAirtime = catchAsync(async (req, res) => {
  const bill = await paymentService.billPayment();
  res.send(bill);
});

module.exports = {
  getAccountInfo,
  getBanks,
  creditAccount,
  withdrawMoney,
  billPayment,
  buyAirtime,
};
