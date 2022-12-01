/* eslint-disable camelcase */
/* eslint-disable array-callback-return */
/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const moment = require('moment');
const config = require('../config/config');
const { TRANSACTION_SOURCES, TRANSACTION_TYPES, CURRENCIES, PAYMENT_LINK_TYPES, EVENTS } = require('../config/constants');
const { invoiceService, paymentService, userService, emailService, creatorPageService } = require('../services');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { generateRandomChar, calculatePeriod, slugify } = require('../utils/helpers');
const mixPanel = require('../utils/mixpanel');
const pick = require('../utils/pick');

const createInvoice = catchAsync(async (req, res) => {
  req.body.creator = req.user.id;
  req.body.invoiceCode = `#INV-${generateRandomChar(5, 'num')}`;
  const pageInfo = await creatorPageService.queryCreatorPageById(req.user.creatorPage);
  const client = await invoiceService.getCreatorClient({ creator: req.user.id, _id: req.body.client });
  let invoice = await invoiceService.createInvoice(req.body);
  const paymentLink = await paymentService.getPaymentLink(
    {
      customer: {
        email: req.user.email,
      },
      meta: { client: client.id, creator: req.user.id, invoice: invoice.id },
      amount: req.body.totalAmount,
      currency: CURRENCIES.NAIRA,
      tx_ref: generateRandomChar(10, 'num'),
      customizations: {
        title: pageInfo.name.toUpperCase(),
        logo: pageInfo.avatar ? pageInfo.avatar : 'https://www.merchro.com/logo-black.svg',
      },
    },
    req.body.redirectUrl
  );
  invoice = await invoiceService.updateInvoiceById(invoice.id, { paymentLink });
  mixPanel(EVENTS.CREATE_INVOICE, invoice);
  res.status(201).send(invoice);
});

const processInvoicePayment = catchAsync(async (req, res) => {
  const proceed = await paymentService.controlTransaction(req.body);
  if (!proceed) throw new ApiError(httpStatus.BAD_REQUEST, 'Transaction already processed.');
  const validatePayment = await paymentService.validatePayment(req.body.transaction_id);
  if (validatePayment.data.status === 'successful') {
    const {
      amount,
      tx_ref,
      meta: { creator, client, invoice },
    } = validatePayment.data;
    const filter = {
      _id: client,
      creator,
      deletedAt: null,
    };
    const creatorClient = await invoiceService.getCreatorClient(filter);
    const creatorDetails = await userService.getUserById(creator);
    const _invoice = await invoiceService.getInvoiceById(invoice);

    const transactionExists = await paymentService.getTransactions({ reference: tx_ref }, {}, creatorDetails, false);
    if (transactionExists.length > 0) throw new ApiError(httpStatus.BAD_REQUEST, 'Transaction already processed.');

    const charge = Number(((Number(config.paymentProcessing.invoiceProcessingCharge) / 100) * amount).toFixed(2));
    const amountToPayCreator = amount - charge;
    const processingCost = Number(((Number(config.paymentProcessing.invoiceProcessingCost) / 100) * amount).toFixed(2));
    const profit = charge - processingCost;

    const transaction = await paymentService.createTransactionRecord({
      user: creatorDetails._id,
      source: TRANSACTION_SOURCES.PAYMENT_LINK,
      type: TRANSACTION_TYPES.CREDIT,
      amount: amountToPayCreator,
      purpose: `Payment for Invoice ${_invoice.invoiceCode}`,
      createdBy: creatorClient.id,
      reference: tx_ref,
      meta: {
        user: creatorClient._id,
        payerName: `Invoice ${_invoice.invoiceCode}/${creatorClient.name.toUpperCase()}`,
        email: creatorClient.email,
        currency: CURRENCIES.NAIRA,
      },
    });
    await paymentService.addToBalance(amountToPayCreator, creatorDetails._id);
    mixPanel(EVENTS.PAID_FROM_INVOICE, transaction);
    await paymentService.createMerchroEarningsRecord({
      user: creatorDetails._id,
      source: TRANSACTION_SOURCES.INVOICE,
      amount: Number(amount),
      charge,
      profit,
      transaction: transaction._id,
      amountSpent: processingCost,
    });
    res.send(_invoice);
  } else {
    // Inform the customer their payment was unsuccessful
    throw new ApiError(httpStatus.BAD_REQUEST, 'Payment was unsuccessful');
  }
});

const updateInvoice = catchAsync(async (req, res) => {
  const invoice = await invoiceService.updateInvoiceById(req.params.invoiceId, req.body);
  res.send(invoice);
});

const getInvoices = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['creator', 'status', 'client']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  if (req.query.startDate && req.query.endDate) {
    filter.createdAt = { $gte: moment(req.query.startDate).startOf('day'), $lte: moment(req.query.endDate).endOf('day') };
  } else if (req.query.startDate) {
    filter.createdAt = { $gte: moment(req.query.startDate).startOf('day') };
  } else if (req.query.endDate) {
    filter.createdAt = { $lte: moment(req.query.endDate).endOf('day') };
  }
  if (req.query.include) options.populate = req.query.include.toString();
  else options.populate = '';
  const invoices = await invoiceService.getInvoice(filter, options, req.user, req.query.paginate);
  res.status(200).send(invoices);
});

const getInvoice = catchAsync(async (req, res) => {
  const invoice = await invoiceService.getInvoiceById(req.params.invoiceId, 'client');
  res.status(200).send(invoice);
});

const deleteInvoice = catchAsync(async (req, res) => {
  await invoiceService.deleteInvoiceById(req.params.invoiceId);
  res.status(204).send();
});

const queryCreatorClient = catchAsync(async (req, res) => {
  const client = await invoiceService.queryCreatorClient(req.user.id);
  res.status(200).send(client);
});

const createClient = catchAsync(async (req, res) => {
  req.body.creator = req.user.id;
  const client = await invoiceService.createClient(req.body);
  res.status(200).send(client);
});

const createIssue = catchAsync(async (req, res) => {
  req.body.creator = req.user.id;
  const issue = await invoiceService.createIssue(req.body);
  res.status(200).send(issue);
});

const createPaymentLink = catchAsync(async (req, res) => {
  req.body.creator = req.user.id;
  req.body.paymentCode = `pay-${generateRandomChar(15, 'lower-num')}`;
  const paymentLinkSlug = await invoiceService.getPaymentLinkBySlug({
    slug: slugify(req.body.pageName),
    creator: req.user.id,
  });

  req.body.slug = paymentLinkSlug
    ? `${slugify(req.body.pageName)}-${generateRandomChar(4, 'lower')}`
    : slugify(req.body.pageName);
  const paymentLink = await invoiceService.createPaymentLink(req.body);
  mixPanel(EVENTS.CREATE_PAYMENT_LINK, paymentLink);
  res.status(200).send(paymentLink);
});

const getPaymentLinks = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['creator', 'paymentType']);
  if (req.query.startDate && req.query.endDate) {
    filter.createdAt = { $gte: moment(req.query.startDate).startOf('day'), $lte: moment(req.query.endDate).endOf('day') };
  } else if (req.query.startDate) {
    filter.createdAt = { $gte: moment(req.query.startDate).startOf('day') };
  } else if (req.query.endDate) {
    filter.createdAt = { $lte: moment(req.query.endDate).endOf('day') };
  }
  if (req.query.exclude) {
    filter.paymentType = { $ne: req.query.exclude };
  }
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  if (req.query.include) options.populate = req.query.include.toString();
  else options.populate = '';
  const paymentLink = await invoiceService.getPaymentLinks(filter, options, req.user, req.query.paginate);
  res.status(httpStatus.OK).send(paymentLink);
});

const getPaymentLink = catchAsync(async (req, res) => {
  const filter = { paymentCode: req.params.paymentCode, deletedAt: null, deletedBy: null };
  const paymentLink = await invoiceService.getPaymentLink(filter);
  res.status(200).send(paymentLink);
});

const getPaymentLinkBySlug = catchAsync(async (req, res) => {
  const filter = { slug: req.params.slug, deletedAt: null, deletedBy: null };
  const paymentLink = await invoiceService.getPaymentLink(filter);
  res.status(200).send(paymentLink);
});

const updatePaymentLink = catchAsync(async (req, res) => {
  const paymentLink = await invoiceService.updatePaymentLinkById(req.params.paymentCode, req.body);
  res.send(paymentLink);
});

const deletePaymentLink = catchAsync(async (req, res) => {
  await invoiceService.deletePaymentLinkById(req.params.paymentCode);
  res.status(204).send();
});

const paymentLinkPay = catchAsync(async (req, res) => {
  const proceed = await paymentService.controlTransaction(req.body);
  if (!proceed) throw new ApiError(httpStatus.BAD_REQUEST, 'Transaction already processed.');
  const validatePayment = await paymentService.validatePayment(req.body.transaction_id);
  if (validatePayment.data.status === 'successful') {
    const {
      card,
      amount,
      tx_ref,
      meta: { creator, creatorPaymentLink, paymentType, interval, frequency, clientInfo },
    } = validatePayment.data;

    const creatorClient = await invoiceService.createCreatorPaymentLinkClient(JSON.parse(clientInfo));
    const creatorDetails = await userService.getUserById(creator);
    const creatorPage = await creatorPageService.queryCreatorPageById(creatorDetails.creatorPage);

    const transactionExists = await paymentService.getTransactions({ reference: tx_ref }, {}, creatorDetails, false);
    if (transactionExists.length > 0) throw new ApiError(httpStatus.BAD_REQUEST, 'Transaction already processed.');
    if (paymentType === PAYMENT_LINK_TYPES.SUBSCRIPTION) {
      // calculate next payment date
      const nextChargeDate = calculatePeriod(interval);
      const updateBody = {
        card,
        subscriptionDetails: {
          lastChargeDate: moment().toDate(),
          nextChargeDate,
          frequency,
          interval,
          timesBilled: frequency > 0 ? 1 : 0,
        },
      };
      await invoiceService.updateCreatorClient(creatorClient._id, { ...updateBody });
    }
    const paymentLink = await invoiceService.getPaymentLinkById(creatorPaymentLink);
    if (paymentLink.paymentType === PAYMENT_LINK_TYPES.EVENT) {
      /** once a ticket has been purchased subtract the ticket quantity from the total ticket quantity */
      const { eventMetaDetails } = creatorClient;
      const { tickets } = paymentLink.eventPayment;
      const updatedTickets = tickets.map((ticket) => {
        eventMetaDetails.ticketType.map((ticketType) => {
          if (ticket.ticketType === ticketType.type) {
            ticket.ticketQuantity -= ticketType.quantity;
          }
          return ticket;
        });
        return ticket;
      });
      const from = moment(paymentLink.eventPayment.date.from).format('dddd, MMMM Do · h:mm a z');
      const to = moment(paymentLink.eventPayment.date.to).format('dddd, MMMM Do · h:mm a z');
      const eventPayload = {
        ...paymentLink.toJSON(),
      };
      eventPayload.from = from;
      eventPayload.to = to;
      eventPayload.ticketLink = `https://${creatorPage.slug}.merchro.page/ticket?creatorPaymentLink=${paymentLink._id}&client=${creatorClient._id}`;
      await emailService.sendUserEventPaymentLinkTicket(JSON.parse(clientInfo), eventPayload);
      await invoiceService.updatePaymentLink(creatorPaymentLink, {
        eventPayment: { ...paymentLink.eventPayment.toJSON(), tickets: updatedTickets },
      });
    }

    const charge = Number(((Number(config.paymentProcessing.invoiceProcessingCharge) / 100) * amount).toFixed(2));
    const amountToPayCreator = amount - charge;
    const processingCost = Number((Number(config.paymentProcessing.invoiceProcessingCost) / 100) * amount).toFixed(2);
    const profit = charge - processingCost;
    const transaction = await paymentService.createTransactionRecord({
      user: creatorDetails._id,
      source: TRANSACTION_SOURCES.PAYMENT_LINK,
      type: TRANSACTION_TYPES.CREDIT,
      amount: amountToPayCreator,
      purpose: `Payment for ${paymentLink.pageName}`,
      createdBy: creatorClient.id,
      reference: tx_ref,
      meta: {
        user: creatorClient._id,
        payerName: `${paymentLink.pageName}/${creatorClient.clientFirstName} ${creatorClient.clientLastName}`,
        email: creatorClient.clientEmail,
        currency: CURRENCIES.NAIRA,
      },
    });
    await paymentService.addToBalance(amountToPayCreator, creatorDetails._id);
    mixPanel(EVENTS.PAID_FROM_PAYMENT_LINK, transaction);
    await paymentService.createMerchroEarningsRecord({
      user: creatorDetails._id,
      source: TRANSACTION_SOURCES.PAYMENT_LINK,
      amount: amountToPayCreator,
      charge,
      profit,
      transaction: transaction._id,
      amountSpent: processingCost,
    });
    // calculate the totalAmount of tickets bought
    let data = {};
    if (paymentLink.paymentType === PAYMENT_LINK_TYPES.EVENT) {
      const totalTickets = creatorClient.eventMetaDetails.ticketType.reduce((acc, ticket) => acc + ticket.quantity, 0);
      delete creatorClient.eventMetaDetails;
      data = {
        eventObject: {
          totalTickets,
          purchaser: creatorClient,
        },
        paymentLink,
      };
    } else {
      data = {
        paymentLink,
      };
    }
    res.send(data);
  } else {
    // Inform the customer their payment was unsuccessful
    throw new ApiError(httpStatus.BAD_REQUEST, 'Payment was unsuccessful');
  }
});

const generateCheckoutLink = catchAsync(async (req, res) => {
  const getCreatorPaymentLink = await invoiceService.getPaymentLinkById(req.body.creatorPaymentLinkId);
  const { event } = req.body;
  if (event) {
    const { tickets } = getCreatorPaymentLink.eventPayment;
    tickets.map((ticket) => {
      event.ticketType.map((ticketType) => {
        if (ticket.ticketType === ticketType.type) {
          if (ticket.ticketQuantity < ticketType.quantity) {
            throw new ApiError(
              httpStatus.BAD_REQUEST,
              `Oops!, these quantity of ${ticketType.type} tickets is not available`
            );
          }
        }
      });
    });
  }
  req.body.creator = getCreatorPaymentLink.creator;
  req.body.creatorPaymentLink = getCreatorPaymentLink._id;
  req.body.eventMetaDetails = req.body.event;
  delete req.body.event;
  const charge = Number(((Number(config.paymentProcessing.invoiceProcessingCharge) / 100) * req.body.amount).toFixed(2));
  if (!getCreatorPaymentLink.absorbFees) req.body.amount = Number(req.body.amount) + charge;
  const paymentLink = await paymentService.getPaymentLink(
    {
      customer: {
        name: req.body.clientFirstName,
        email: req.body.clientEmail,
      },
      payment_options: 'card',
      meta: {
        creator: getCreatorPaymentLink.creator,
        creatorPaymentLink: getCreatorPaymentLink.id,
        paymentType: req.body.paymentType,
        interval: getCreatorPaymentLink.recurringPayment.interval,
        frequency: getCreatorPaymentLink.recurringPayment.frequency,
        clientInfo: JSON.stringify(req.body),
      },
      amount: req.body.amount,
      currency: CURRENCIES.NAIRA,
      tx_ref: generateRandomChar(10, 'num'),
      customizations: {
        title: getCreatorPaymentLink.pageName.toUpperCase(),
        logo: getCreatorPaymentLink.pageImage ? getCreatorPaymentLink.pageImage : 'https://www.merchro.com/logo-black.svg',
        description: getCreatorPaymentLink.pageDescription ? getCreatorPaymentLink.pageDescription : 'Payment ',
      },
    },
    req.body.redirectUrl
  );
  const data = { url: paymentLink };
  res.status(200).send(data);
});

const getPaymentLinkPurchased = catchAsync(async (req, res) => {
  const filter = { paymentCode: req.params.paymentCode, deletedAt: null, deletedBy: null, creator: req.user.id };
  const paymentLink = await invoiceService.getPaymentLink(filter);
  const _filter = { creatorPaymentLink: paymentLink._id, deletedAt: null };
  let peopleThatPaid = await invoiceService.getAllCreatorPaymentLinkClient(_filter);
  const totalAmountMadeFromSales = peopleThatPaid.reduce((acc, cur) => acc + cur.amount, 0);
  let totalTicketsSold = 0;
  peopleThatPaid = peopleThatPaid.map((person) => {
    person.eventMetaDetails.ticketType.map((ticket) => {
      totalTicketsSold += ticket.quantity;
    });
    const data = { ...person.toJSON() };
    data.totalTickets = person.eventMetaDetails.ticketType.reduce((acc, ticket) => acc + ticket.quantity, 0);
    return data;
  });
  const data = { totalAmountMadeFromSales, totalTicketsSold, peopleThatPaid };
  res.status(200).send(data);
});

const getTickets = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['creatorPaymentLink']);
  filter._id = req.query.client;
  filter.deletedAt = null;
  const client = await invoiceService.getCreatorPaymentLinkClient(filter);
  const paymentLink = await invoiceService.getPaymentLinkById(client.creatorPaymentLink);
  const totalTickets = client.eventMetaDetails.ticketType[client.eventMetaDetails.ticketType.length - 1].quantity;
  client.eventMetaDetails.ticketType = client.eventMetaDetails.ticketType[client.eventMetaDetails.ticketType.length - 1];
  const data = { totalTickets, client, paymentLink };
  res.status(200).send(data);
});

const sendInvoiceReminders = catchAsync(async (req, res) => {
  const options = ['client', 'creator'];
  const invoice = await invoiceService.getInvoiceById(req.params.invoiceId, options);
  const data = { ...invoice.toJSON() };
  data.dueDate = moment(data.dueDate).format('Do MMM, YYYY');
  await emailService.sendInvoiceReminderEmail(data);
  res.status(204).send();
});

module.exports = {
  createInvoice,
  queryCreatorClient,
  createClient,
  getInvoices,
  updateInvoice,
  getInvoice,
  deleteInvoice,
  createIssue,
  createPaymentLink,
  getPaymentLinks,
  generateCheckoutLink,
  paymentLinkPay,
  getPaymentLink,
  getPaymentLinkPurchased,
  processInvoicePayment,
  getTickets,
  sendInvoiceReminders,
  updatePaymentLink,
  deletePaymentLink,
  getPaymentLinkBySlug,
};
