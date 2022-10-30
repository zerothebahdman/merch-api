/* eslint-disable no-param-reassign */
const PagaBusiness = require('paga-business');
const PagaCollect = require('paga-collect');
const { paymentData, baseApiUrl } = require('../config/config');
const Bank = require('../models/bank.model');
const { generateRandomChar } = require('./helpers');

const Paga = {
  initPagaCollect: async () => {
    return new PagaCollect()
      .setClientId(paymentData.paga_public_key)
      .setPassword(paymentData.paga_secret)
      .setApiKey(paymentData.paga_key)
      .setTest(false)
      .build();
  },
  initPagaBusiness: async () => {
    return new PagaBusiness()
      .setPrincipal(paymentData.paga_public_key)
      .setCredential(paymentData.paga_secret)
      .setApiKey(paymentData.paga_key)
      .setIsTest(false)
      .build();
  },
  generatePermanentAccount: async (data) => {
    const paga = await Paga.initPagaCollect();
    data.referenceNumber = generateRandomChar(16, 'num');
    data.accountReference = generateRandomChar(24, 'num');
    data.currency = 'NGN';
    data.callbackUrl = `${baseApiUrl}/v1/payments/funding/${data.referenceNumber}`;
    const accountInfo = await paga.registerPersistentPaymentAccount(data);
    if (!accountInfo.error) accountInfo.response.callbackUrl = data.callbackUrl;
    return accountInfo;
  },
  generateInstantPaymentAccount: async () => {
    const paga = await Paga.initPagaCollect();
    const data = {
      referenceNumber: generateRandomChar(16, 'num'),
      accountReference: generateRandomChar(24, 'num'),
      phoneNumber: '+2348065348400',
      firstName: 'Adebowale',
      lastName: 'Adebusuyi',
      accountName: 'Adebowale Adebusuyi',
      email: 'heclassy@gmail.com',
      currency: 'NGN',
    };
    data.callbackUrl = `${baseApiUrl}/v1/payments/funding/${data.referenceNumber}`;
    const accountInfo = await paga.registerPersistentPaymentAccount(data);
    return accountInfo;
  },
  airtimeTopup: async (data) => {
    const paga = await Paga.initPagaBusiness();
    const response = await paga.airtimePurchase(generateRandomChar(16, 'num'), data.amount, 'NGN', data.phoneNumber);
    return response;
  },
  checkAccount: async (data) => {
    const reference = generateRandomChar(16, 'num');
    const paga = await Paga.initPagaBusiness();
    const response = await paga.validateDepositToBank(reference, '1', 'NGN', data.bankId, data.accountNumber);
    return response;
  },
  withdraw: async (data) => {
    const reference = generateRandomChar(16, 'num');
    const paga = await Paga.initPagaBusiness();
    const response = await paga.depositToBank(
      reference,
      data.amount,
      'NGN',
      data.bankId,
      data.accountNumber,
      '',
      '',
      `${generateRandomChar(16, 'lower')}@merchro.com`,
      '',
      '',
      'true',
      `Merchro/${data.firstName} ${data.lastName}/${reference}`,
      ''
    );
    return response;
  },
  balance: async (data) => {
    const paga = await Paga.initPagaBusiness();
    const response = await paga.accountBalance(data.reference);
    return response;
  },
  getBanks: async () => {
    const paga = await Paga.initPagaBusiness();
    const response = await paga.getBanks(generateRandomChar(8, 'num'));
    if (!response.error) {
      await Bank.deleteMany({ name: { $ne: null } });
      await Bank.insertMany(response.response.banks);
    }
    return response.response.banks;
  },
  purchaseUtility: async (data) => {
    const paga = await Paga.initPagaBusiness();
    const response = await paga.merchantPayment(
      data.merchantNumber,
      data.amount,
      data.merchant,
      generateRandomChar(16, 'num'),
      'NGN',
      data.merchantServiceProductCode
    );
    return response;
  },

  getUtilitiesProviders: async () => {
    const paga = await Paga.initPagaBusiness();
    const response = await paga.getMerchants(generateRandomChar(8, 'num'));
    return response;
  },
  getUtilitiesProvidersServices: async (merchantId, referenceNumber) => {
    const paga = await Paga.initPagaBusiness();
    const response = await paga.getMerchantServices(referenceNumber, merchantId);
    return response;
  },

  getMobileOperators: async () => {
    const paga = await Paga.initPagaBusiness();
    const response = await paga.getMobileOperators(generateRandomChar(8, 'num'));
    return response;
  },

  getDataBundles: async (operatorId) => {
    const paga = await Paga.initPagaBusiness();
    const response = await paga.getDataBundleByOperator(generateRandomChar(8, 'num'), operatorId);
    return response;
  },

  buyDataBundle: async (data) => {
    const paga = await Paga.initPagaBusiness();
    data.currency = 'NGN';
    // data.merchantService = data.mobileOperatorServiceId;
    const response = await paga.airtimePurchase(
      generateRandomChar(16, 'num'),
      data.amount,
      'NGN',
      data.destinationPhoneNumber,
      data.mobileOperatorServiceId,
      data.isDataBundle
    );
    return response;
  },

  validateCustomerReference: async (data) => {
    const paga = await Paga.initPagaBusiness();
    const response = await paga.getMerchantAccountDetails(
      generateRandomChar(8, 'num'),
      data.merchant,
      data.merchantNumber,
      data.merchantServiceProductCode
    );
    return response;
  },
};

module.exports = {
  Paga,
};
