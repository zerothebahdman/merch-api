const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createCreatorPage = {
  body: Joi.object().keys({
    name: Joi.string().min(4).required(),
    avatar: Joi.string(),
    metadata: Joi.object().keys({
      description: Joi.string(),
      intro: Joi.string(),
    }),
    coverImage: Joi.string(),
  }),
};
const getCreatorPage = {
  params: Joi.object().keys({
    creatorPageId: Joi.string().custom(objectId),
    slug: Joi.string(),
  }),
};

const updateCreatorPage = {
  params: Joi.object().keys({
    creatorPageId: Joi.required().custom(objectId),
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

const deleteCreatorPage = {
  params: Joi.object().keys({
    creatorPageId: Joi.required().custom(objectId),
  }),
};

const addItem = {
  params: Joi.object().keys({
    creatorPageId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    title: Joi.string(),
    description: Joi.string(),
    type: Joi.string(),
    url: Joi.string(),
    thumbnail: Joi.string(),
    data: Joi.array(),
    isFeatured: Joi.boolean().default(false),
    isPublic: Joi.boolean().default(true),
  }),
};

const getItems = {
  params: Joi.object().keys({
    creatorPageId: Joi.required().custom(objectId),
  }),
  query: Joi.object().keys({
    isPublic: Joi.boolean(),
    isFeatured: Joi.boolean(),
  }),
};

const updateItem = {
  params: Joi.object().keys({
    creatorPageId: Joi.required().custom(objectId),
    itemId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    title: Joi.string(),
    description: Joi.string(),
    type: Joi.string(),
    url: Joi.string(),
    thumbnail: Joi.string(),
    data: Joi.array(),
    isFeatured: Joi.boolean().default(false),
    isPublic: Joi.boolean().default(true),
  }),
};

const deleteItem = {
  params: Joi.object().keys({
    creatorPageId: Joi.required().custom(objectId),
    itemId: Joi.required().custom(objectId),
  }),
};

module.exports = {
  getCreatorPage,
  updateCreatorPage,
  createCreatorPage,
  deleteCreatorPage,
  addItem,
  getItems,
  updateItem,
  deleteItem,
};
