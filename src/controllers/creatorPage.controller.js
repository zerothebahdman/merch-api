/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { creatorPageService, userService, merchService, orderService, invoiceService } = require('../services');
const { ERROR_MESSAGES } = require('../config/messages');
const { ROLES } = require('../config/roles');
const { RESERVED_NAMES } = require('../config/reservedNames');
const pick = require('../utils/pick');
const { storeNameValidator } = require('../utils/helpers');
const { EVENTS } = require('../config/constants');
const mixPanel = require('../utils/mixpanel');
const { User } = require('../models');

const createCreatorPage = catchAsync(async (req, res) => {
  req.body.owner = req.user.id;
  // Reserved names
  if (RESERVED_NAMES.includes(req.body.name.toLowerCase())) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Name unavailable, please choose another name');
  }

  storeNameValidator(req.body.name);

  if (req.user.role !== ROLES.CREATOR) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not have permission to create page');
  }

  const creatorPages = await creatorPageService.queryCreatorPages({ owner: req.user.id }, {}, '', false);
  if (creatorPages.length > 0 && req.user.creatorPage) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.PAGE_CREATED_ALREADY);
  } else if (creatorPages.length > 0 && creatorPages[0].owner.toString() === req.user.id.toString()) {
    await User.updateOne({ _id: req.user.id }, { creatorPage: creatorPages[0].id });
    return res.status(httpStatus.CREATED).send(creatorPages[0]);
  }
  const creatorPage = await creatorPageService.createCreatorPage(req.body, req.user);
  await userService.updateUserById(req.user.id, { creatorPage: creatorPage.id });
  mixPanel(EVENTS.CREATOR_SETUP_PAGE, creatorPage);
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
  const filter = pick(req.query, ['published', 'name', 'slug']);
  filter.creatorPage = req.params.creatorPageId;
  const options = pick(req.query, ['sortBy', 'page', 'limit']);
  if (req.query.include) options.populate = req.query.include.toString();
  const merches = await merchService.queryMerches(filter, options, req.query.user, !req.query.paginate);
  if (!merches) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.PAGE_NOT_FOUND);
  }
  res.send(merches);
});

const getCreatorCustomers = catchAsync(async (req, res) => {
  const filter = { creatorPage: req.params.creatorPageId };
  const options = { populate: ['user'].toString() };
  const orders = await orderService.getOrders(filter, options, req.user, true);
  const getCreatorPaymentLinks = await invoiceService.getPaymentLinks({ creator: req.user.id }, options, req.user, false);
  const invoiceCustomers = await invoiceService.queryCreatorClient(req.user.id);
  const customers = [];
  const paymentLinks = getCreatorPaymentLinks.map(async (link) => {
    const creatorClientLinks = await invoiceService.getAllCreatorPaymentLinkClient({
      creatorPaymentLink: link._id,
      deletedAt: null,
    });
    customers.push(creatorClientLinks);
  });
  await Promise.all(paymentLinks);
  const customersArray = customers.flat();
  // from the list of data in the customers array, remove duplicates using the clientEmail
  const uniqueCustomers = customersArray.filter((v, i, a) => a.findIndex((t) => t.clientEmail === v.clientEmail) === i);
  const users = [];
  orders.forEach((order) => {
    order = order.toJSON();
    const index = users.findIndex((x) => x.id === order.user.id);
    if (index > -1) {
      order.user = order.user.id;
      users[index].orders.push(order);
    } else {
      const user = { ...order.user };
      order.user = order.user.id;
      users.push({ ...user, orders: [order] });
    }
  });
  const data = { storeClients: users, paymentLinkClients: uniqueCustomers, invoiceCustomers };
  res.send(data);
});

const getCreatorPageOrders = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['status', 'user']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  if (req.query.include) options.populate = req.query.include.toString();
  const orders = await orderService.getOrders(filter, options, req.user, !req.query.paginate);
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
  const options = pick(req.query, ['page', 'limit', 'sort']);
  const creatorPages = await creatorPageService.queryCreatorPages(filter, options, req.user, !req.query.paginate);
  if (!creatorPages) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.PAGE_NOT_FOUND);
  }
  res.send(creatorPages);
});

const updateCreatorPage = catchAsync(async (req, res) => {
  req.body.updatedBy = req.user.id;
  const creatorPage = await creatorPageService.updateCreatorPageById(req.params.creatorPageId, req.body);
  mixPanel(EVENTS.CREATOR_UPDATE_PAGE, creatorPage);
  res.send(creatorPage);
});

const deleteCreatorPage = catchAsync(async (req, res) => {
  const creatorPage = await creatorPageService.deleteCreatorPageById(req.params.creatorPageId, req.user);
  userService.updateUserById(creatorPage.user, { creatorPage: null });
  res.status(httpStatus.NO_CONTENT).send();
});

const addItem = catchAsync(async (req, res) => {
  const item = await creatorPageService.addItem(req.body, req.user);
  mixPanel(EVENTS.ADD_PRODUCT, item);
  res.send(item);
});

const getItem = catchAsync(async (req, res) => {
  const item = await creatorPageService.getItem(req.params.itemId, req.query.include);
  res.send(item);
});

const getItems = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'isPublic', 'isFeatured']);
  const options = pick(req.query, ['page', 'limit', 'sort']);
  if (req.query.include) options.populate = req.query.include.toString();
  filter.creatorPage = req.params.creatorPageId;
  const items = await creatorPageService.getItems(filter, options, req.user, !req.query.paginate);
  res.send(items);
});

const updateItem = catchAsync(async (req, res) => {
  const item = await creatorPageService.updateItem(req.params.itemId, req.body, req.user);
  res.send(item);
});

const deleteItem = catchAsync(async (req, res) => {
  await creatorPageService.deleteItem(req.params.itemId, req.user);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createCreatorPage,
  getCreatorPage,
  getCreatorPageMerches,
  getCreatorPageOrders,
  getCreatorCustomers,
  getCreatorPageBySlug,
  getCreatorPages,
  updateCreatorPage,
  deleteCreatorPage,
  addItem,
  getItem,
  getItems,
  updateItem,
  deleteItem,
};
