const Joi = require('joi');
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

const getTransactions = {
  query: Joi.object().keys({
    type: Joi.string(),
    user: Joi.string(),
    source: Joi.string(),
    page: Joi.string().default(1),
    limit: Joi.string().default(10),
    sortBy: Joi.string(),
    paginate: Joi.boolean().default(true),
    include: Joi.array(),
  }),
};

module.exports = {
  validateAccount,
  withdrawal,
  buyAirtime,
  getTransactions,
};
