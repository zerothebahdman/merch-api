/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const moment = require('moment');
const { Category } = require('../models');
const ApiError = require('../utils/ApiError');
const { ERROR_MESSAGES } = require('../config/messages');

/**
 * Create a category
 * @param {Object} categoryBody
 * @returns {Promise<Category>}
 */
const createCategory = async (categoryBody) => {
  const category = await Category.create(categoryBody);
  return category;
};

/**
 * Get category by id
 * @param {ObjectId} ids
 * @returns {Promise<Category>}
 */
const queryCategories = async (filter, options, eagerLoadFields = '', ignorePagination = false) => {
  filter.deletedBy = null;
  options.populate = eagerLoadFields;
  const categories = ignorePagination
    ? await Category.find(filter).populate(options.populate)
    : await Category.paginate(filter, options);
  return categories;
};

/**
 * Get category by id
 * @param {ObjectId} id
 * @returns {Promise<Category>}
 */
const queryCategoryById = async (id, eagerLoadFields = false) => {
  return eagerLoadFields
    ? Category.findOne({ deletedBy: null, _id: id }).populate(eagerLoadFields)
    : Category.findOne({ deletedBy: null, _id: id });
};

/**
 * Update category by id
 * @param {ObjectId} categoryId
 * @param {Object} updateBody
 * @returns {Promise<Category>}
 */
const updateCategoryById = async (categoryId, updateBody) => {
  const category = await queryCategoryById(categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.CATEGORY_NOT_FOUND);
  }

  if (category.createdBy.toString() !== updateBody.updatedBy) {
    throw new ApiError(httpStatus.FORBIDDEN, ERROR_MESSAGES.FORBIDDEN);
  }

  Object.assign(category, updateBody);
  await category.save();
  return category;
};

/**
 * Delete category by id
 * @param {ObjectId} categoryId
 * @returns {Promise<Category>}
 */
const deleteCategoryById = async (categoryId, actor) => {
  const category = await queryCategoryById(categoryId);
  if (!category || category.length > 0) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.CATEGORY_NOT_FOUND);
  }

  const deleteBody = {
    deletedBy: actor.id,
    deletedAt: moment().toISOString(),
  };

  Object.assign(category, deleteBody);
  await category.save();
  return category;
};

module.exports = {
  createCategory,
  queryCategories,
  queryCategoryById,
  updateCategoryById,
  deleteCategoryById,
};
