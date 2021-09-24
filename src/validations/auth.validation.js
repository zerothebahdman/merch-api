const Joi = require('joi');
const { password } = require('./custom.validation');

const userSignUp = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    role: Joi.string(),
  }),
};

const resendEmailVerification = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
  }),
};

const resendUserInvitation = resendEmailVerification;

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
    token: Joi.string().required(),
    email: Joi.string().required(),
  }),
};

const emailVerify = {
  body: Joi.object().keys({
    token: Joi.string().required(),
    userId: Joi.string().required(),
  }),
};

const userInvitationVerify = {
  body: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

const googleAuthentication = {
  body: Joi.object().keys({
    token: Joi.string().required(),
    isAdmin: Joi.boolean(),
  }),
};

module.exports = {
  userSignUp,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  emailVerify,
  userInvitationVerify,
  resendEmailVerification,
  googleAuthentication,
  resendUserInvitation,
};
