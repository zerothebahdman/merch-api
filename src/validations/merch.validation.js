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
    metadata: Joi.object().keys({
      sizes: Joi.array(),
      colors: Joi.array(),
    }),
    startDate: Joi.date(),
    endDate: Joi.date(),
    merchLogo: Joi.string(),
    published: Joi.boolean(),
    description: Joi.string(),
    images: Joi.array(),
    paymentLink: Joi.string(),
  }),
};

const getMerch = {
  params: Joi.object().keys({
    merchId: Joi.string().custom(objectId),
  }),
};

const getMerches = {
  params: Joi.object().keys({
    creatorPageId: Joi.string().custom(objectId),
  }),
  query: Joi.object().keys({
    creatorPage: Joi.string().custom(objectId),
    slug: Joi.string(),
    name: Joi.string(),
    published: Joi.boolean(),
    page: Joi.number(),
    paginate: Joi.boolean().default(true),
    limit: Joi.number(),
    sortBy: Joi.string(),
    include: Joi.array(),
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
      price: Joi.object().keys({
        currency: Joi.string(),
        amount: Joi.number(),
      }),
      metadata: Joi.object().keys({
        sizes: Joi.array(),
        colors: Joi.array(),
      }),
      published: Joi.boolean(),
      description: Joi.string(),
      images: Joi.array(),
      startDate: Joi.date(),
      endDate: Joi.date(),
      merchLogo: Joi.string(),
      paymentLink: Joi.string(),
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
