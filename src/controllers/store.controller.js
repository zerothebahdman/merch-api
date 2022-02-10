const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { storeService, userService, itemService } = require('../services');
const { ERROR_MESSAGES } = require('../config/messages');
const { ROLES } = require('../config/roles');
const { RESERVED_NAMES } = require('../config/reservedNames');
const pick = require('../utils/pick');
const { storeNameValidator } = require('../utils/helpers');

const createStore = catchAsync(async (req, res) => {
  req.body.owner = req.user.id;
  // Reserved names
  if (RESERVED_NAMES.includes(req.body.name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Store name unavailable, please choose another name');
  }

  storeNameValidator(req.body.name);

  const storeCreated = await storeService.queryStores({ owner: req.user.id }, {}, '', true);
  if (storeCreated.length > 0) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.STORE_CREATED_ALREADY);
  }
  req.body.createdBy = req.user.id;
  if (req.user.role !== ROLES.CREATOR) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.USER_CANNOT_CREATE_STORE);
  }
  const store = await storeService.createStore(req.body);
  userService.updateUserById(req.user.id, { store: store.id });
  res.status(httpStatus.CREATED).send(store);
});

const getStore = catchAsync(async (req, res) => {
  const store = await storeService.queryStoreById(req.params.storeId, req.query.include);
  if (!store) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.STORE_NOT_FOUND);
  }
  res.send(store);
});

const getStoreItems = catchAsync(async (req, res) => {
  const store = await itemService.queryItems({ store: req.params.storeId }, {}, req.query.include);
  if (!store) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.STORE_NOT_FOUND);
  }
  res.send(store);
});

const getStoreBySlug = catchAsync(async (req, res) => {
  const filter = { slug: req.params.slug };
  const store = await storeService.queryStores(filter, {}, req.query.include, true);
  if (store.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.STORE_NOT_FOUND);
  }
  res.send(store);
});

const getStores = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'storeId']);
  const options = pick(req.query, ['page', 'limit']);
  const stores = await storeService.queryStores(filter, options, req.query.include);
  if (!stores) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.STORE_NOT_FOUND);
  }
  res.send(stores);
});

const updateStore = catchAsync(async (req, res) => {
  req.body.updatedBy = req.user.id;
  const store = await storeService.updateStoreById(req.params.storeId, req.body);
  res.send(store);
});

const deleteStore = catchAsync(async (req, res) => {
  const store = await storeService.deleteStoreById(req.params.storeId, req.user);
  userService.updateUserById(store.user, { store: undefined });
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createStore,
  getStore,
  getStoreItems,
  getStoreBySlug,
  getStores,
  updateStore,
  deleteStore,
};
