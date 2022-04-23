const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { categoryService } = require('../services');
const { ERROR_MESSAGES } = require('../config/messages');
const { ROLES } = require('../config/roles');
const pick = require('../utils/pick');

const createCategory = catchAsync(async (req, res) => {
  if (!req.body.user) req.body.user = req.user.id;
  req.body.createdBy = req.user.id;
  if (req.user.role !== ROLES.CREATOR) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.USER_CANNOT_CREATE_CATEGORY);
  }
  const category = await categoryService.createCategory(req.body);
  res.status(httpStatus.CREATED).send(category);
});

const getCategory = catchAsync(async (req, res) => {
  const category = await categoryService.queryCategoryById(req.params.categoryId, req.query.include);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.CATEGORY_NOT_FOUND);
  }
  res.send(category);
});

const getCategories = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name']);
  const options = pick(req.query, ['page', 'limit']);
  const categories = await categoryService.queryCategoriess(filter, options, req.query.include);
  if (!categories) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.CATEGORY_NOT_FOUND);
  }
  res.send(categories);
});

const updateCategory = catchAsync(async (req, res) => {
  req.body.updatedBy = req.user.id;
  const category = await categoryService.updateCategoryById(req.params.categoryId, req.body);
  res.send(category);
});

const deleteCategory = catchAsync(async (req, res) => {
  await categoryService.deleteCategoryById(req.params.categoryId, req.user);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createCategory,
  getCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};
