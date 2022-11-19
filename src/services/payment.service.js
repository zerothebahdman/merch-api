/* eslint-disable no-nested-ternary */
/* eslint-disable no-param-reassign */
const { createHash } = require('crypto');
const httpStatus = require('http-status');
const Flutterwave = require('flutterwave-node-v3');
const fetch = require('node-fetch');
const moment = require('moment');
const { paymentData } = require('../config/config');
const {
  Account,
  TransactionLog,
  ErrorTracker,
  RegulateTransaction,
  MerchroEarnings,
  TransactionDump,
} = require('../models');
const ApiError = require('../utils/ApiError');
const { addNotification } = require('../utils/notification');
const { Paga } = require('../utils/paga');
const { generateRandomChar, calculatePeriod } = require('../utils/helpers');
const config = require('../config/config');
const { CURRENCIES, TRANSACTION_SOURCES, TRANSACTION_TYPES } = require('../config/constants');
const userService = require('./user.service');
const invoiceService = require('./invoice.service');
const { emailService } = require('.');

// eslint-disable-next-line
// const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const flw = new Flutterwave(paymentData.flutter_public_key, paymentData.flutter_secret);

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
    const response = await flw.Transaction.verify({
      id: transactionId,
    });
    return response;
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

const updateBalance = async (balance, user, currency = 'naira') => {
  if (currency === 'naira') {
    const accountInfo = await Account.updateOne({ user }, { 'balance.naira': balance });
    return accountInfo;
  }
  if (currency === 'dollar') {
    const accountInfo = await Account.updateOne({ user }, { 'balance.dollar': balance });
    return accountInfo;
  }
};

const addToBalance = async (amount, user, currency = 'naira') => {
  let accountInfo = await Account.findOne({ user });
  if (accountInfo === null) {
    accountInfo = await Account.create({ user });
  }
  amount = Number(amount);
  let update = {};
  if (currency === 'naira') update = { 'balance.naira': accountInfo.balance.naira + amount, updatedAt: moment().format() };
  else if (currency === 'dollar')
    update = { 'balance.dollar': accountInfo.balance.dollar + amount, updatedAt: moment().format() };
  Object.assign(accountInfo, update);
  await accountInfo.save();
  return accountInfo;
};

const updateDebt = async (balance, user, currency = 'naira') => {
  if (currency === 'naira') {
    const accountInfo = await Account.updateOne({ user }, { 'debt.naira': balance });
    return accountInfo;
  }
  if (currency === 'dollar') {
    const accountInfo = await Account.updateOne({ user }, { 'debt.dollar': balance });
    return accountInfo;
  }
  throw new ApiError(httpStatus.BAD_REQUEST, 'Valid currency not found in request');
};

const transferMoney = async (user, body, actor) => {
  body.reference = generateRandomChar(16, 'num');
  const userAccount = await Account.findOne({ user, deletedAt: null }).populate('user');
  if (!userAccount) throw new ApiError(httpStatus.BAD_REQUEST, "Recipient's account not found");
  await addToBalance(Number(body.amount), userAccount.user);
  const dump = await TransactionDump.create({ data: body, user });
  // Store transaction
  await createTransactionRecord({
    user,
    source: TRANSACTION_SOURCES.USER_TRANSFER,
    type: TRANSACTION_TYPES.CREDIT,
    amount: Number(body.amount),
    purpose: body.purpose || null,
    createdBy: user,
    transactionDump: dump.id,
    reference: body.reference,
    meta: {
      accountNumber: userAccount.accountInfo.accountNumber,
      payerName: `${actor.firstName} ${actor.lastName}`,
      currency: 'NGN',
      fee: 0,
      message: 'Transfer within Merchro (Charge: 0)',
      reference: body.reference,
    },
  });
  const message = `NGN${body.amount} was credited to your Merchro wallet by ${actor.firstName} ${actor.lastName}`;
  emailService.creditEmail(userAccount.user.email, userAccount.user.firstName, message);
  const response = {
    reference: body.reference,
    accountNumber: userAccount.accountInfo.accountNumber,
    email: userAccount.user.email,
    destinationAccountHolderNameAtBank: `${userAccount.user.firstName} ${userAccount.user.lastName}`,
    currency: 'NGN',
    fee: 0,
    message: 'Transfer within Merchro (Charge: 0)',
  };
  return { response };
};

const withdrawMoney = async (body, actor) => {
  body.firstName = actor.firstName;
  body.lastName = actor.lastName;
  if (body.bankId === 'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA') {
    // Check if account exist on Merchro
    const userAccount = await Account.findOne({ 'accountInfo.accountNumber': body.accountNumber, deletedAt: null });
    if (userAccount) {
      const result = await transferMoney(userAccount.user, body, actor);
      return result;
    }
  }
  const withdrawal = await Paga.withdraw(body);
  if (withdrawal.error) throw new ApiError(httpStatus.BAD_REQUEST, withdrawal.response.message);
  return withdrawal;
};

const buyAirtime = async (body) => {
  const airtime = await Paga.airtimeTopup(body);
  if (airtime.error) throw new ApiError(httpStatus.BAD_REQUEST, airtime.response.message);
  return airtime;
};

const purchaseUtilities = async (body) => {
  const validateCustomer = await Paga.validateCustomerReference(body);
  if (validateCustomer.error) throw new ApiError(httpStatus.BAD_REQUEST, validateCustomer.response.message);
  const utility = await Paga.purchaseUtility(body);
  if (utility.error) throw new ApiError(httpStatus.BAD_REQUEST, utility.response.message);
  return utility;
};

const getUtilitiesProviders = async () => {
  const utilities = await Paga.getUtilitiesProviders();
  if (utilities.error) throw new ApiError(httpStatus.BAD_REQUEST, utilities.response.errorMessage);
  return utilities;
};

const getUtilitiesProvidersServices = async (merchantId, referenceNumber) => {
  const utilities = await Paga.getUtilitiesProvidersServices(merchantId, referenceNumber);
  if (utilities.error) throw new ApiError(httpStatus.BAD_REQUEST, utilities.response.errorMessage);
  return utilities;
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

const getMobileOperators = async () => {
  const operators = await Paga.getMobileOperators();
  if (operators.error) throw new ApiError(httpStatus.BAD_REQUEST, operators.response.message);
  return operators;
};

const getDataBundles = async (operatorId) => {
  const bundles = await Paga.getDataBundles(operatorId);
  if (bundles.error) throw new ApiError(httpStatus.BAD_REQUEST, bundles.response.message);
  return bundles;
};

const createMerchroEarningsRecord = async (transactionData) => {
  const transaction = await MerchroEarnings.create({ ...transactionData });
  return transaction;
};

const buyData = async (data) => {
  data.referenceNumber = generateRandomChar(16, 'num');
  data.currency = 'NGN';
  try {
    const hash = await createHash('sha512')
      .update(`${data.referenceNumber}${data.amount}${data.destinationPhoneNumber}${config.paymentData.paga_key}`)
      .digest('hex');
    const pagaResponse = await fetch(`${paymentData.paga_url}/airtimePurchase`, {
      headers: {
        credentials: paymentData.paga_secret,
        principal: paymentData.paga_public_key,
        hash,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        ...data,
      }),
    });
    const response = await pagaResponse.json();
    if (response.error) throw new ApiError(httpStatus.BAD_REQUEST, response.response.message);
    return response;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
};

const initiateRecurringPayment = async (paymentLink, client) => {
  try {
    /**
     * 1. add a 2% charge of the original amount to the amount to be paid
     * 2. charge the user
     * 3. if the charge is successful, save the transaction record
     * 4. Add the amount paid to the creator's wallet
     * 5. Updated the subscription record for the client to prepare for the next payment
     */

    // const amountCharge = (2 / 100) * paymentLink.amount + paymentLink.amount;

    const chargeBody = {
      tx_ref: `tx-${generateRandomChar(10, 'lower-num')}`,
      amount: Number(paymentLink.amount),
      currency: 'NGN',
      country: 'NG',
      email: client.clientEmail,
      token: client.card.token,
      narration: `Payment for ${client.subscriptionDetails.interval} ${paymentLink.pageName} subscription`,
    };
    const charge = (Number(config.paymentProcessing.invoiceProcessingCharge) / 100) * paymentLink.amount;
    const processingCost = (Number(config.paymentProcessing.invoiceProcessingCost) / 100) * paymentLink.amount;
    const profit = charge - processingCost;
    const initiateCharge = await flw.Tokenized.charge(chargeBody);
    if (initiateCharge.status === 'success') {
      const creator = await userService.getUserById(paymentLink.creator);
      const transaction = await createTransactionRecord({
        user: creator._id,
        source: TRANSACTION_SOURCES.PAYMENT_LINK,
        type: TRANSACTION_TYPES.CREDIT,
        amount: Number(paymentLink.amount),
        purpose: `Payment for ${client.subscriptionDetails.interval} ${paymentLink.pageName} subscription`,
        createdBy: client._id,
        reference: `#PL_${generateRandomChar(5, 'num')}`,
        meta: {
          user: client._id,
          payerName: `${client.subscriptionDetails.interval} Subscription / ${client.clientFirstName} ${client.clientLastName}`,
          email: client.clientEmail,
          currency: CURRENCIES.NAIRA,
        },
      });

      await createMerchroEarningsRecord({
        user: creator._id,
        source: TRANSACTION_SOURCES.PAYMENT_LINK,
        amount: Number(paymentLink.amount),
        charge,
        profit,
        transaction: transaction._id,
        amountSpent: Math.round(processingCost),
      });

      addToBalance(Number(paymentLink.amount) - charge, client._id);
      const { interval, frequency } = paymentLink.recurringPayment;
      const nextChargeDate = calculatePeriod(interval);
      const updateBody = {
        subscriptionDetails: {
          lastChargeDate: moment().toDate(),
          nextChargeDate,
          frequency,
          interval,
          timesBilled: frequency > 0 ? client.subscriptionDetails.timesBilled + 1 : 0,
        },
      };
      await invoiceService.updateCreatorClient(client._id, { ...updateBody });
    }
  } catch (error) {
    throw new ApiError(error.status, error.message);
  }
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
  transferMoney,
  withdrawMoney,
  buyAirtime,
  controlTransaction,
  logError,
  purchaseUtilities,
  getUtilitiesProviders,
  getUtilitiesProvidersServices,
  validatePayment,
  getMobileOperators,
  getDataBundles,
  buyData,
  initiateRecurringPayment,
  createMerchroEarningsRecord,
};
