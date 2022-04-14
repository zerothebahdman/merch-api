const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createMerch = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    quantity: Joi.number(),
    price: Joi.object().keys({
      currency: Joi.string(),
      amount: Joi.number().required(),
    }),
    startDate: Joi.date(),
    endDate: Joi.date(),
    merchLogo: Joi.string(),
    published: Joi.boolean(),
    description: Joi.string(),
    images: Joi.array(),
  }),
};

const getMerch = {
  params: Joi.object().keys({
    merchId: Joi.string().custom(objectId),
  }),
};

const getMerches = {
  query: Joi.object().keys({
    store: Joi.string().custom(objectId),
    slug: Joi.string(),
    name: Joi.string(),
    published: Joi.boolean(),
  }),
};

const updateMerch = {
  params: Joi.object().keys({
    merchId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      quantity: Joi.number(),
      item: Joi.required().custom(objectId),
      price: Joi.object().keys({
        currency: Joi.string(),
        amount: Joi.number(),
      }),
      published: Joi.boolean(),
      description: Joi.string(),
      images: Joi.array(),
      startDate: Joi.date(),
      endDate: Joi.date(),
      merchLogo: Joi.string(),
    })
    .min(1),
};

const deleteMerch = {
  params: Joi.object().keys({
    merchId: Joi.required().custom(objectId),
  }),
};

module.exports = {
  getMerch,
  getMerches,
  updateMerch,
  createMerch,
  deleteMerch,
};
