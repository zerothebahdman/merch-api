const httpStatus = require('http-status');
const { Hub } = require('../models');
const ApiError = require('../utils/ApiError');
const { generateRandomChar, slugify } = require('../utils/helpers');
const { ERROR_MESSAGES } = require('../config/messages');
const config = require('../config/config');

/**
 * Create a hub
 * @param {Object} hubBody
 * @returns {Promise<Hub>}
 */
const createHub = async (hubBody) => {
  // eslint-disable-next-line no-param-reassign
  hubBody.slug = `${slugify(hubBody.name)}-${generateRandomChar(4, 'lower-num')}`;
  // eslint-disable-next-line no-param-reassign
  hubBody.url = `${config.frontendAppUrl}/invite/${generateRandomChar(8, 'alpha')}`;
  const hub = await Hub.create(hubBody);
  return hub;
};

/**
 * Get hub by id
 * @param {ObjectId} ids
 * @returns {Promise<Hub>}
 */
const getHubs = async (ids, actor, eagerLoadFields = false) => {
  return eagerLoadFields
    ? Hub.find({ id: ids, createdBy: actor.id }).populate(eagerLoadFields)
    : Hub.find({ id: ids, createdBy: actor.id });
};

/**
 * Get hub by id
 * @param {ObjectId} id
 * @returns {Promise<Hub>}
 */
const getHubById = async (id, eagerLoadFields = false) => {
  return eagerLoadFields ? Hub.findById(id).populate(eagerLoadFields) : Hub.findById(id);
};

/**
 * Update hub by id
 * @param {ObjectId} hubId
 * @param {Object} updateBody
 * @returns {Promise<Hub>}
 */
const updateHubById = async (hubId, updateBody) => {
  const hub = await getHubById(hubId);
  if (!hub) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.HUB_NOT_FOUND);
  }
  if (updateBody.name !== hub.name) {
    // eslint-disable-next-line no-param-reassign
    updateBody.slug = `${slugify(updateBody.name)}-${generateRandomChar(4, 'lower-num')}`;
  }
  if (Hub.createdBy._id.toString() !== updateBody.updatedBy) {
    throw new ApiError(httpStatus.FORBIDDEN, ERROR_MESSAGES.FORBIDDEN);
  }

  Object.assign(hub, updateBody);
  await Hub.save();
  return hub;
};

module.exports = {
  createHub,
  getHubs,
  getHubById,
  updateHubById,
};
