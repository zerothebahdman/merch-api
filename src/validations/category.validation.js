const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createCategory = {
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
const getCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().custom(objectId),
  }),
};

const updateCategory = {
  params: Joi.object().keys({
    categoryId: Joi.required().custom(objectId),
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

const deleteCategory = {
  params: Joi.object().keys({
    categoryId: Joi.required().custom(objectId),
  }),
};

module.exports = {
  getCategory,
  updateCategory,
  createCategory,
  deleteCategory,
};
