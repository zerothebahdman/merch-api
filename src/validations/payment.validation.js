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
    bankId: Joi.string().required(),
    accountNumber: Joi.string().required(),
    purpose: Joi.string(),
  }),
};

module.exports = {
  validateAccount,
  withdrawal,
};
