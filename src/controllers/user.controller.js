const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService, imageService, goalService, tokenService, emailService } = require('../services');
const { ERROR_MESSAGES } = require('../config/messages');
const { USER_STATUSES, IMAGE_CLOUD_PROVIDERS } = require('../config/constants');
const { ROLES } = require('../config/roles');

const getUsers = catchAsync(async (req, res) => {
  // TODO: A regular user has access to this endpoint, should we do something about it
  // This is currently needed for the user to see the users under his workspace
  const filter = pick(req.query, ['firstName', 'role', 'lastName']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options, req.query.paginate !== true);
  res.send(result);
});

const getConfirmedUsers = catchAsync(async (req, res) => {
  // TODO: A regular user has access to this endpoint, should we do something about it
  // This is currently needed for the user to see the users under his workspace
  const filter = pick(req.query, ['firstName', 'role', 'lastName']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  filter.status = USER_STATUSES.CONFIRMED;
  const result = await userService.queryUsers(filter, options, req.query.paginate !== true);
  res.send(result);
});

const getInvitedUsers = catchAsync(async (req, res) => {
  // TODO: A regular user has access to this endpoint, should we do something about it
  // This is currently needed for the user to see the users under his workspace
  const filter = pick(req.query, ['firstName', 'role', 'lastName']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  filter.status = USER_STATUSES.INVITATION_SENT;
  const result = await userService.queryUsers(filter, options, req.query.paginate !== true);
  res.send(result);
});

const getDeactivatedUsers = catchAsync(async (req, res) => {
  // TODO: A regular user has access to this endpoint, should we do something about it
  // This is currently needed for the user to see the users under his workspace
  const filter = pick(req.query, ['firstName', 'role', 'lastName']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  // Ensure you can only fetch users in your own workspace.
  filter.workspace = req.user.workspace;
  filter.status = USER_STATUSES.DEACTIVATED;
  const result = await userService.queryUsers(filter, options, req.query.paginate !== true);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId, req.query.include);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND);
  }
  if (user.workspace._id.toString() !== req.user.workspace._id.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, ERROR_MESSAGES.FORBIDDEN);
  }
  res.send(user);
});

const getMe = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.user.id, req.query.include);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND);
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const actor = req.user;
  // There are some fields it should only be the admin that will update them
  const ADMIN_FIELDS = ['email', 'reviewer', 'reporting'];
  if (actor.role !== ROLES.ADMIN && Object.keys(req.body).some((r) => ADMIN_FIELDS.includes(r))) {
    throw new ApiError(httpStatus.BAD_REQUEST, ERROR_MESSAGES.NOT_ALLOWED_TO_UPDATE_FIELDS);
  }
  const user = await userService.updateUserById(req.params.userId, req.body, actor);
  res.send(user);
});

const uploadUserAvatar = catchAsync(async (req, res) => {
  const actor = req.user;
  const response = await imageService.uploadBase64Image(req.body.avatar, 'users-avatar');
  const payload = {
    avatar: {
      source: IMAGE_CLOUD_PROVIDERS.CLOUDINARY,
      url: response.secure_url,
      meta: response,
    },
  };
  const user = await userService.updateUserById(req.params.userId, payload, actor);
  res.send(user);
});

const changeUserPassword = catchAsync(async (req, res) => {
  let { user } = req;

  if (!(await user.isPasswordMatch(req.body.oldPassword))) {
    throw new ApiError(httpStatus.BAD_REQUEST, ERROR_MESSAGES.WRONG_PASSWORD);
  }
  user = await userService.updateUserById(req.params.userId, { password: req.body.newPassword }, user);
  res.send(user);
});

const deactivateUser = catchAsync(async (req, res) => {
  const actor = req.user;
  const payload = {
    status: USER_STATUSES.DEACTIVATED,
  };
  const user = await userService.updateUserById(req.params.userId, payload, actor);

  if (!user.emailVerified) {
    // Revoke the User Invitation Token for such User.
    tokenService.revokeUserInvitationTokens(user);
  }
  res.send(user);
});

const activateUser = catchAsync(async (req, res) => {
  const actor = req.user;
  let status = USER_STATUSES.CONFIRMED;

  let user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND);
  }

  if (!user.emailVerified) {
    status = USER_STATUSES.INVITATION_SENT;
  }

  user = await userService.updateUserById(req.params.userId, { status }, actor);

  if (!user.emailVerified) {
    // Resend User Invitation to the User
    const userInvitationToken = await tokenService.generateUserInvitationToken(user.email);
    emailService.sendUserInvitationEmail(user.email, userInvitationToken);
  }
  res.send(user);
});

const getUserActiveGoals = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND);
  }
  const filter = pick(req.query, ['name']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await goalService.queryUserActiveGoals(filter, options, user, req.user);
  res.send(result);
});

const getUserReviewees = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND);
  }
  const filter = pick(req.query, ['firstName', 'role', 'lastName']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const goalFilter = pick(req.query, ['goalStartDateBegin', 'goalStartDateEnd']);
  // Ensure you can only fetch users in your own workspace.
  filter.workspace = req.user.workspace;
  filter.reviewer = req.user.id;

  const result = await userService.queryUsers(filter, options, req.query.paginate !== true);
  const filter1 = {};
  if (req.query.include && req.query.include.includes('goals')) {
    // Loop through each user to fetch all their goals, no pagination.
    if (goalFilter && Object.keys(goalFilter).length > 0) {
      // Remove the goal in front of these filters.
      // eslint-disable-next-line no-restricted-syntax
      const startDate = {};

      if ('goalStartDateBegin' in goalFilter) {
        const gte = new Date(new Date(goalFilter.goalStartDateBegin).setHours(0, 0, 0));
        startDate.$gte = gte;
      }

      if ('goalStartDateEnd' in goalFilter) {
        const lte = new Date(new Date(goalFilter.goalStartDateEnd).setHours(23, 59, 59));
        startDate.$lte = lte;
      }

      filter1.startDate = startDate;
    }

    const promises = result.results.map(async (reviewee) => {
      const goals = await goalService.queryGoals(filter1, null, reviewee, req.user, true);
      return { goals, ...reviewee.toJSON() };
    });

    const reviewees = await Promise.all(promises);
    result.results = reviewees;
  }
  res.send(result);
});

module.exports = {
  getUsers,
  getUser,
  updateUser,
  getMe,
  deactivateUser,
  activateUser,
  getConfirmedUsers,
  getInvitedUsers,
  getDeactivatedUsers,
  uploadUserAvatar,
  changeUserPassword,
  getUserActiveGoals,
  getUserReviewees,
};
