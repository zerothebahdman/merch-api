const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { orderService, paymentService, merchService } = require('../services');
const pick = require('../utils/pick');
const { ORDER_STATUSES } = require('../config/constants');
const { generateRandomChar } = require('../utils/helpers');

const createOrder = catchAsync(async (req, res) => {
  req.body.createdBy = req.user.id;
  const check = req.body.merches.map(async (merch) => {
    const merchData = await merchService.queryMerchById(merch.merchId);
    if (merch.quantity > merchData.quantity)
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `The quantity selected is more than the quantity available for "${merchData.name}". Please refresh page and try again`
      );
  });
  await Promise.all(check);
  req.body.status = ORDER_STATUSES.PENDING;
  req.body.orderCode = `#${generateRandomChar(9, 'num')}`;
  req.body.user = req.user.id;
  const order = await orderService.createOrder(req.body);
  const orderJson = order.toJSON();
  orderJson.merches.forEach(async (merch) => {
    const merchData = await merchService.queryMerchById(merch.merchId);
    merchService.updateMerchById(merch.merchId, { quantity: merchData.quantity - merch.quantity });
  });
  orderJson.paymentUrl = await paymentService.getPaymentLink({
    customer: {
      email: req.user.email,
    },
    amount: orderJson.totalAmount.price,
    currency: orderJson.totalAmount.currency,
    tx_ref: orderJson.orderCode,
  });
  res.status(httpStatus.CREATED).send(orderJson);
});

const getOrder = catchAsync(async (req, res) => {
  const order = await orderService.getOrderById(req.params.orderId, req.query.include);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Requested order not found');
  }
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
  req.body.updatedBy = req.user.id;
  const order = await orderService.updateOrderById(req.params.orderId, { status: ORDER_STATUSES.PROCESSING });
  res.send(order);
});

const paymentFailed = catchAsync(async (req, res) => {
  const order = await orderService.updateOrderById(req.params.orderId, { status: ORDER_STATUSES.FAILED });
  res.send(order);
});

const updateOrderStatus = catchAsync(async (req, res) => {
  // Only the creator of a merch should be able to update it.
  req.body.updatedBy = req.user.id;
  const order = await orderService.updateOrderById(req.params.orderId, req.body);
  res.send(order);
});

module.exports = {
  createOrder,
  getOrder,
  getOrders,
  updateOrderStatus,
  paymentSuccessful,
  paymentFailed,
};
