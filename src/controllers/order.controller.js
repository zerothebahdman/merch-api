/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { orderService, paymentService, merchService, userService, emailService } = require('../services');
const pick = require('../utils/pick');
const { ORDER_STATUSES } = require('../config/constants');
const { generateRandomChar } = require('../utils/helpers');
const creatorPageService = require('../services/creatorPage.service');

const createOrder = catchAsync(async (req, res) => {
  req.body.createdBy = req.user.id;
  const proceed = await paymentService.controlTransaction(req.body);
  if (!proceed) throw new ApiError(httpStatus.BAD_REQUEST, 'Duplicate order, order is already created.');
  const check = req.body.merches.map(async (merch) => {
    const merchData = await merchService.queryMerchById(merch.merchId);
    if (merch.quantity > merchData.quantity)
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `The quantity selected is more than the quantity available for "${merchData.name}". Please refresh page and try again`
      );
  });
  await Promise.all(check);
  req.body.status = ORDER_STATUSES.UNPAID;
  req.body.orderCode = `#${generateRandomChar(6, 'num')}`;
  req.body.user = req.user.id;
  const page = req.body.creatorPage;
  const creator = await userService.getUserByCreatorPage(page);
  const pageInfo = await creatorPageService.queryCreatorPageById(page);
  req.body.paymentUrl = await paymentService.getPaymentLink(
    {
      customer: {
        email: req.user.email,
      },
      meta: { orderCode: req.body.orderCode, purchaser: req.user.id, creatorPage: page },
      amount: req.body.totalAmount.price,
      currency: req.body.totalAmount.currency,
      tx_ref: req.body.orderCode,
      customizations: {
        title: pageInfo.name.toUpperCase(),
        logo: creator.avatar ? creator.avatar : 'https://www.merchro.com/logo-black.svg',
      },
    },
    req.body.redirectUrl
  );
  const order = await orderService.createOrder(req.body);
  const orderJson = order.toJSON();
  orderJson.merches.forEach(async (merch) => {
    const merchData = await merchService.queryMerchById(merch.merchId);
    merchService.updateMerchById(merch.merchId, { quantity: merchData.quantity - merch.quantity });
  });
  const orderedMerches = [];
  const orderMerch = order.merches.map(async (merch) => {
    const data = await merchService.queryMerchById(merch.merchId);
    orderedMerches.push(data);
  });
  await Promise.all(orderMerch);
  order.merches.forEach((merch) => {
    orderedMerches.forEach((merchData) => {
      if (merch.merchId.toString() === merchData.id.toString()) {
        merch.merchId = merchData;
      }
    });
  });
  const link = `https://${pageInfo.slug}.merchro.store`;
  order.paymentStatus = ORDER_STATUSES.UNPAID;
  await emailService.sendUserOrderFulfillmentEmail(req.user, order, link);
  res.status(httpStatus.CREATED).send(orderJson);
});

const getOrder = catchAsync(async (req, res) => {
  const order = await orderService.getOrderById(req.params.orderId, req.query.include);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Requested order not found');
  }
  res.send(order);
});

const getOrderByCode = catchAsync(async (req, res) => {
  const order = await orderService.getOrderByOrderCode(`#${req.query.orderCode}`, 'user');
  if (!order || (order && order.user.email.toLowerCase() !== req.query.email.toLowerCase()))
    throw new ApiError(httpStatus.BAD_REQUEST, 'Order with specified details not found');
  res.send(order);
});

const getOrders = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['creatorPage', 'status']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const orders = await orderService.getOrders(filter, options, req.user, !req.query.paginate);
  if (!orders) {
    throw new ApiError(httpStatus.NOT_FOUND, `Something went wrong! Couldn't retrieve orders`);
  }
  res.send(orders);
});

const paymentSuccessful = catchAsync(async (req, res) => {
  const order = await orderService.updateOrderById(req.params.orderId, { status: ORDER_STATUSES.PROCESSING }, req.user);
  res.send(order);
});

const paymentFailed = catchAsync(async (req, res) => {
  const order = await orderService.updateOrderById(req.params.orderId, { status: ORDER_STATUSES.FAILED }, req.user);
  res.send(order);
});

const updateOrderStatus = catchAsync(async (req, res) => {
  // Only the creator of a merch should be able to update it.
  const order = await orderService.updateOrderById(req.params.orderId, req.body, req.user);
  res.send(order);
});

module.exports = {
  createOrder,
  getOrder,
  getOrderByCode,
  getOrders,
  updateOrderStatus,
  paymentSuccessful,
  paymentFailed,
};
