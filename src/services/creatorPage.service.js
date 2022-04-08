/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const moment = require('moment');
const { CreatorPage } = require('../models');
const ApiError = require('../utils/ApiError');
const { slugify } = require('../utils/helpers');
const { ERROR_MESSAGES } = require('../config/messages');

/**
 * Create creator page
 * @param {Object} creatorPageBody
 * @returns {Promise<CreatorPage>}
 */
const createCreatorPage = async (creatorPageBody, actor) => {
  creatorPageBody.slug = `${slugify(creatorPageBody.name)}`;
  creatorPageBody.createdBy = actor.id;
  const creatorPage = await CreatorPage.create(creatorPageBody);
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

  if (updateBody.name !== creatorPage.name) {
    updateBody.slug = `${slugify(updateBody.name)}`;
  }

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

module.exports = {
  createCreatorPage,
  queryCreatorPages,
  queryCreatorPageById,
  updateCreatorPageById,
  deleteCreatorPageById,
};
