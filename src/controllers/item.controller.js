const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { itemService } = require('../services');
const { ERROR_MESSAGES } = require('../config/messages');
const { ROLES } = require('../config/roles');
const pick = require('../utils/pick');

const createItem = catchAsync(async (req, res) => {
  if (!req.body.user) req.body.user = req.user.id;
  req.body.createdBy = req.user.id;
  if (req.user.role !== ROLES.CREATOR) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.USER_CANNOT_CREATE_ITEM);
  }
  const item = await itemService.createItem(req.body);
  res.status(httpStatus.CREATED).send(item);
});

const getItem = catchAsync(async (req, res) => {
  const item = await itemService.queryItemById(req.params.itemId, req.query.include);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.ITEM_NOT_FOUND);
  }
  res.send(item);
});

const getItems = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'itemId']);
  const options = pick(req.query, ['page', 'limit']);
  const items = await itemService.queryItems(filter, options, req.query.include);
  if (!items) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.ITEM_NOT_FOUND);
  }
  res.send(items);
});

const updateItem = catchAsync(async (req, res) => {
  req.body.updatedBy = req.user.id;
  const item = await itemService.updateItemById(req.params.itemId, req.body);
  res.send(item);
});

const deleteItem = catchAsync(async (req, res) => {
  await itemService.deleteItemById(req.params.itemId, req.user);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createItem,
  getItem,
  getItems,
  updateItem,
  deleteItem,
};
