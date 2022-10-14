/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const fetch = require('node-fetch');
const moment = require('moment');
const { paymentData } = require('../config/config');
const { Account, TransactionLog, ErrorTracker, RegulateTransaction } = require('../models');
const ApiError = require('../utils/ApiError');
const { addNotification } = require('../utils/notification');
const { Paga } = require('../utils/paga');

// eslint-disable-next-line
// const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

/**
 * Payment API - Get payment link
 * @param {string} base64File
 * @param {string} folder
 * @returns {Promise}
 */
const getPaymentLink = async (paymentBody, redirectUrl) => {
  try {
    const response = await fetch(`${paymentData.flutter_url}/payments`, {
      headers: {
        Authorization: `Bearer ${paymentData.flutter_secret}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        ...paymentBody,
        redirect_url: redirectUrl,
      }),
    });
    const data = await response.json();
    return data.data.link;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
  }
};

const validatePayment = async (transactionId) => {
  try {
    const response = await fetch(`${paymentData.flutter_url}/transactions/${transactionId}/verify`, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${paymentData.flutter_secret}` },
      method: 'GET',
    });
    return await response.json();
  } catch (error) {
    throw new ApiError(error.status, error.message);
  }
};

// Fetch account info by the ID of user
const queryAccountInfoByUser = async (user) => {
  const accountInfo = await Account.findOne({ user });
  return accountInfo;
};

// Fetch account info by the account reference of user
const queryAccountInfoByReference = async (reference) => {
  const accountInfo = await Account.findOne({ 'accountInfo.referenceNumber': reference });
  return accountInfo;
};

// Create unique account nummber for each Merchro creator.
const setupAccount = async (userData) => {
  const data = {
    firstName: userData.firstName,
    lastName: userData.lastName,
    accountName: `${userData.firstName} ${userData.lastName}`,
    phoneNumber: `${userData.countryCode ? userData.countryCode : '+234'}${userData.phoneNumber}`,
  };
  const accountInfo = await Paga.generatePermanentAccount(data);
  if (!accountInfo.error) {
    const accountData = await Account.create({
      user: userData.id,
      accountInfo: {
        accountNumber: accountInfo.response.accountNumber,
        referenceNumber: accountInfo.response.referenceNumber,
        accountReference: accountInfo.response.accountReference,
        accountName: data.accountName,
        bankName: 'Paga',
        callbackUrl: accountInfo.response.callbackUrl,
      },
    });
    addNotification('A dedicated bank account was activated for you.', userData.id);
    addNotification(
      'You can now fund your Merchro wallet, receive money and send money through your personal bank account',
      userData.id
    );
    return accountData;
  }
  addNotification(
    `Could not generate a dedicated bank account for you due to ${accountInfo.response.statusMessage}. Update your profile and your dedicated bank account will be generated within 24hours`,
    userData.id
  );
  throw new ApiError(
    httpStatus.BAD_REQUEST,
    `Could not generate a dedicated bank account for you due to ${accountInfo.response.statusMessage}. Update your profile to get your dedicated bank account`
  );
};

const createTransactionRecord = async (transactionData) => {
  const transaction = await TransactionLog.create({ ...transactionData });
  return transaction;
};

const getTransactions = async (filter, options, actor, paginate = true) => {
  if (actor) filter.user = actor.id;
  filter.deletedBy = null;
  const result = !paginate
    ? await TransactionLog.find(filter).populate(options.populate || '')
    : await TransactionLog.paginate(filter, options);
  return result;
};

const updateBalance = async (balance, user) => {
  const accountInfo = await Account.updateOne({ user }, { balance });
  return accountInfo;
};

const addToBalance = async (amount, user) => {
  let accountInfo = await Account.findOne({ user });
  if (accountInfo === null) {
    accountInfo = await Account.create({ user });
  }
  amount = Number(amount);
  const update = { balance: accountInfo.balance + amount, updatedAt: moment().format() };
  Object.assign(accountInfo, update);
  accountInfo.save();
  return accountInfo;
};

const updateDebt = async (balance, user) => {
  const accountInfo = await Account.updateOne({ user }, { debt: balance });
  return accountInfo;
};

const withdrawMoney = async (body, actor) => {
  body.firstName = actor.firstName;
  body.lastName = actor.lastName;
  const withdrawal = await Paga.withdraw(body);
  if (withdrawal.error) throw new ApiError(httpStatus.BAD_REQUEST, withdrawal.response.message);
  return withdrawal;
};

const buyAirtime = async (body) => {
  const airtime = await Paga.airtimeTopup(body);
  if (airtime.error) throw new ApiError(httpStatus.BAD_REQUEST, airtime.response.message);
  return airtime;
};

const controlTransaction = async (body) => {
  // check prior record of transaction
  const exist = await RegulateTransaction.findOne({ idempotentKey: body.idempotentKey });
  if (exist) return false;
  await RegulateTransaction.create({ idempotentKey: body.idempotentKey });
  return true;
};

const logError = async (error) => {
  await ErrorTracker.create({ error });
  return true;
};

module.exports = {
  queryAccountInfoByUser,
  queryAccountInfoByReference,
  getPaymentLink,
  setupAccount,
  createTransactionRecord,
  getTransactions,
  updateBalance,
  addToBalance,
  updateDebt,
  withdrawMoney,
  buyAirtime,
  controlTransaction,
  logError,
  validatePayment,
};
