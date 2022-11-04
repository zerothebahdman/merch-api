const { invoiceService } = require('../services');
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

module.exports = {
  createInvoice,
  getCreatorClient,
  createClient,
  getInvoices,
  updateInvoice,
  getInvoice,
  deleteInvoice,
  createIssue,
};
