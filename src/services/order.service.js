/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const { Order } = require('../models');
const ApiError = require('../utils/ApiError');
const { generateRandomChar, slugify } = require('../utils/helpers');
const { ERROR_MESSAGES } = require('../config/messages');

/**
 * Create an order
 * @param {Object} orderBody
 * @returns {Promise<Order>}
 */
const createOrder = async (orderBody) => {
  const order = await Order.create(orderBody);
  return order;
};

/**
 * Get orders by creator page
 * @param {ObjectId} ids
 * @returns {Promise<Order>}
 */
const getOrders = async (filter, options, actor, ignorePagination = false) => {
  filter.deletedBy = null;
  filter.creatorPage = actor.creatorPage;

  const orders = ignorePagination
    ? await Order.find(filter).populate(options.populate)
    : await Order.paginate(filter, options);
  return orders;
};

/**
 * Get Order by id
 * @param {ObjectId} id
 * @returns {Promise<Order>}
 */
const getOrderById = async (id, eagerLoadFields = false) => {
  return eagerLoadFields ? Order.findById(id).populate(eagerLoadFields) : Order.findById(id);
};

/**
 * Update order by id
 * @param {ObjectId} orderId
 * @param {Object} updateBody
 * @returns {Promise<Order>}
 */
const updateOrderById = async (orderId, updateBody, actor) => {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'The order was not found');
  }
  if (updateBody.name !== order.name) {
    // eslint-disable-next-line no-param-reassign
    updateBody.slug = `${slugify(updateBody.name)}-${generateRandomChar(4, 'lower-num')}`;
  }
  if (order.creatorPage.toString() !== actor.creatorPage) {
    throw new ApiError(httpStatus.FORBIDDEN, ERROR_MESSAGES.FORBIDDEN);
  }

  Object.assign(order, updateBody);
  await order.save();
  return order;
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderById,
};
