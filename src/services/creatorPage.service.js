/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const moment = require('moment');
const { CreatorPage, CreatorPageItem } = require('../models');
const ApiError = require('../utils/ApiError');
const { slugify } = require('../utils/helpers');
const { ERROR_MESSAGES } = require('../config/messages');
const { paymentService } = require('.');

/**
 * Create creator page
 * @param {Object} creatorPageBody
 * @returns {Promise<CreatorPage>}
 */
const createCreatorPage = async (creatorPageBody, actor) => {
  creatorPageBody.slug = `${slugify(creatorPageBody.name)}`;
  creatorPageBody.createdBy = actor.id;
  const creatorPage = await CreatorPage.create(creatorPageBody);
  // Add custom account number for creator
  await paymentService.setupAccount(actor);
  return creatorPage;
};

/**
 * Get creator page by id
 * @param {ObjectId} ids
 * @returns {Promise<CreatorPage>}
 */
const queryCreatorPages = async (filter, options, eagerLoadFields = '', ignorePagination = false) => {
  filter.deletedBy = null;
  options.populate = eagerLoadFields;
  const creatorPages = ignorePagination
    ? await CreatorPage.find(filter).populate(options.populate)
    : await CreatorPage.paginate(filter, options);
  return creatorPages;
};

/**
 * Get creator page by id
 * @param {ObjectId} id
 * @returns {Promise<CreatorPage>}
 */
const queryCreatorPageById = async (id, eagerLoadFields = false) => {
  return eagerLoadFields
    ? CreatorPage.findOne({ deletedBy: null, _id: id }).populate(eagerLoadFields)
    : CreatorPage.findOne({ deletedBy: null, _id: id });
};

/**
 * Update creator page by id
 * @param {ObjectId} creatorPageId
 * @param {Object} updateBody
 * @returns {Promise<CreatorPage>}
 */
const updateCreatorPageById = async (creatorPageId, updateBody) => {
  const creatorPage = await queryCreatorPageById(creatorPageId);
  if (!creatorPage) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.PAGE_NOT_FOUND);
  }
  // Todo: Decide whether or not to allow slug update and the terms of such updates
  // if (updateBody.name !== creatorPage.name) {
  //   updateBody.slug = `${slugify(updateBody.name)}`;
  // }

  if (creatorPage.createdBy.toString() !== updateBody.updatedBy) {
    throw new ApiError(httpStatus.FORBIDDEN, ERROR_MESSAGES.FORBIDDEN);
  }

  Object.assign(creatorPage, updateBody);
  await creatorPage.save();
  return creatorPage;
};

/**
 * Delete creator page by id
 * @param {ObjectId} creatorPageId
 * @returns {Promise<CreatorPage>}
 */
const deleteCreatorPageById = async (creatorPageId, actor) => {
  const creatorPage = await queryCreatorPageById(creatorPageId);
  if (!creatorPage || creatorPage.length > 0) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.PAGE_NOT_FOUND);
  }

  const deleteBody = {
    deletedBy: actor.id,
    deletedAt: moment().toISOString(),
  };

  Object.assign(creatorPage, deleteBody);
  await creatorPage.save();
  return creatorPage;
};

/**
 * Get creator page add item
 * @param {ObjectId} ids
 * @returns {Promise<Item>}
 */
const addItem = async (itemBody, actor) => {
  itemBody.creatorPage = actor.creatorPage;
  itemBody.createdBy = actor.id;
  const item = await CreatorPageItem.create(itemBody);
  return item;
};

/**
 * Get creator page item
 * @param {ObjectId} ids
 * @returns {Promise<Items>}
 */
const getItem = async (itemId, eagerLoadFields) => {
  const filter = { deletedAt: null, _id: itemId };
  const item = eagerLoadFields
    ? await CreatorPageItem.findOne(filter).populate(eagerLoadFields)
    : await CreatorPageItem.findOne(filter);
  return item;
};

/**
 * Get creator page items
 * @param {ObjectId} ids
 * @returns {Promise<Items>}
 */
const getItems = async (filter, options, actor, ignorePagination = false) => {
  filter.deletedBy = null;
  const creatorPageItems = ignorePagination
    ? await CreatorPageItem.find(filter).populate(options.populate)
    : await CreatorPageItem.paginate(filter, options);
  return creatorPageItems;
};

/**
 * Get creator page item
 * @param {ObjectId} ids
 * @returns {Promise<Items>}
 */
const updateItem = async (itemId, updateBody, actor) => {
  const item = await getItem(itemId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Creator page item not found');
  }

  if (item.createdBy.toString() !== actor.id.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, ERROR_MESSAGES.FORBIDDEN);
  }

  updateBody.updatedBy = actor.id;

  Object.assign(item, updateBody);
  await item.save();
  return item;
};

/**
 * Delete creator page by id
 * @param {ObjectId} creatorPageId
 * @returns {Promise<CreatorPage>}
 */
const deleteItem = async (itemId, actor) => {
  const item = await getItem(itemId);
  if (!item || item.length > 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Creator page item not found');
  }

  const deleteBody = {
    deletedBy: actor.id,
    deletedAt: moment().toISOString(),
  };

  Object.assign(item, deleteBody);
  await item.save();
  return true;
};

module.exports = {
  createCreatorPage,
  queryCreatorPages,
  queryCreatorPageById,
  updateCreatorPageById,
  deleteCreatorPageById,
  getItems,
  addItem,
  getItem,
  updateItem,
  deleteItem,
};
