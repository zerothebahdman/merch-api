/* eslint-disable no-param-reassign */
const PagaBusiness = require('paga-business');
const PagaCollect = require('paga-collect');
const config = require('../config/config');
const { paymentData, baseApiUrl } = require('../config/config');
const Bank = require('../models/wallet/bank.model');
const { generateRandomChar } = require('./helpers');

const Paga = {
  initPagaCollect: async () => {
    return new PagaCollect()
      .setClientId(paymentData.paga_public_key)
      .setPassword(paymentData.paga_secret)
      .setApiKey(paymentData.paga_key)
      .setTest(true)
      .build();
  },
  initPagaBusiness: async () => {
    return new PagaBusiness()
      .setPrincipal(paymentData.paga_public_key)
      .setCredential(paymentData.paga_secret)
      .setApiKey(paymentData.paga_key)
      .setIsTest(true)
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
  generateInstantPaymentAccount: async (payload) => {
    const paga = await Paga.initPagaCollect();
    const data = {
      referenceNumber: generateRandomChar(16, 'num'),
      accountReference: generateRandomChar(24, 'num'),
      phoneNumber: payload.phoneNumber,
      firstName: payload.firstName,
      lastName: payload.lastName,
      accountName: `${payload.lastName} ${payload.firstName}`,
      email: payload.email,
      currency: 'NGN',
    };
    data.callbackUrl = `${baseApiUrl}/v1/payments/funding/${data.referenceNumber}`;
    const accountInfo = await paga.registerPersistentPaymentAccount(data);
    return accountInfo;
  },
  airtimeTopup: async (data) => {
    if (config.environment === 'production') {
      const paga = await Paga.initPagaBusiness();
      const response = await paga.airtimePurchase(generateRandomChar(16, 'num'), data.amount, 'NGN', data.phoneNumber);
      return response;
    }
    const response = {
      referenceNumber: data.phoneNumber,
      message: 'Airtime purchase request made successfully',
      responseCode: 0,
      transactionId: 'At34',
      fee: 50.0,
      currency: null,
      exchangeRate: null,
    };
    return { response };
  },
  checkAccount: async (data) => {
    const reference = generateRandomChar(16, 'num');
    const paga = await Paga.initPagaBusiness();
    const response = await paga.validateDepositToBank(reference, '1', 'NGN', data.bankId, data.accountNumber);
    return response;
  },
  withdraw: async (data) => {
    if (config.environment === 'production') {
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
    }

    const checkAccount = await Paga.checkAccount({ bankId: data.bankId, accountNumber: data.accountNumber });
    const response = {
      error: false,
      response: {
        responseCode: 0,
        responseCategoryCode: null,
        message: `Successfully deposited N${data.amount} to ${data.accountNumber}. Transaction Id: ${generateRandomChar(
          5,
          'num'
        )}.`,
        referenceNumber: generateRandomChar(16, 'num'),
        transactionId: generateRandomChar(6, 'num'),
        currency: 'NGN',
        exchangeRate: null,
        fee: 53.75,
        sessionId: generateRandomChar(16, 'num'),
        vat: 3.75,
        destinationAccountHolderNameAtBank: checkAccount.response.destinationAccountHolderNameAtBank,
      },
    };
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
    if (config.environment === 'production') {
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
    }
    const response = {
      responseCode: 0,
      message: `You have successfully paid N${data.amount} to  for acct ${data.merchantNumber}. Token: ${generateRandomChar(
        10,
        'num'
      )}. Paga TxnID: DWV0P`,
      reference: generateRandomChar(16, 'num'),
      merchantTransactionReference: data.merchantNumber,
      transactionId: 'DWV0P',
      currency: 'NGN',
      exchangeRate: null,
      fee: 0.0,
      commissionEarned: 12.0,
      integrationStatus: 'SUCCESSFUL',
      additionalProperties: {
        unitType: '',
        totalPayment: '',
        debtBefore: '',
        customerAccountNumber: '',
        units: '',
        debtPayment: '',
        paymentDate: '',
        meterSerial: '',
        customerName: '',
        receiptNumber: '',
        vat: '',
        token: '',
      },
    };
    return { response };
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
    if (config.environment === 'production') {
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
    }
    const response = {
      referenceNumber: data.destinationPhoneNumber,
      message: 'Data purchase request made successfully',
      responseCode: 0,
      transactionId: 'At34',
      fee: 50.0,
      currency: null,
      exchangeRate: null,
    };
    return { response };
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
