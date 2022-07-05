const httpStatus = require('http-status');
const fetch = require('node-fetch');
const { paymentInfo } = require('../config/config');
const { Account, Transaction } = require('../models');
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
const getPaymentLink = async (paymentBody, pageSlug) => {
  const redirectUrl = paymentInfo.redirect_url.replace('{slug}', pageSlug);
  try {
    const response = await fetch(`${paymentInfo.url}/payments`, {
      headers: {
        Authorization: `Bearer ${paymentInfo.secret}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        ...paymentBody,
        redirect_url: redirectUrl,
        customizations: {
          title: 'Merchro Pay',
          logo: 'https://www.merchro.com/logo-black.svg',
        },
      }),
    });
    const data = await response.json();
    return data.data.link;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
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
  await Transaction.create({ ...transactionData });
  return true;
};

const updateBalance = async (balance, user) => {
  const accountInfo = await Account.updateOne({ user }, { balance });
  return accountInfo;
};

const updateDebt = async (balance, user) => {
  const accountInfo = await Account.updateOne({ user }, { debt: balance });
  return accountInfo;
};

const withdrawMoney = async () => {
  const withdrawal = await Paga.withdraw();
  return withdrawal;
};

module.exports = {
  queryAccountInfoByUser,
  queryAccountInfoByReference,
  getPaymentLink,
  setupAccount,
  createTransactionRecord,
  updateBalance,
  updateDebt,
  withdrawMoney,
};
