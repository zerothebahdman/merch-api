const httpStatus = require('http-status');
const tokenService = require('./token.service');
const userService = require('./user.service');
const Token = require('../models/token.model');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const { USER_STATUSES } = require('../config/constants');
const { ERROR_MESSAGES } = require('../config/messages');

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, ERROR_MESSAGES.INCORRECT_USERNAME_AND_PASSWORD);
  }
  // if (!user.emailVerified) {
  //   throw new ApiError(httpStatus.UNAUTHORIZED, ERROR_MESSAGES.USER_EMAIL_NOT_VERIFIED);
  // }
  if (user.status === USER_STATUSES.DEACTIVATED) {
    throw new ApiError(httpStatus.UNAUTHORIZED, ERROR_MESSAGES.USER_DEACTIVATED);
  }
  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.TOKEN_NOT_FOUND);
  }
  await refreshTokenDoc.remove();
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.remove();
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, ERROR_MESSAGES.USER_NOT_LOGGED_IN);
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword, email) => {
  try {
    // Get userId via email
    const user = await userService.getUserByEmail(email);
    if (!user) {
      throw new Error();
    }
    await userService.updateUserById(user.id, { password: newPassword });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, ERROR_MESSAGES.PASSWORD_RESET_FAILED);
  }
};

/**
 * Verify email
 * @param {string} emailVerificationToken
 * @returns {Promise}
 */
const verifyEmail = async (emailVerificationToken, userId) => {
  try {
    const emailVerificationTokenDoc = await tokenService.verifyToken(
      emailVerificationToken,
      tokenTypes.EMAIL_VERIFICATION,
      userId
    );
    let user = await userService.getUserById(emailVerificationTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    user = await userService.updateUserById(user.id, { emailVerified: true, status: USER_STATUSES.CONFIRMED });
    await Token.deleteMany({ user: user.id, type: tokenTypes.EMAIL_VERIFICATION });
    return user;
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, ERROR_MESSAGES.EMAIL_VERIFICATION_FAILED);
  }
};

/**
 * Verify user invitation
 * @param {string} userInvitationToken
 * @returns {Promise}
 */
const verifyUserInvitation = async (userInvitationToken) => {
  try {
    const userInvitationTokenDoc = await tokenService.verifyToken(userInvitationToken, tokenTypes.USER_INVITATION);
    let user = await userService.getUserById(userInvitationTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    user = await userService.updateUserById(user.id, { emailVerified: true, status: USER_STATUSES.CONFIRMED });
    await Token.deleteMany({ user: user.id, type: tokenTypes.USER_INVITATION });
    return user;
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, ERROR_MESSAGES.USER_INVITATION_VERIFICATION_FAILED);
  }
};

/**
 * Verify user signup
 * @param {string} userSignUpToken
 * @returns {Promise}
 */
const verifyUserSignUp = async (userSignUpToken) => {
  try {
    const userSignUpTokenDoc = await tokenService.verifyToken(userSignUpToken, tokenTypes.USER_SIGNUP);
    const user = await userService.getUserById(userSignUpTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await Token.deleteMany({ user: user.id, type: tokenTypes.USER_SIGNUP });
    return user;
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, ERROR_MESSAGES.USER_SIGNUP_VERIFICATION_FAILED);
  }
};

module.exports = {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
  verifyUserInvitation,
  verifyUserSignUp,
};
