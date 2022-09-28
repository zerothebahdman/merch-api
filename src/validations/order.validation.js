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
    totalAmount: Joi.object().keys({
      price: Joi.number(),
      currency: Joi.string(),
    }),
    paymentReference: Joi.string(),
    creatorPage: Joi.string().custom(objectId).required(),
  }),
};

const getOrder = {
  params: Joi.object().keys({
    orderId: Joi.string().custom(objectId),
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
  updateOrder,
  createOrder,
  cancelOrder,
};
