/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const moment = require('moment');
const { Item } = require('../models');
const ApiError = require('../utils/ApiError');
const { ERROR_MESSAGES } = require('../config/messages');

/**
 * Create a Item
 * @param {Object} itemBody
 * @returns {Promise<Item>}
 */
const createItem = async (itemBody) => {
  const item = await Item.create(itemBody);
  return item;
};

/**
 * Get Item by id
 * @param {ObjectId} ids
 * @returns {Promise<Item>}
 */
const queryItems = async (filter, options, eagerLoadFields = '', ignorePagination = false) => {
  filter.deletedBy = null;
  options.populate = eagerLoadFields;
  const items = ignorePagination ? await Item.find(filter).populate(options.populate) : await Item.paginate(filter, options);
  return items;
};

/**
 * Get Item by id
 * @param {ObjectId} id
 * @returns {Promise<Item>}
 */
const queryItemById = async (id, eagerLoadFields = false) => {
  return eagerLoadFields
    ? Item.findOne({ deletedBy: null, _id: id }).populate(eagerLoadFields)
    : Item.findOne({ deletedBy: null, _id: id });
};

/**
 * Update Item by id
 * @param {ObjectId} itemId
 * @param {Object} updateBody
 * @returns {Promise<Item>}
 */
const updateItemById = async (itemId, updateBody) => {
  const item = await queryItemById(itemId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.ITEM_NOT_FOUND);
  }

  if (item.createdBy.toString() !== updateBody.updatedBy) {
    throw new ApiError(httpStatus.FORBIDDEN, ERROR_MESSAGES.FORBIDDEN);
  }

  Object.assign(item, updateBody);
  await item.save();
  return item;
};

/**
 * Delete Item by id
 * @param {ObjectId} itemId
 * @returns {Promise<Item>}
 */
const deleteItemById = async (itemId, actor) => {
  const item = await queryItemById(itemId);
  if (!item || item.length > 0) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.ITEM_NOT_FOUND);
  }

  const deleteBody = {
    deletedBy: actor.id,
    deletedAt: moment().toISOString(),
  };

  Object.assign(item, deleteBody);
  await item.save();
  return item;
};

module.exports = {
  createItem,
  queryItems,
  queryItemById,
  updateItemById,
  deleteItemById,
};
