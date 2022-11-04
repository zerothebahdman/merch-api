const moment = require('moment');
/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const { Invoice, Client, ReportIssue, PaymentLink, PaymentLinkClient } = require('../models');
const ApiError = require('../utils/ApiError');

const getInvoiceById = async (id, eagerLoadFields = false) => {
  const filter = { _id: id, deletedBy: null };
  return eagerLoadFields ? Invoice.findOne(filter).populate(eagerLoadFields) : Invoice.findOne(filter);
};

const getInvoice = async (filter, options = {}, actor, ignorePagination = false) => {
  filter.deletedBy = null;
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

const getCreatorClient = async (creatorId) => {
  const client = await Client.find({ creator: creatorId, deletedAt: null, deletedBy: null });
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

const getPaymentLinks = async (filter) => {
  const paymentLink = await PaymentLink.find(filter);
  return paymentLink;
};

const getPaymentLink = async (filter) => {
  const paymentLink = await PaymentLink.findOne(filter);
  return paymentLink;
};

const getPaymentLinkById = async (id) => {
  const paymentLink = await PaymentLink.findById(id);
  return paymentLink;
};

const createCreatorPaymentLinkClient = async (clientBody) => {
  const clientExist = await PaymentLinkClient.findOne({
    email: clientBody.email,
    paymentType: clientBody.paymentType,
    creatorPaymentLink: clientBody.creatorPaymentLinkId,
    deletedAt: null,
    creator: clientBody.creator,
  });
  if (!clientExist) {
    const client = await PaymentLinkClient.create(clientBody);
    return client;
  }
  return clientExist;
};

const getCreatorPaymentLinkClient = async (creatorPaymentLinkClient, paymentLinkId) => {
  const client = await PaymentLinkClient.findOne({
    _id: creatorPaymentLinkClient,
    creatorPaymentLink: paymentLinkId,
    deletedAt: null,
  });
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
};
