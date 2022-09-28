const httpStatus = require('http-status');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const { ERROR_MESSAGES } = require('../config/messages');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, ERROR_MESSAGES.USER_EMAIL_EXIST);
  }
  const user = await User.create(userBody);
  return user;
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {Boolean} ignorePagination
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options, ignorePagination = false) => {
  const users = ignorePagination ? await User.find(filter) : await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id, eagerLoadFields) => {
  return eagerLoadFields ? User.findById(id).populate(eagerLoadFields) : User.findById(id);
};

/**
 * Get user by Creator page
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserByCreatorPage = async (creatorPage, eagerLoadFields) => {
  return eagerLoadFields ? User.findOne({ creatorPage }).populate(eagerLoadFields) : User.findOne({ creatorPage });
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND);
  }

  Object.assign(user, updateBody);
  await user.save();
  return user;
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByCreatorPage,
  getUserByEmail,
  updateUserById,
};
