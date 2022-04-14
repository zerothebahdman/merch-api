const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { orderService } = require('../services');
const pick = require('../utils/pick');

const createOrder = catchAsync(async (req, res) => {
  req.body.createdBy = req.user.id;
  const order = await orderService.createOrder(req.body);
  res.status(httpStatus.CREATED).send(order);
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
  const orders = await orderService.queryOrders(filter, options, req.user, !req.query.paginate);
  if (!orders) {
    throw new ApiError(httpStatus.NOT_FOUND, `Something went wrong! Couldn't retrieve orders`);
  }
  res.send(orders);
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
};
