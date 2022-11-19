const Joi = require('joi');
const { objectId } = require('./custom.validation');
// const { objectId } = require('./custom.validation');

const validateAccount = {
  body: Joi.object().keys({
    bankId: Joi.string().required(),
    accountNumber: Joi.string().required(),
  }),
};

const withdrawal = {
  body: Joi.object().keys({
    amount: Joi.string().required(),
    idempotentKey: Joi.string().min(16).required(),
    bankId: Joi.string().required(),
    accountNumber: Joi.string().required(),
    purpose: Joi.string(),
  }),
};

const buyAirtime = {
  body: Joi.object().keys({
    amount: Joi.string().required(),
    phoneNumber: Joi.string().required(),
  }),
};

const buyData = {
  body: Joi.object().keys({
    amount: Joi.string().required(),
    destinationPhoneNumber: Joi.string().required(),
    isDataBundle: Joi.boolean().required(),
    mobileOperatorServiceId: Joi.number().required(),
  }),
};

const getTransactions = {
  query: Joi.object().keys({
    type: Joi.string(),
    user: Joi.string(),
    source: Joi.string(),
    startDate: Joi.string(),
    endDate: Joi.string(),
    page: Joi.string().default(1),
    limit: Joi.string().default(10),
    sortBy: Joi.string(),
    paginate: Joi.boolean().default(true),
    include: Joi.array(),
  }),
};

const purchaseUtilities = {
  body: Joi.object().keys({
    amount: Joi.string().required(),
    merchantNumber: Joi.string().required(),
    merchantServiceProductCode: Joi.string().required(),
    merchant: Joi.string().required(),
    utilityType: Joi.string().required(),
  }),
};

const getUtilitiesProvidersServices = {
  body: Joi.object().keys({
    merchantId: Joi.string(),
    referenceNumber: Joi.string(),
  }),
};

const validatePaymentCallback = {
  body: Joi.object().keys({
    status: Joi.string().required(),
    transactionId: Joi.string().required(),
    txRef: Joi.string().required(),
    idempotentKey: Joi.string().required(),
  }),
};

const submitReport = {
  body: Joi.object().keys({
    transaction: Joi.custom(objectId).required(),
    reason: Joi.string().required(),
    info: Joi.string().required(),
  }),
};

const updateReport = {
  body: Joi.object().keys({
    status: Joi.string().required().valid('active', 'resolved'),
  }),
};

module.exports = {
  validateAccount,
  withdrawal,
  buyAirtime,
  getTransactions,
  validatePaymentCallback,
  purchaseUtilities,
  getUtilitiesProvidersServices,
  buyData,
  submitReport,
  updateReport,
};
