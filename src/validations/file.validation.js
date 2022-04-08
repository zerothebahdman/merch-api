const Joi = require('joi');

const uploadFiles = {
  body: Joi.object().keys({
    files: Joi.array().required().min(1),
  }),
};

module.exports = {
  uploadFiles,
};
