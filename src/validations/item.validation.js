const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createItem = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    quantity: Joi.number(),
    store: Joi.required().custom(objectId),
    amount: Joi.object().keys({
      currency: Joi.string(),
      price: Joi.number(),
    }),
    published: Joi.boolean(),
    description: Joi.string(),
    images: Joi.array(),
  }),
};
const getItem = {
  params: Joi.object().keys({
    ItemId: Joi.string().custom(objectId),
  }),
};

const updateItem = {
  params: Joi.object().keys({
    ItemId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      quantity: Joi.number(),
      amount: Joi.object().keys({
        currency: Joi.string(),
        price: Joi.number(),
      }),
      published: Joi.boolean(),
      description: Joi.string(),
      images: Joi.array(),
    })
    .min(1),
};

const deleteItem = {
  params: Joi.object().keys({
    ItemId: Joi.required().custom(objectId),
  }),
};

module.exports = {
  getItem,
  updateItem,
  createItem,
  deleteItem,
};
