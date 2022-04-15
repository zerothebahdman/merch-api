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
    storeInfo: Joi.object().keys({
      name: Joi.string(),
      description: Joi.string(),
      banner: Joi.string(),
    }),
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
      storeInfo: Joi.object().keys({
        name: Joi.string(),
        description: Joi.string(),
        banner: Joi.string(),
      }),
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
    paginate: Joi.boolean().default(false),
    page: Joi.number(),
    limit: Joi.number(),
    sortBy: Joi.string(),
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

const getItem = {
  params: Joi.object().keys({
    itemId: Joi.required().custom(objectId),
    creatorPageId: Joi.required().custom(objectId),
  }),
  query: Joi.object().keys({
    include: Joi.array(),
  }),
};

const getOrders = {
  query: Joi.object().keys({
    creatorPage: Joi.string(),
    status: Joi.string(),
    paginate: Joi.boolean().default(true),
    page: Joi.number(),
    limit: Joi.number(),
    sortBy: Joi.string(),
  }),
};

module.exports = {
  getCreatorPage,
  updateCreatorPage,
  createCreatorPage,
  deleteCreatorPage,
  addItem,
  getItem,
  getItems,
  updateItem,
  deleteItem,
  getOrders,
};
