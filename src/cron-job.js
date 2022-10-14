/* eslint-disable no-param-reassign */
const cronJob = require('node-cron');
const moment = require('moment');
const { Order } = require('./models');
const { ORDER_STATUSES } = require('./config/constants');
const { userService, emailService, merchService } = require('./services');
const config = require('./config/config');

const cronJobs = () => {
  const sendOrderNotFulfilledReminder = cronJob.schedule(config.cronSchedule.sendOrderNotFulfilledReminder, async () => {
    const orders = await Order.find({
      status: ORDER_STATUSES.UNPAID,
      createdAt: { $lte: moment().startOf('day').toDate() },
    });
    orders.forEach(async (order) => {
      const user = await userService.getUserById(order.user);
      const text = `Your order ${order.id} has not been fulfilled yet. Please contact the creator to resolve this issue.`;
      const orderedMerches = [];
      const orderMerch = order.merches.map(async (merch) => {
        const data = await merchService.queryMerchById(merch.merchId);
        orderedMerches.push(data);
      });
      await Promise.all(orderMerch);
      order.merches.forEach((merch) => {
        orderedMerches.forEach((merchData) => {
          merchData.toJSON();
          if (merch.merchId.toString() === merchData.id.toString()) {
            merch.merchId = merchData;
          }
        });
      });
      order.paymentStatus = ORDER_STATUSES.UNPAID;
      await emailService.sendUserOrderFulfillmentEmail(user, order, text);
    });
  });
  sendOrderNotFulfilledReminder.start();

  const revertMerchQuantityForUnfulfilledOrders = cronJob.schedule(
    config.cronSchedule.revertMerchQuantityForUnfulfilledOrders,
    async () => {
      const orders = await Order.find({
        status: ORDER_STATUSES.PENDING,
        createdAt: { $lte: moment().endOf(1, 'days').toDate() },
      });
      orders.forEach(async (order) => {
        order.merches.forEach(async (merch) => {
          const merchData = await merchService.queryMerchById(merch.merchId);
          merchService.updateMerchById(merch.merchId, { quantity: merchData.quantity + merch.quantity });
        });
      });
    }
  );
  revertMerchQuantityForUnfulfilledOrders.start();

  const sendUserOrderPendingEmail = cronJob.schedule(config.cronSchedule.sendOrderPendingReminder, async () => {
    const orders = await Order.find({
      status: ORDER_STATUSES.PENDING,
    });
    const filteredOrders = orders.filter((order) => {
      const orderCreatedAt = moment(order.createdAt);
      const now = moment();
      const diff = now.diff(orderCreatedAt, 'hours');
      return diff < config.orderReservationTimeline / 2;
    });
    filteredOrders.forEach(async (order) => {
      const user = await userService.getUserById(order.user);
      const text = `Your order ${order.id} is still pending. Please contact the creator to resolve this issue.`;
      const orderedMerches = [];
      const orderMerch = order.merches.map(async (merch) => {
        const data = await merchService.queryMerchById(merch.merchId);
        orderedMerches.push(data);
      });
      await Promise.all(orderMerch);
      order.merches.forEach((merch) => {
        orderedMerches.forEach((merchData) => {
          merchData.toJSON();
          if (merch.merchId.toString() === merchData.id.toString()) {
            merch.merchId = merchData;
          }
        });
      });
      order.paymentStatus = ORDER_STATUSES.PENDING;
      await emailService.sendUserOrderFulfillmentEmail(user, order, text);
    });
  });
  sendUserOrderPendingEmail.start();

  const sendUserOrderTerminationEmail = cronJob.schedule(config.cronSchedule.sendUserOrderTerminationEmail, async () => {
    const orders = await Order.find({
      status: ORDER_STATUSES.PENDING,
    });
    const filteredOrders = orders.filter((order) => {
      const orderCreatedAt = moment(order.createdAt);
      const now = moment();
      const diff = now.diff(orderCreatedAt, 'hours');
      return diff >= config.orderReservationTimeline;
    });
    filteredOrders.forEach(async (order) => {
      const user = await userService.getUserById(order.user);
      const text = `Your order ${order.id} has been terminated due to payment not being processed.`;
      const orderedMerches = [];
      const orderMerch = order.merches.map(async (merch) => {
        const data = await merchService.queryMerchById(merch.merchId);
        orderedMerches.push(data);
      });
      await Promise.all(orderMerch);
      order.merches.forEach((merch) => {
        orderedMerches.forEach((merchData) => {
          merchData.toJSON();
          if (merch.merchId.toString() === merchData.id.toString()) {
            merch.merchId = merchData;
          }
        });
      });
      order.paymentStatus = ORDER_STATUSES.TERMINATED;
      await emailService.sendUserOrderFulfillmentEmail(user, order, text);
    });
  });
  sendUserOrderTerminationEmail.start();
};

module.exports = cronJobs;
