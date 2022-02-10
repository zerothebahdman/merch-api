const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createOrder = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    contactEmail: Joi.string().email(),
    timezone: Joi.string(),
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
      name: Joi.string(),
      timezone: Joi.string(),
      contactEmail: Joi.string().email(),
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
