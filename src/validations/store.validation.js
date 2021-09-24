const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createStore = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    user: Joi.string(),
    avatar: Joi.string(),
    description: Joi.string(),
    coverImage: Joi.string(),
  }),
};
const getStore = {
  params: Joi.object().keys({
    storeId: Joi.string().custom(objectId),
    slug: Joi.string(),
  }),
};

const updateStore = {
  params: Joi.object().keys({
    storeId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      avatar: Joi.string(),
      description: Joi.string(),
      coverImage: Joi.string(),
    })
    .min(1),
};

const deleteStore = {
  params: Joi.object().keys({
    storeId: Joi.required().custom(objectId),
  }),
};

module.exports = {
  getStore,
  updateStore,
  createStore,
  deleteStore,
};
