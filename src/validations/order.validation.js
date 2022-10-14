const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createOrder = {
  body: Joi.object().keys({
    merches: Joi.array().items({
      merchId: Joi.string().custom(objectId),
      quantity: Joi.number().min(1),
      amount: Joi.object().keys({
        unitPrice: Joi.number(),
        currency: Joi.string(),
      }),
    }),
    idempotentKey: Joi.string().min(16).required(),
    totalAmount: Joi.object().keys({
      price: Joi.number(),
      currency: Joi.string(),
    }),
    paymentReference: Joi.string(),
    creatorPage: Joi.string().custom(objectId).required(),
    redirectUrl: Joi.string().required(),
  }),
};

const getOrder = {
  params: Joi.object().keys({
    orderId: Joi.string().custom(objectId),
  }),
};

const getOrderByCode = {
  query: Joi.object().keys({
    orderCode: Joi.string().required(),
    email: Joi.string().required(),
  }),
};

const updateOrder = {
  params: Joi.object().keys({
    orderId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      status: Joi.string(),
    })
    .min(1),
};

const cancelOrder = {
  params: Joi.object().keys({
    orderId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  getOrder,
  getOrderByCode,
  updateOrder,
  createOrder,
  cancelOrder,
};
