const Joi = require('joi');
const { INVOICE_STATUSES, PAYMENT_LINK_TYPES, RECURRING_PAYMENT } = require('../config/constants');
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

const createPaymentLink = {
  body: Joi.object().keys({
    paymentType: Joi.string()
      .valid(...Object.values(PAYMENT_LINK_TYPES))
      .required(),
    pageName: Joi.string().required(),
    pageImage: Joi.string(),
    pageDescription: Joi.string().required(),
    pageRedirectUrl: Joi.string(),
    amount: Joi.when('paymentType', {
      is: PAYMENT_LINK_TYPES.EVENT,
      then: Joi.number(),
      otherwise: Joi.number().required(),
    }),
    recurringPayment: Joi.when('paymentType', {
      is: PAYMENT_LINK_TYPES.SUBSCRIPTION,
      then: Joi.object()
        .keys({
          type: Joi.boolean().valid(true).required(),
          interval: Joi.string()
            .valid(...Object.values(RECURRING_PAYMENT))
            .required(),
          frequency: Joi.number().required(),
        })
        .required(),
    }),
    eventPayment: Joi.when('paymentType', {
      is: PAYMENT_LINK_TYPES.EVENT,
      then: Joi.object()
        .keys({
          type: Joi.boolean().required(),
          location: Joi.string().required(),
          date: Joi.object()
            .keys({
              from: Joi.date().required(),
              to: Joi.date().required(),
            })
            .required(),
          tickets: Joi.array()
            .items({
              ticketType: Joi.string().required(),
              ticketPrice: Joi.number().required(),
              ticketQuantity: Joi.number().required(),
            })
            .required(),
        })
        .required(),
    }),
  }),
};

const paymentLinkPay = {
  body: Joi.object().keys({
    transaction_id: Joi.string().required(),
    tx_ref: Joi.string().required(),
    idempotentKey: Joi.string().required(),
  }),
};

const generateCheckoutLink = {
  body: Joi.object().keys({
    clientFirstName: Joi.string().required(),
    clientLastName: Joi.string().required(),
    clientEmail: Joi.string().email().required(),
    clientPhoneNumber: Joi.string().required(),
    paymentType: Joi.string()
      .required()
      .valid(...Object.values(PAYMENT_LINK_TYPES)),
    creatorPaymentLinkId: Joi.custom(objectId).required(),
    redirectUrl: Joi.string().required(),
    amount: Joi.number().required(),
    event: Joi.when('paymentType', {
      is: PAYMENT_LINK_TYPES.EVENT,
      then: Joi.object()
        .keys({
          ticketType: Joi.string().required(),
          ticketQuantity: Joi.number().required(),
          peopleReceivingTicket: Joi.array().items(
            Joi.object()
              .keys({
                clientFirstName: Joi.string().required(),
                clientLastName: Joi.string().required(),
                clientEmail: Joi.string().email().required(),
                clientPhoneNumber: Joi.string().required(),
              })
              .required()
          ),
        })
        .required(),
    }),
  }),
};

module.exports = {
  createInvoiceValidation,
  createClient,
  updateInvoice,
  createIssue,
  createPaymentLink,
  paymentLinkPay,
  generateCheckoutLink,
};
