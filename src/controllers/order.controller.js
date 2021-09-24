const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { merchService, imageService } = require('../services');
const { ERROR_MESSAGES } = require('../config/messages');

const createMerch = catchAsync(async (req, res) => {
  req.body.createdBy = req.user.id;
  const merch = await merchService.createMerch(req.body);
  res.status(httpStatus.CREATED).send(merch);
});

const getMerch = catchAsync(async (req, res) => {
  const hub = await merchService.getMerchById(req.params.hubId, req.query.include);
  if (!hub) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.HUB_NOT_FOUND);
  }
  res.send(hub);
});

const getMerches = catchAsync(async (req, res) => {
  const merches = await merchService.queryMerches(req.params.merchId, req.query.include);
  if (!merches) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.HUB_NOT_FOUND);
  }
  res.send(merches);
});

const updateMerch = catchAsync(async (req, res) => {
  // Only the createdBy of a hub that should be able to update it.
  req.body.updatedBy = req.user.id;
  const merch = await merchService.updateMerchById(req.params.hubId, req.body);
  res.send(merch);
});

const uploadMerchImages = catchAsync(async (req, res) => {
  const response = await imageService.uploadBase64Image(req.body.avatar, 'merch-images');
  const payload = {
    avatar: {
      url: response.secure_url,
      meta: response,
    },
    updatedBy: req.user.id,
  };
  const merch = await merchService.updateMerchById(req.params.merchId, payload);
  res.send(merch);
});

module.exports = {
  createMerch,
  getMerch,
  getMerches,
  updateMerch,
  uploadMerchImages,
};
