const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { waitlistService, emailService } = require('../services');
const pick = require('../utils/pick');

const addEmail = catchAsync(async (req, res) => {
  const { email } = req.body;
  const response = await waitlistService.addEmail(req.body);
  emailService.waitlistEmail(email);
  res.status(httpStatus.CREATED).send(response);
});

const checkIfEmailExist = catchAsync(async (req, res) => {
  const email = await waitlistService.verifyEmail(req.params.email);
  if (!email) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Email not found in wailtist');
  }
  res.send(email);
});

const getEmails = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['createdAt']);
  const options = pick(req.query, ['page', 'limit', 'sort']);
  const emails = await waitlistService.queryEmails(filter, options, req.query.include);
  res.send(emails);
});

module.exports = {
  addEmail,
  checkIfEmailExist,
  getEmails,
};
