const jwt = require('jsonwebtoken');
const moment = require('moment');
const httpStatus = require('http-status');
const config = require('../config/config');
const userService = require('./user.service');
const { Token } = require('../models');
const ApiError = require('../utils/ApiError');
const { generateRandomChar } = require('../utils/helpers');
const { tokenTypes } = require('../config/tokens');
const { ERROR_MESSAGES } = require('../config/messages');

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (userId, expires, type, secret = config.jwt.secret) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveToken = async (token, userId, expires, type, blacklisted = false) => {
  const tokenDoc = await Token.create({
    token,
    user: userId,
    expires: expires.toDate(),
    type,
    blacklisted,
  });
  return tokenDoc;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token, type, uid = false) => {
  let payload = {};
  if (!uid) {
    payload = jwt.verify(token, config.jwt.secret);
  } else {
    payload.sub = uid;
  }
  const tokenDoc = await Token.findOne({ token, type, user: payload.sub, blacklisted: false });
  if (!tokenDoc) {
    throw new Error(ERROR_MESSAGES.TOKEN_NOT_FOUND);
  }
  return tokenDoc;
};

/**
 * Revoke all user's invitation tokens
 * @param {User} user
 * @returns {Boolean}
 */
const revokeUserInvitationTokens = async (user) => {
  await Token.deleteMany({ user: user.id, type: tokenTypes.USER_INVITATION });
  return true;
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (user) => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = generateToken(user.id, accessTokenExpires, tokenTypes.ACCESS);

  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(user.id, refreshTokenExpires, tokenTypes.REFRESH);
  await saveToken(refreshToken, user.id, refreshTokenExpires, tokenTypes.REFRESH);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateResetPasswordToken = async (email) => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND);
  }
  const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
  const resetPasswordToken = generateRandomChar(6, 'num');
  await saveToken(resetPasswordToken, user.id, expires, tokenTypes.RESET_PASSWORD);
  return resetPasswordToken;
};

/**
 * Generate email verification token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateEmailVerificationToken = async (email) => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND);
  }
  const expires = moment().add(config.jwt.emailVerificationExpirationMinutes, 'minutes');
  const emailVerificationToken = generateRandomChar(6, 'num');
  await saveToken(emailVerificationToken, user.id, expires, tokenTypes.EMAIL_VERIFICATION);
  return emailVerificationToken;
};

/**
 * Generate user inviation token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateUserInvitationToken = async (email) => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND);
  }
  const expires = moment().add(config.jwt.userInvitationExpirationMinutes, 'minutes');
  const userInvitationToken = generateToken(user.id, expires, tokenTypes.USER_INVITATION);
  await saveToken(userInvitationToken, user.id, expires, tokenTypes.USER_INVITATION);
  return userInvitationToken;
};

/**
 * Generate user signup token
 * @param {User} user
 * @returns {Promise<string>}
 */
const generateUserSignUpToken = async (user) => {
  // TODO: We can switch to use userSignUpExpirationMinutes in the future
  const expires = moment().add(config.jwt.userInvitationExpirationMinutes, 'minutes');
  const userSignUpToken = generateToken(user.id, expires, tokenTypes.USER_SIGNUP);
  await saveToken(userSignUpToken, user.id, expires, tokenTypes.USER_SIGNUP);
  return userSignUpToken;
};

module.exports = {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateEmailVerificationToken,
  generateUserInvitationToken,
  generateUserSignUpToken,
  revokeUserInvitationTokens,
};
