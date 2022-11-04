const Joi = require('joi');
const { INVOICE_STATUSES } = require('../config/constants');
const { objectId } = require('./custom.validation');

const createInvoiceValidation = {
  body: Joi.object().keys({
    client: Joi.custom(objectId).required(),
    items: Joi.array()
      .items({
        itemDetails: Joi.string().required(),
        quantity: Joi.number().required(),
        amount: Joi.number().required(),
      })
      .required(),
    totalAmount: Joi.number().required(),
    discount: Joi.number(),
    tax: Joi.number(),
    shipping: Joi.number(),
    invoiceNote: Joi.string(),
    dueDate: Joi.date(),
  }),
};

const updateInvoice = {
  body: Joi.object().keys({
    amountPaid: Joi.number().required(),
    status: Joi.string()
      .valid(...Object.values(INVOICE_STATUSES))
      .required(),
    datePaid: Joi.date(),
  }),
};

const createClient = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().required(),
    address: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required(),
  }),
};

const createIssue = {
  body: Joi.object().keys({
    reasonForReport: Joi.string().required(),
    description: Joi.string().required(),
    invoice: Joi.custom(objectId).required(),
  }),
};

module.exports = {
  createInvoiceValidation,
  createClient,
  updateInvoice,
  createIssue,
};
