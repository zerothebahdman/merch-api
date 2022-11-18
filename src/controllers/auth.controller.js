const httpStatus = require('http-status');
const { OAuth2Client } = require('google-auth-library');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const {
  authService,
  userService,
  tokenService,
  emailService,
  onboardingService,
  // creatorPageService,
} = require('../services');
const { ROLES } = require('../config/roles');
const config = require('../config/config');
const { ERROR_MESSAGES } = require('../config/messages');
const { ONBOARDING_STAGES, USER_STATUSES, EVENTS } = require('../config/constants');
const mixPanel = require('../utils/mixpanel');
// const { backdoorAccess } = require('../config/config');

const userSignUp = catchAsync(async (req, res) => {
  const isCreator = req.body.role === ROLES.CREATOR;
  if (isCreator) {
    // if (!req.body.referralCode)
    //   throw new ApiError(httpStatus.BAD_REQUEST, 'You need a referral code to sign up as a creator');
    // const referral = await creatorPageService.queryCreatorPages({ slug: req.body.referralCode }, {}, '', true);
    // if (referral.length < 1 && req.body.referralCode !== backdoorAccess.referralCode)
    //   throw new ApiError(
    //     httpStatus.BAD_REQUEST,
    //     'Sorry, the referral code entered is invalid. Get a valid code to access Merchro'
    //   );
    const user = await userService.createUser(req.body);
    const emailVerificationToken = await tokenService.generateEmailVerificationToken(user.email);
    onboardingService.createOnboarding({ user: user.id, stages: [ONBOARDING_STAGES.SIGNED_UP] });
    emailService.sendUserSignUpEmail(user.email, emailVerificationToken, user.firstName);
    return res.status(httpStatus.CREATED).send(user);
  }
  let user = await userService.getUserByEmail(req.body.email);
  if (user) {
    const tokens = await tokenService.generateAuthTokens(user);
    return res.send({ user, tokens });
  }
  user = await userService.createUser(req.body);
  mixPanel(EVENTS.LOGIN, user);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const verifyEmail = catchAsync(async (req, res) => {
  const user = await authService.verifyEmail(req.body.token, req.body.userId);
  const tokens = await tokenService.generateAuthTokens(user);
  onboardingService.updateOnboardingNextStages(user.id, [ONBOARDING_STAGES.EMAIL_VERIFIED]);
  emailService.sendUserWelcomeEmail(user.email, user.firstName);
  res.send({ user, tokens });
});

const verifyUserInvitation = catchAsync(async (req, res) => {
  const user = await authService.verifyUserInvitation(req.body.token);
  const token = await tokenService.generateUserSignUpToken(user);
  onboardingService.updateOnboardingNextStages(user.id, [ONBOARDING_STAGES.EMAIL_VERIFIED]);
  res.send({ user, redirectUrl: `${config.userSignupPageUrl}?token=${token}&email=${user.email}` });
});

const resendEmailVerification = catchAsync(async (req, res) => {
  const user = await userService.getUserByEmail(req.body.email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND);
  }
  if (user.emailVerified) {
    throw new ApiError(httpStatus.BAD_REQUEST, ERROR_MESSAGES.USER_EMAIL_VERIFIED);
  }
  const emailVerificationToken = await tokenService.generateEmailVerificationToken(user.email);
  emailService.sendUserSignUpEmail(user.email, emailVerificationToken, user.firstName);
  res.send(user);
});

const resendUserInvitation = catchAsync(async (req, res) => {
  const user = await userService.getUserByEmail(req.body.email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND);
  }
  if (user.emailVerified) {
    throw new ApiError(httpStatus.BAD_REQUEST, ERROR_MESSAGES.USER_EMAIL_VERIFIED);
  }
  const userInvitationToken = await tokenService.generateUserInvitationToken(user.email);
  emailService.sendUserInvitationEmail(user.email, userInvitationToken);
  res.send(user);
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  let user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  user = await userService.getUserById(user.id);
  mixPanel(EVENTS.LOGIN, user);
  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  try {
    const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
    const user = await userService.getUserByEmail(req.body.email);
    emailService.sendResetPasswordEmail(
      req.body.email,
      resetPasswordToken,
      user.firstName ? user.firstName : user.email.split('@')[0]
    );
  } catch (error) {
    // TODO: Log error to sentry
  }
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.password, req.body.email);
  res.status(httpStatus.NO_CONTENT).send();
});

const googleAuthentication = catchAsync(async (req, res) => {
  /**
   * Sign Up | Sign In Use Cases
    - An invited user, uses the invitation link and comes back later to sign in to the application using Google
    - An invited user, does not use the invitation link, comes to the application to sign in using Google
    - A new user, uses the Google sign up to register on the application, redirected to the hub setup
    - A new user, uses the Google sign in to register on the application, redirected to the hub setup
    - An user that has already sign up, receives the email verification code, does not use the verification code, comes to the application to sign up using Google
    - An user that has already sign up, receives the email verification code, does not use the verification code, comes to the application to sign in using Google
    - A verified user, sign up using Google
    - A verified user, sign in using Google
    Information payload from Google
    -> iss, azp, aud, sub, email, email_verified, at_has, name, picture, given_name, family_name, locale, iat, exp, jti
   */
  const { token } = req.body;
  const client = new OAuth2Client(config.google.clientId);
  const response = await client.verifyIdToken({
    idToken: token,
    audience: config.google.clientId,
  });

  const googleUser = response.getPayload();
  // TODO: There is an email_verified field coming from google,
  // determine whether we are to use it our not.
  let user = await userService.getUserByEmail(googleUser.email);
  if (!user) {
    if (!req.body.isAdmin) {
      // Raise an error because a non-admin is meant to be invited/created by the admin
      throw new ApiError(httpStatus.UNAUTHORIZED, ERROR_MESSAGES.USER_IS_NOT_INVITED);
    }
    // We need to create a new admin
    user = await userService.createUser({
      firstName: googleUser.given_name,
      lastName: googleUser.family_name,
      email: googleUser.email,
      emailVerified: true,
      role: ROLES.userService,
      status: USER_STATUSES.CONFIRMED,
      googleId: googleUser.sub,
    });
    // Login the admin & Redirect the user to the required page.
    mixPanel(EVENTS.SIGNED_UP, user);
    const tokens = await tokenService.generateAuthTokens(user);
    res.send({ user, tokens, redirectUrl: `${config.hubSetupPageUrl}?access_token=${tokens.access.token}` });
  } else {
    // If an existing user or admin is using google to sign in
    user = await userService.updateUserById(user.id, {
      firstName: googleUser.given_name,
      lastName: googleUser.family_name,
      emailVerified: true,
      status: USER_STATUSES.CONFIRMED,
      googleId: googleUser.sub,
    });

    const tokens = await tokenService.generateAuthTokens(user);
    if (user.hub) {
      user = await userService.getUserById(user.id, ['hub']);
      mixPanel(EVENTS.SIGNED_UP, user);
      res.send({ user, tokens });
    } else if (user.role === ROLES.userService && !user.hub) {
      // when the user is an admin and does not have a hub
      res.send({ user, tokens, redirectUrl: `${config.hubSetupPageUrl}?access_token=${tokens.access.token}` });
    } else {
      // when the user is not an admin and does not have a hub, throw an error
      throw new ApiError(httpStatus.UNAUTHORIZED, ERROR_MESSAGES.USER_WITHOUT_HUB);
    }
  }
});

module.exports = {
  userSignUp,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
  verifyUserInvitation,
  resendEmailVerification,
  googleAuthentication,
  resendUserInvitation,
};
