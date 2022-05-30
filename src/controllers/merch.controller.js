const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { merchService } = require('../services');
const { ERROR_MESSAGES } = require('../config/messages');
const { ROLES } = require('../config/roles');
const pick = require('../utils/pick');

const createMerch = catchAsync(async (req, res) => {
  req.body.user = req.user.id;
  req.body.creatorPage = req.user.creatorPage;
  req.body.createdBy = req.user.id;
  if (req.user.role !== ROLES.CREATOR) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not have permission to create Merch');
  }
  const merch = await merchService.createMerch(req.body);
  res.status(httpStatus.CREATED).send(merch);
});

const getMerch = catchAsync(async (req, res) => {
  const merch = await merchService.queryMerchById(req.params.merchId, req.query.include, req.user);
  if (!merch) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.MERCH_NOT_FOUND);
  }
  res.send(merch);
});

const getMerches = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'creatorPage', 'slug', 'published']);
  const options = pick(req.query, ['page', 'limit', 'sortBy']);
  if (req.query.include) options.populate = req.query.include;
  const merchs = await merchService.queryMerches(filter, options, req.user, !req.query.paginate);
  if (!merchs) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.MERCH_NOT_FOUND);
  }
  res.send(merchs);
});

const updateMerch = catchAsync(async (req, res) => {
  req.body.updatedBy = req.user.id;
  const merch = await merchService.updateMerchById(req.params.merchId, req.body);
  res.send(merch);
});

const deleteMerch = catchAsync(async (req, res) => {
  await merchService.deleteMerchById(req.params.merchId, req.user);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createMerch,
  getMerch,
  getMerches,
  updateMerch,
  deleteMerch,
};
