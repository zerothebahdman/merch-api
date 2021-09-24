/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const moment = require('moment');
const { Store } = require('../models');
const ApiError = require('../utils/ApiError');
const { slugify } = require('../utils/helpers');
const { ERROR_MESSAGES } = require('../config/messages');

/**
 * Create a Store
 * @param {Object} storeBody
 * @returns {Promise<Store>}
 */
const createStore = async (storeBody) => {
  storeBody.slug = `${slugify(storeBody.name)}`;
  const store = await Store.create(storeBody);
  return store;
};

/**
 * Get Store by id
 * @param {ObjectId} ids
 * @returns {Promise<Store>}
 */
const queryStores = async (filter, options, eagerLoadFields = '', ignorePagination = false) => {
  filter.deletedBy = null;
  options.populate = eagerLoadFields;
  const stores = ignorePagination
    ? await Store.find(filter).populate(options.populate)
    : await Store.paginate(filter, options);
  return stores;
};

/**
 * Get Store by id
 * @param {ObjectId} id
 * @returns {Promise<Store>}
 */
const queryStoreById = async (id, eagerLoadFields = false) => {
  return eagerLoadFields
    ? Store.findOne({ deletedBy: null, _id: id }).populate(eagerLoadFields)
    : Store.findOne({ deletedBy: null, _id: id });
};

/**
 * Update Store by id
 * @param {ObjectId} storeId
 * @param {Object} updateBody
 * @returns {Promise<Store>}
 */
const updateStoreById = async (storeId, updateBody) => {
  const store = await queryStoreById(storeId);
  if (!store) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.STORE_NOT_FOUND);
  }

  if (updateBody.name !== store.name) {
    updateBody.slug = `${slugify(updateBody.name)}`;
  }

  if (store.createdBy.toString() !== updateBody.updatedBy) {
    throw new ApiError(httpStatus.FORBIDDEN, ERROR_MESSAGES.FORBIDDEN);
  }

  Object.assign(store, updateBody);
  await store.save();
  return store;
};

/**
 * Delete Store by id
 * @param {ObjectId} storeId
 * @returns {Promise<Store>}
 */
const deleteStoreById = async (storeId, actor) => {
  const store = await queryStoreById(storeId);
  if (!store || store.length > 0) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.STORE_NOT_FOUND);
  }

  const deleteBody = {
    deletedBy: actor.id,
    deletedAt: moment().toISOString(),
  };

  Object.assign(store, deleteBody);
  await store.save();
  return store;
};

module.exports = {
  createStore,
  queryStores,
  queryStoreById,
  updateStoreById,
  deleteStoreById,
};
