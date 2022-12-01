const moment = require('moment');
/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const { Invoice, Client, ReportIssue, PaymentLink, PaymentLinkClient } = require('../models');
const ApiError = require('../utils/ApiError');
const { slugify, firstLetterOfEachWord, generateRandomChar } = require('../utils/helpers');

const getInvoiceById = async (id, eagerLoadFields = false) => {
  const filter = { _id: id, deletedBy: null };
  return eagerLoadFields ? Invoice.findOne(filter).populate(eagerLoadFields) : Invoice.findOne(filter);
};

const getInvoice = async (filter, options = {}, actor, ignorePagination = false) => {
  filter.deletedBy = null;
  filter.deletedAt = null;
  if (actor) filter.creator = actor.id;
  if (actor && filter.creator && actor.id === filter.creator) {
    if (!options.populate) options.populate = '';
    const merches = ignorePagination
      ? await Invoice.find(filter).populate(options.populate)
      : await Invoice.paginate(filter, options);
    return merches;
  }
  throw new ApiError(httpStatus.NOT_FOUND, 'Invoice not found');
};

const createInvoice = async (invoice) => {
  const newInvoice = await Invoice.create(invoice);
  return newInvoice;
};

const updateInvoiceById = async (invoiceId, updateBody) => {
  const invoice = await getInvoiceById(invoiceId);
  if (!invoice) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invoice not found');
  }
  Object.assign(invoice, updateBody);
  await invoice.save();
  return invoice;
};

const deleteInvoiceById = async (invoiceId) => {
  const invoice = await getInvoiceById(invoiceId);
  if (!invoice) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invoice not found');
  }
  invoice.deletedBy = invoice.creator;
  invoice.deletedAt = moment().toDate();
  await invoice.save();
  return invoice;
};

const createClient = async (client) => {
  const newClient = await Client.create(client);
  return newClient;
};

const queryCreatorClient = async (creatorId) => {
  const client = await Client.find({ creator: creatorId, deletedAt: null, deletedBy: null });
  return client;
};

const getCreatorClient = async (filter) => {
  const client = await Client.findOne(filter);
  return client;
};

const createIssue = async (issueBody) => {
  const issue = await ReportIssue.create(issueBody);
  return issue;
};

const createPaymentLink = async (paymentLinkBody) => {
  const paymentLink = await PaymentLink.create(paymentLinkBody);
  return paymentLink;
};

const updatePaymentLink = async (paymentLinkId, paymentLinkBody) => {
  const paymentLink = await PaymentLink.findById(paymentLinkId);
  if (!paymentLink) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Payment Link not found');
  }
  Object.assign(paymentLink, paymentLinkBody);
  await paymentLink.save();
  return paymentLink;
};

const getPaymentLinks = async (filter, options, actor, paginate = true) => {
  if (actor) filter.creator = actor.id;
  filter.deletedAt = null;
  const paymentLink = !paginate
    ? await PaymentLink.find(filter).populate(options.populate || '')
    : await PaymentLink.paginate(filter, options);
  return paymentLink;
};

const getPaymentLink = async (filter) => {
  const paymentLink = await PaymentLink.findOne(filter);
  return paymentLink;
};

const updatePaymentLinkById = async (paymentLinkCode, updateBody) => {
  const filter = { paymentCode: paymentLinkCode, deletedAt: null, deletedBy: null };
  const paymentLink = await getPaymentLink(filter);
  if (!paymentLink) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Payment Link not found');
  }
  if (!paymentLink.slug) updateBody.slug = slugify(paymentLink.pageName);
  Object.assign(paymentLink, updateBody);
  await paymentLink.save();
  return paymentLink;
};

const deletePaymentLinkById = async (paymentLinkCode) => {
  const filter = { paymentCode: paymentLinkCode, deletedAt: null, deletedBy: null };
  const paymentLink = await getPaymentLink(filter);
  if (!paymentLink) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Payment Link not found');
  }
  paymentLink.deletedBy = paymentLink.creator;
  paymentLink.deletedAt = moment().toDate();
  await paymentLink.save();
  return paymentLink;
};

const getPaymentLinkById = async (id) => {
  const paymentLink = await PaymentLink.findById(id);
  return paymentLink;
};

const getPaymentLinkBySlug = async (filter) => {
  const paymentLink = await PaymentLink.findOne(filter);
  return paymentLink;
};

const createCreatorPaymentLinkClient = async (clientBody) => {
  const clientExist = await PaymentLinkClient.findOne({
    clientEmail: clientBody.clientEmail,
    paymentType: clientBody.paymentType,
    creatorPaymentLink: clientBody.creatorPaymentLinkId,
    deletedAt: null,
    creator: clientBody.creator,
  });
  const getCreatorPaymentLink = await getPaymentLinkById(clientBody.creatorPaymentLinkId);
  if (clientExist && clientBody.paymentType === 'event') {
    clientBody.eventMetaDetails.ticketType.forEach((event) => {
      // depending on the event.quantity, create the ticketId
      const ticketIds = [];
      for (let i = 0; i < event.quantity; i += 1) {
        const ticketId = `${firstLetterOfEachWord(
          getCreatorPaymentLink.pageName
        ).toUpperCase()}-${event.type.toUpperCase()}-${generateRandomChar(6, 'num')}`;
        ticketIds.push(ticketId);
      }
      event.tickets = ticketIds;
      clientBody.eventMetaDetails.ticketType.push(event);
      // remove duplicate using type from client.eventMetaDetails.ticketType array
      const unique = [...new Map(clientBody.eventMetaDetails.ticketType.map((item) => [item.type, item])).values()];
      clientBody.eventMetaDetails.ticketType = unique;
      return clientBody;
    });
    const client = await PaymentLinkClient.create(clientBody);
    return client;
  }
  if (!clientExist) {
    clientBody.eventMetaDetails.ticketType.forEach((event) => {
      // depending on the event.quantity, create the ticketId
      const ticketIds = [];
      for (let i = 0; i < event.quantity; i += 1) {
        const ticketId = `${firstLetterOfEachWord(
          getCreatorPaymentLink.pageName
        ).toUpperCase()}-${event.type.toUpperCase()}-${generateRandomChar(6, 'num')}`;
        ticketIds.push(ticketId);
      }
      event.tickets = ticketIds;
      clientBody.eventMetaDetails.ticketType.push(event);
      // remove duplicate using type from client.eventMetaDetails.ticketType array
      const unique = [...new Map(clientBody.eventMetaDetails.ticketType.map((item) => [item.type, item])).values()];
      clientBody.eventMetaDetails.ticketType = unique;
      return clientBody;
    });
    const client = await PaymentLinkClient.create(clientBody);
    return client;
  }
  return clientExist;
};

const getCreatorPaymentLinkClient = async (filter) => {
  const client = await PaymentLinkClient.findOne(filter);
  return client;
};
const getAllCreatorPaymentLinkClient = async (filter) => {
  const client = await PaymentLinkClient.find(filter);
  return client;
};

const updateCreatorClient = async (creatorPaymentLinkClient, updateBody) => {
  const client = await PaymentLinkClient.findById(creatorPaymentLinkClient);
  if (!client) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Client not found');
  }
  if (client.eventMetaDetails && client.eventMetaDetails.length > 0) {
    client.eventMetaDetails.push(updateBody.eventMetaDetails);
  }
  Object.assign(client, updateBody);
  await client.save();
  return client;
};

module.exports = {
  getInvoiceById,
  createInvoice,
  createClient,
  queryCreatorClient,
  getCreatorClient,
  getInvoice,
  updateInvoiceById,
  deleteInvoiceById,
  createIssue,
  createPaymentLink,
  updatePaymentLink,
  getPaymentLinks,
  getPaymentLinkById,
  createCreatorPaymentLinkClient,
  getCreatorPaymentLinkClient,
  updateCreatorClient,
  getPaymentLink,
  getAllCreatorPaymentLinkClient,
  updatePaymentLinkById,
  deletePaymentLinkById,
  getPaymentLinkBySlug,
};
