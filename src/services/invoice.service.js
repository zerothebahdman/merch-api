const moment = require('moment');
/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const { Invoice, Client, ReportIssue } = require('../models');
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
  const client = await Client.find({ creator: creatorId });
  return client;
};

const createIssue = async (issueBody) => {
  const issue = await ReportIssue.create(issueBody);
  return issue;
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
};
