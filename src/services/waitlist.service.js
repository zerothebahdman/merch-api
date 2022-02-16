/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const { Waitlist } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Add an email
 * @param {Object} itemBody
 * @returns {Promise<Item>}
 */
const addEmail = async (itemBody) => {
  const email = await Waitlist.create(itemBody);
  return email;
};

/**
 * Get all emails in waitlist
 * @param {ObjectId} ids
 * @returns {Promise<Item>}
 */
const queryEmails = async (filter, options, ignorePagination = false) => {
  filter.deletedAt = null;
  const items = ignorePagination ? await Waitlist.find(filter) : await Waitlist.paginate(filter, options);
  return items;
};

/**
 * Verify email
 * @param {String} email
 * @returns {Promise<Item>}
 */
const verifyEmail = async (email) => {
  const waitlistEmail = await Waitlist.findOne({ deletedAt: null, email });
  if (!waitlistEmail) throw new ApiError(httpStatus.NOT_FOUND, 'Email not found in waitlist');
  return waitlistEmail;
};

module.exports = {
  addEmail,
  queryEmails,
  verifyEmail,
};
