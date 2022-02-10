const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createItem = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    quantity: Joi.number(),
    baseAmount: Joi.object().keys({
      currency: Joi.string(),
      price: Joi.number(),
    }),
    available: Joi.boolean(),
    description: Joi.string(),
    images: Joi.array(),
    avatar: Joi.string(),
  }),
};
const getItem = {
  params: Joi.object().keys({
    itemId: Joi.string().custom(objectId),
  }),
};

const updateItem = {
  params: Joi.object().keys({
    itemId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      baseAmount: Joi.object().keys({
        currency: Joi.string(),
        price: Joi.number().required(),
      }),
      available: Joi.boolean(),
      description: Joi.string(),
      images: Joi.array(),
      avatar: Joi.string(),
    })
    .min(1),
};

const deleteItem = {
  params: Joi.object().keys({
    itemId: Joi.required().custom(objectId),
  }),
};

module.exports = {
  getItem,
  updateItem,
  createItem,
  deleteItem,
};
