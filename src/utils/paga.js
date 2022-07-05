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
    const response = await paga.airtimePurchase(data.reference, data.amount, data.currency, data.phoneNumber, data.source);
    return response;
  },
  withdraw: async () => {
    const reference = generateRandomChar(16, 'num');
    const paga = await Paga.initPagaBusiness();
    const response = await paga.depositToBank(
      reference,
      '100.00',
      'NGN',
      '8B9CCA8B-F092-4704-82FD-B82D2B9A1993',
      '3064380707',
      '',
      '',
      'heclassy@gmail.com',
      '',
      '',
      'true',
      `Merchro/Adebowale Adebusuyi/${reference}`,
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
};

module.exports = {
  Paga,
};
