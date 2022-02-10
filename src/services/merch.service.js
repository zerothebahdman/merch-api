/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const moment = require('moment');
const { Merch } = require('../models');
const ApiError = require('../utils/ApiError');
const { ERROR_MESSAGES } = require('../config/messages');

/**
 * Create a Merch
 * @param {Object} merchBody
 * @returns {Promise<merch>}
 */
const createMerch = async (merchBody) => {
  const merch = await Merch.create(merchBody);
  return merch;
};

/**
 * Get Merch by id
 * @param {ObjectId} ids
 * @returns {Promise<Merch>}
 */
const queryMerches = async (filter, options = {}, actor, ignorePagination = false) => {
  filter.deletedBy = null;
  if (!(actor && filter.store && actor.store === filter.store)) {
    filter.published = true;
  }
  if (!options.populate) options.populate = '';
  const merches = ignorePagination
    ? await Merch.find(filter).populate(options.populate)
    : await Merch.paginate(filter, options);
  return merches;
};

/**
 * Get Merch by id
 * @param {ObjectId} id
 * @returns {Promise<Merch>}
 */
const queryMerchById = async (id, eagerLoadFields = false, actor) => {
  const filter = {
    $or: [
      { deletedBy: { $eq: null }, _id: { $eq: id }, createdBy: actor.id },
      { deletedBy: { $eq: null }, _id: { $eq: id }, published: { $eq: true } },
    ],
  };
  return eagerLoadFields ? Merch.findOne(filter).populate(eagerLoadFields) : Merch.findOne(filter);
};

/**
 * Update Merch by id
 * @param {ObjectId} merchId
 * @param {Object} updateBody
 * @returns {Promise<Merch>}
 */
const updateMerchById = async (merchId, updateBody) => {
  const merch = await queryMerchById(merchId);
  if (!merch) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.MERCH_NOT_FOUND);
  }

  if (Merch.createdBy.toString() !== updateBody.updatedBy) {
    throw new ApiError(httpStatus.FORBIDDEN, ERROR_MESSAGES.FORBIDDEN);
  }

  Object.assign(merch, updateBody);
  await merch.save();
  return merch;
};

/**
 * Delete Merch by id
 * @param {ObjectId} merchId
 * @returns {Promise<Merch>}
 */
const deleteMerchById = async (merchId, actor) => {
  const merch = await queryMerchById(merchId);
  if (!merch || merch.length > 0) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.MERCH_NOT_FOUND);
  }

  const deleteBody = {
    deletedBy: actor.id,
    deletedAt: moment().toISOString(),
  };

  Object.assign(merch, deleteBody);
  await merch.save();
  return merch;
};

module.exports = {
  createMerch,
  queryMerches,
  queryMerchById,
  updateMerchById,
  deleteMerchById,
};
