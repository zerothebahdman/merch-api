const Joi = require('joi');
// const { objectId } = require('./custom.validation');

const withdrawal = {
  body: Joi.object().keys({
    amount: Joi.string().required(),
    bankId: Joi.string().required(),
    accountNumber: Joi.string().required(),
  }),
};

module.exports = {
  withdrawal,
};
