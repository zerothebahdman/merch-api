const Joi = require('joi');

const addEmail = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
  }),
};

const verifyEmail = {
  params: Joi.object().keys({
    email: Joi.string().required().email(),
  }),
};

module.exports = {
  addEmail,
  verifyEmail,
};
