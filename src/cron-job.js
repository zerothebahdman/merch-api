/* eslint-disable no-param-reassign */
const cronJob = require('node-cron');
const moment = require('moment');
const { Order, Merch, PaymentLink } = require('./models');
const { ORDER_STATUSES, PAYMENT_LINK_TYPES } = require('./config/constants');
const config = require('./config/config');
const { merchService, emailService, invoiceService, paymentService } = require('./services');

const cronJobs = () => {
  const processOrder = cronJob.schedule(config.cronSchedule.processOrder, async () => {
    /** Terminate order after 48hrs of reservation and revert the quantity of the merch in the order */
    const unfulfilledOrders = await Order.find({
      deletedAt: null,
      status: ORDER_STATUSES.PENDING,
      createdAt: {
        $lte: moment().subtract(config.orderReservationTimeline, 'hours').endOf('day').toDate(),
      },
    }).populate('user ');
    if (unfulfilledOrders.length > 0) {
      unfulfilledOrders.forEach(async (order) => {
        const orderMerch = order.merches.map(async (merch) => {
          const data = await Merch.findById(merch.merchId);
          data.quantity += merch.quantity;
          merch.merchId = data;
          await data.save();
        });
        await Promise.all(orderMerch);
        order.status = ORDER_STATUSES.FAILED;
        order.save();
        order.paymentStatus = ORDER_STATUSES.UNPAID.toUpperCase();
        // NB: I'm waiting for the termination of order email from Daniel, because that's what will be be used here as against the one below
        await emailService.sendUserOrderReminderEmail(order.user, order);
      });
    }
    /** send user order order payment email after 24hrs of payment no being processed */
    const pendingOrders = await Order.find({
      deletedAt: null,
      status: ORDER_STATUSES.PENDING,
      createdAt: {
        $gte: moment()
          .subtract(config.orderReservationTimeline / 2, 'hours')
          .toDate(),
        $lte: moment()
          .subtract(config.orderReservationTimeline / 2 + 1, 'hours')
          .toDate(),
      },
    }).populate('user');
    if (pendingOrders.length > 0) {
      pendingOrders.forEach(async (order) => {
        const orderMerch = order.merches.map(async (merch) => {
          const data = await merchService.queryMerchById(merch.merchId);
          merch.merchId = data;
        });
        await Promise.all(orderMerch);
        order.paymentStatus = ORDER_STATUSES.UNFULFILLED.toUpperCase();
        emailService.sendUserOrderReminderEmail(order.user, order);
      });
    }
  });
  processOrder.start();

  const initiateRecurringPayment = cronJob.schedule(config.cronSchedule.initiateRecurringPayment, async () => {
    /** initiate recurring payment for paymentLinks that the type is subscription */
    const paymentLinks = await PaymentLink.find({
      deletedAt: null,
      paymentType: PAYMENT_LINK_TYPES.SUBSCRIPTION,
    });
    if (paymentLinks.length > 0) {
      paymentLinks.forEach(async (paymentLink) => {
        const filter = {
          creatorPaymentLink: paymentLink._id,
        };
        const paymentLinkClient = await invoiceService.getAllCreatorPaymentLinkClient(filter);
        paymentLinkClient.map(async (client) => {
          const { nextChargeDate } = client.subscriptionDetails;
          if (
            (moment(nextChargeDate) <= moment() && paymentLink.recurringPayment.frequency === 0) ||
            (moment(nextChargeDate) <= moment() &&
              client.subscriptionDetails.timesBilled <= paymentLink.recurringPayment.frequency)
          ) {
            await paymentService.initiateRecurringPayment(paymentLink, client);
          }
        });
      });
    }
  });
  initiateRecurringPayment.start();
};

module.exports = cronJobs;
