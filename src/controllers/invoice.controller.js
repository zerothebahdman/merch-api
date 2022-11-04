/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const { TRANSACTION_SOURCES, TRANSACTION_TYPES, CURRENCIES, PAYMENT_LINK_TYPES } = require('../config/constants');
const { invoiceService, paymentService, userService } = require('../services');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { generateRandomChar } = require('../utils/helpers');

const createInvoice = catchAsync(async (req, res) => {
  req.body.creator = req.user.id;
  req.body.invoiceNumber = `#INV-${generateRandomChar(5, 'num')}`;
  const invoice = await invoiceService.createInvoice(req.body);
  res.status(201).send(invoice);
});

const updateInvoice = catchAsync(async (req, res) => {
  const invoice = await invoiceService.updateInvoiceById(req.params.invoiceId, req.body);
  res.send(invoice);
});

const getInvoices = catchAsync(async (req, res) => {
  const filter = { creator: req.user.id };
  const invoices = await invoiceService.getInvoice(filter, { populate: 'client' }, req.user);
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

const getCreatorClient = catchAsync(async (req, res) => {
  const client = await invoiceService.getCreatorClient(req.user.id);
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
  const paymentLink = await invoiceService.createPaymentLink(req.body);
  res.status(200).send(paymentLink);
});

const getPaymentLinks = catchAsync(async (req, res) => {
  const filter = { creator: req.user.id, deletedAt: null, deletedBy: null };
  const paymentLink = await invoiceService.getPaymentLinks(filter);
  res.status(400).send(paymentLink);
});

const getPaymentLink = catchAsync(async (req, res) => {
  const filter = { paymentCode: req.params.paymentCode, deletedAt: null, deletedBy: null };
  const paymentLink = await invoiceService.getPaymentLink(filter);
  res.status(200).send(paymentLink);
});

const paymentLinkPay = catchAsync(async (req, res) => {
  const proceed = await paymentService.controlTransaction(req.body);
  if (!proceed) throw new ApiError(httpStatus.BAD_REQUEST, 'Transaction already processed.');
  const validatePayment = await paymentService.validatePayment(req.body.transaction_id);
  if (validatePayment.data.status === 'successful') {
    const {
      card,
      amount,
      meta: { creator, creatorPaymentLinkClient, creatorPaymentLink, paymentType },
    } = validatePayment.data;
    const creatorClient = await invoiceService.getCreatorPaymentLinkClient(creatorPaymentLinkClient, creatorPaymentLink);
    const creatorDetails = await userService.getUserById(creator);
    if (paymentType === PAYMENT_LINK_TYPES.SUBSCRIPTION)
      await invoiceService.updateCreatorClient(creatorClient._id, { card });
    const paymentLink = await invoiceService.getPaymentLinkById(creatorPaymentLink);
    if (paymentLink.paymentType === PAYMENT_LINK_TYPES.EVENT) {
      /** once a ticket has been purchased subtract the ticket quantity from the total ticket quantity */
      const { eventMetaDetails } = creatorClient;
      const { tickets } = paymentLink.eventPayment;
      const updatedTickets = tickets.map((ticket) => {
        const ticketIndex = eventMetaDetails.findIndex((item) => item.ticketType === ticket.ticketType);
        if (ticketIndex !== -1) {
          ticket.ticketQuantity -= eventMetaDetails[ticketIndex].ticketQuantity;
          return ticket;
        }
        return ticket;
      });
      await invoiceService.updatePaymentLink(creatorPaymentLink, { eventPayment: { tickets: updatedTickets } });
    }
    await paymentService.createTransactionRecord({
      user: creatorDetails._id,
      source: TRANSACTION_SOURCES.PAYMENT_LINK,
      type: TRANSACTION_TYPES.CREDIT,
      amount: Number(amount),
      purpose: `Payment for ${paymentLink.pageName}`,
      createdBy: creatorClient.id,
      reference: `#PL_${generateRandomChar(5, 'num')}`,
      meta: {
        user: creatorClient.id,
        payerName: `${paymentLink.pageName}/${creatorClient.firstName} ${creatorClient.lastName}`,
        email: creatorClient.email,
        currency: CURRENCIES.NAIRA,
      },
    });

    paymentService.addToBalance(amount, creatorDetails._id);
    res.send(paymentLink);
  } else {
    // Inform the customer their payment was unsuccessful
    throw new ApiError(httpStatus.BAD_REQUEST, 'Payment was unsuccessful');
  }
});

const generateCheckoutLink = catchAsync(async (req, res) => {
  const getCreatorPaymentLink = await invoiceService.getPaymentLinkById(req.body.creatorPaymentLinkId);
  const { event } = req.body;
  const { tickets } = getCreatorPaymentLink.eventPayment;
  event.map((item) => {
    const ticketIndex = tickets.findIndex((ticket) => ticket.ticketType === item.ticketType);
    if (ticketIndex !== -1 && item.ticketQuantity > tickets[ticketIndex].ticketQuantity)
      throw new ApiError(httpStatus.BAD_REQUEST, `Oops!, these quantity of ${item.ticketType} tickets is not available`);
    return {
      ticketType: item.ticketType,
      quantity: item.ticketQuantity,
    };
  });
  req.body.creator = getCreatorPaymentLink.creator;
  req.body.creatorPaymentLink = getCreatorPaymentLink._id;
  req.body.eventMetaDetails = req.body.event;
  delete req.body.event;
  const createCreatorPaymentLinkClient = await invoiceService.createCreatorPaymentLinkClient(req.body);
  const paymentLink = await paymentService.getPaymentLink(
    {
      customer: {
        name: createCreatorPaymentLinkClient.clientFirstName,
        email: createCreatorPaymentLinkClient.clientEmail,
      },
      payment_options: 'card',
      meta: {
        creator: getCreatorPaymentLink.creator,
        creatorPaymentLink: getCreatorPaymentLink.id,
        paymentType: req.body.paymentType,
        creatorPaymentLinkClient: createCreatorPaymentLinkClient.id,
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

module.exports = {
  createInvoice,
  getCreatorClient,
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
};
