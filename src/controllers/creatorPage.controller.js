const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { creatorPageService, userService, merchService, orderService } = require('../services');
const { ERROR_MESSAGES } = require('../config/messages');
const { ROLES } = require('../config/roles');
const { RESERVED_NAMES } = require('../config/reservedNames');
const pick = require('../utils/pick');
const { storeNameValidator } = require('../utils/helpers');

const createCreatorPage = catchAsync(async (req, res) => {
  req.body.owner = req.user.id;
  // Reserved names
  if (RESERVED_NAMES.includes(req.body.name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Name unavailable, please choose another name');
  }

  storeNameValidator(req.body.name);

  const creatorPages = await creatorPageService.queryCreatorPages({ owner: req.user.id }, {}, '', true);
  if (creatorPages.length > 0) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.PAGE_CREATED_ALREADY);
  }
  req.body.createdBy = req.user.id;
  if (req.user.role !== ROLES.CREATOR) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not have permission to create page');
  }
  const creatorPage = await creatorPageService.createCreatorPage(req.body, req.user);
  userService.updateUserById(req.user.id, { creatorPage: creatorPage.id });
  res.status(httpStatus.CREATED).send(creatorPage);
});

const getCreatorPage = catchAsync(async (req, res) => {
  const creatorPage = await creatorPageService.queryCreatorPageById(req.params.creatorPageId, req.query.include);
  if (!creatorPage) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.PAGE_NOT_FOUND);
  }
  res.send(creatorPage);
});

const getCreatorPageMerches = catchAsync(async (req, res) => {
  const merches = await merchService.queryMerches({ creatorPage: req.params.creatorPageId }, {}, req.query.include);
  if (!merches) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.PAGE_NOT_FOUND);
  }
  res.send(merches);
});

const getCreatorPageOrders = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['status']);
  filter.creatorPage = req.params.creatorPageId;
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const orders = await orderService.getOrders(filter, options, req.user, !req.query.paginate);
  if (!orders) {
    throw new ApiError(httpStatus.NOT_FOUND, `Something went wrong. Couldn't fetch orders`);
  }
  res.send(orders);
});

const getCreatorPageBySlug = catchAsync(async (req, res) => {
  const filter = { slug: req.params.slug };
  const creatorPage = await creatorPageService.queryCreatorPages(filter, {}, req.query.include, true);
  if (creatorPage.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.PAGE_NOT_FOUND);
  }
  res.send(creatorPage);
});

const getCreatorPages = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'creatorPageId']);
  const options = pick(req.query, ['page', 'limit']);
  const creatorPages = await creatorPageService.queryCreatorPages(filter, options, req.query.include);
  if (!creatorPages) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.PAGE_NOT_FOUND);
  }
  res.send(creatorPages);
});

const updateCreatorPage = catchAsync(async (req, res) => {
  req.body.updatedBy = req.user.id;
  const creatorPage = await creatorPageService.updateCreatorPageById(req.params.creatorPageId, req.body);
  res.send(creatorPage);
});

const deleteCreatorPage = catchAsync(async (req, res) => {
  const creatorPage = await creatorPageService.deleteCreatorPageById(req.params.creatorPageId, req.user);
  userService.updateUserById(creatorPage.user, { creatorPage: null });
  res.status(httpStatus.NO_CONTENT).send();
});

const addItem = catchAsync(async (req, res) => {
  const item = creatorPageService.addItem(req.body, req.user);
  res.send(item);
});

const getItems = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'isPublic', 'isFeatured']);
  filter.creatorPage = req.params.creatorPageId;
  const items = creatorPageService.getItems(filter, req.user);
  res.send(items);
});

const updateItem = catchAsync(async (req, res) => {
  res.send(null);
});

const deleteItem = catchAsync(async (req, res) => {
  res.send(null);
});

module.exports = {
  createCreatorPage,
  getCreatorPage,
  getCreatorPageMerches,
  getCreatorPageOrders,
  getCreatorPageBySlug,
  getCreatorPages,
  updateCreatorPage,
  deleteCreatorPage,
  addItem,
  getItems,
  updateItem,
  deleteItem,
};
