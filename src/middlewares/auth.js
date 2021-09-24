const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { roleRights, ROLES } = require('../config/roles');
const { ERROR_MESSAGES } = require('../config/messages');
const { USER_STATUSES } = require('../config/constants');

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, ERROR_MESSAGES.USER_NOT_LOGGED_IN));
  }
  req.user = user;

  /**
   * Sort out include query param.
   *  */
  if ('include' in req.query) {
    const { include } = req.query;
    try {
      req.query.include = include
        ? include
            .replace('[', '')
            .replace(']', '')
            .split(',')
            .map((item) => item.trim())
        : null;
    } catch (ex) {
      // TODO: Log the error here.
      req.query.include = null;
    }
  }

  if (user.status === USER_STATUSES.DEACTIVATED) {
    throw new ApiError(httpStatus.UNAUTHORIZED, ERROR_MESSAGES.USER_DEACTIVATED);
  }

  if (requiredRights.length) {
    const userRights = roleRights.get(user.role);
    const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
    if (!hasRequiredRights && req.params.userId !== user.id) {
      return reject(new ApiError(httpStatus.FORBIDDEN, ERROR_MESSAGES.FORBIDDEN));
    }
  }

  /**
   * Check if the user already has a hub assigned. If not, reject the request
   * excluded endpoints POST /hubs
   */
  const EXCLUDED_ADMIN_URLS = ['/v1/hubs'];

  if (req.user.role === ROLES.USER && req.user.hubs === undefined) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, ERROR_MESSAGES.CONTACT_ADMINISTRATOR));
  }

  if (req.user.role === ROLES.ADMIN && req.user.hubs === undefined && EXCLUDED_ADMIN_URLS.indexOf(req.originalUrl) < 0) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, ERROR_MESSAGES.USER_WITHOUT_HUB));
  }

  resolve();
};

const auth = (...requiredRights) => async (req, res, next) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
  })
    .then(() => next())
    .catch((err) => next(err));
};

module.exports = auth;
