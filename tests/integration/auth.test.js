const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const httpMocks = require('node-mocks-http');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const app = require('../../src/app');
const config = require('../../src/config/config');
const auth = require('../../src/middlewares/auth');
const { tokenService, emailService } = require('../../src/services');
const ApiError = require('../../src/utils/ApiError');
const setupTestDB = require('../utils/setupTestDB');
const { User, Token } = require('../../src/models');
const { ROLES, roleRights } = require('../../src/config/roles');
const { tokenTypes } = require('../../src/config/tokens');
const { userOne, userTwo, userThree, admin, insertUsers } = require('../fixtures/user.fixture');
const { userOneAccessToken, userTwoAccessToken, adminAccessToken } = require('../fixtures/token.fixture');
const { USER_STATUSES } = require('../../src/config/constants');
const { ERROR_MESSAGES } = require('../../src/config/messages');

setupTestDB();

describe('Auth routes', () => {
  describe('POST /v1/auth/admin/sign-up', () => {
    let newUser;
    beforeEach(() => {
      newUser = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email().toLowerCase(),
        password: 'Password1@',
      };
      jest.spyOn(emailService.transport, 'sendMail').mockResolvedValue();
    });

    // eslint-disable-next-line jest/no-disabled-tests
    test.skip('should return 201 and successfully sign up an admin if request data is ok', async () => {
      const sendAdminSignUpEmailSpy = jest.spyOn(emailService, 'sendAdminSignUpEmail');
      const res = await request(app).post('/v1/auth/admin/sign-up').send(newUser).expect(httpStatus.CREATED);

      expect(res.body.user).not.toHaveProperty('password');
      expect(res.body.user).toEqual({
        id: expect.anything(),
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: ROLES.ADMIN,
        emailVerified: false,
        status: USER_STATUSES.INVITATION_SENT,
      });

      const dbUser = await User.findById(res.body.user.id);
      expect(dbUser).toBeDefined();
      expect(dbUser.password).not.toBe(newUser.password);
      expect(dbUser).toMatchObject({
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: ROLES.ADMIN,
      });

      expect(sendAdminSignUpEmailSpy).toHaveBeenCalledWith(newUser.email, expect.any(String));
      const emailVerificationToken = sendAdminSignUpEmailSpy.mock.calls[0][1];
      const dbEmailVerificationTokenDoc = await Token.findOne({ token: emailVerificationToken, user: newUser._id });
      expect(dbEmailVerificationTokenDoc).toBeDefined();
    });

    test('should return 400 error if email is invalid', async () => {
      newUser.email = 'invalidEmail';

      await request(app).post('/v1/auth/admin/sign-up').send(newUser).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if email is already used', async () => {
      await insertUsers([userOne]);
      newUser.email = userOne.email;

      await request(app).post('/v1/auth/admin/sign-up').send(newUser).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if password length is less than 8 characters', async () => {
      newUser.password = 'passwo1';

      await request(app).post('/v1/auth/admin/sign-up').send(newUser).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if password does not contain both letters and numbers', async () => {
      newUser.password = 'password';

      await request(app).post('/v1/auth/admin/sign-up').send(newUser).expect(httpStatus.BAD_REQUEST);

      newUser.password = '11111111';

      await request(app).post('/v1/auth/admin/sign-up').send(newUser).expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /v1/auth/resend-email-verification', () => {
    beforeEach(() => {
      jest.spyOn(emailService.transport, 'sendMail').mockResolvedValue();
    });

    // eslint-disable-next-line jest/no-disabled-tests
    test.skip('should return 200, user found, and resend verification e-mail', async () => {
      const sendAdminSignUpEmailSpy = jest.spyOn(emailService, 'sendAdminSignUpEmail');
      await insertUsers([userThree]);
      const data = { email: userThree.email };
      const res = await request(app).post('/v1/auth/resend-email-verification').send(data);
      expect(res.body.user).not.toHaveProperty('password');
      expect(res.body.user).toEqual({
        id: expect.anything(),
        firstName: userThree.firstName,
        lastName: userThree.lastName,
        email: userThree.email,
        role: userThree.role,
        emailVerified: false,
        status: USER_STATUSES.INVITATION_SENT,
      });

      const dbUser = await User.findById(res.body.user.id);
      expect(dbUser).toBeDefined();
      expect(dbUser.password).not.toBe(userThree.password);
      expect(dbUser).toMatchObject({
        firstName: userThree.firstName,
        lastName: userThree.lastName,
        email: userThree.email,
        role: userThree.role,
      });

      expect(sendAdminSignUpEmailSpy).toHaveBeenCalledWith(userThree.email, expect.any(String));
      const emailVerificationToken = sendAdminSignUpEmailSpy.mock.calls[0][1];
      const dbEmailVerificationTokenDoc = await Token.findOne({ token: emailVerificationToken, user: userThree._id });
      expect(dbEmailVerificationTokenDoc).toBeDefined();
    });

    test('should return 404, if user is not found', async () => {
      const res = await request(app).post('/v1/auth/resend-email-verification').send({ email: 'x@something.com' });
      expect(res.body).toEqual({ code: httpStatus.NOT_FOUND, message: ERROR_MESSAGES.USER_NOT_FOUND });
    });

    test('should return 400 error if email is already verified', async () => {
      await insertUsers([userTwo]);
      const data = { email: userTwo.email };
      await request(app).post('/v1/auth/resend-email-verification').send(data).expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /v1/auth/login', () => {
    test('should return 200 and login user if email and password match', async () => {
      await insertUsers([userTwo]);
      const loginCredentials = {
        email: userTwo.email,
        password: userTwo.password,
      };

      const res = await request(app).post('/v1/auth/login').send(loginCredentials).expect(httpStatus.OK);

      expect(res.body.user).toEqual({
        id: expect.anything(),
        firstName: userTwo.firstName,
        lastName: userTwo.lastName,
        email: userTwo.email,
        role: userTwo.role,
        emailVerified: true,
        isReviewer: false,
        timezone: '(GMT+01:00) Lagos',
        status: USER_STATUSES.CONFIRMED,
        reporting: {
          schedule: 'weekly',
          weekDay: 'friday',
        },
      });

      expect(res.body.tokens).toEqual({
        access: { token: expect.anything(), expires: expect.anything() },
        refresh: { token: expect.anything(), expires: expect.anything() },
      });
    });

    test('should return 401 error if there are no users with that email', async () => {
      const loginCredentials = {
        email: userOne.email,
        password: userOne.password,
      };

      const res = await request(app).post('/v1/auth/login').send(loginCredentials).expect(httpStatus.UNAUTHORIZED);

      expect(res.body).toEqual({ code: httpStatus.UNAUTHORIZED, message: ERROR_MESSAGES.INCORRECT_USERNAME_AND_PASSWORD });
    });

    test('should return 401 error if password is wrong', async () => {
      await insertUsers([userOne]);
      const loginCredentials = {
        email: userOne.email,
        password: 'wrongPassword1',
      };

      const res = await request(app).post('/v1/auth/login').send(loginCredentials).expect(httpStatus.UNAUTHORIZED);

      expect(res.body).toEqual({ code: httpStatus.UNAUTHORIZED, message: ERROR_MESSAGES.INCORRECT_USERNAME_AND_PASSWORD });
    });

    test('should return 401 error if user email is not verified', async () => {
      await insertUsers([userOne]);
      const loginCredentials = {
        email: userOne.email,
        password: userOne.password,
      };

      const res = await request(app).post('/v1/auth/login').send(loginCredentials).expect(httpStatus.UNAUTHORIZED);

      expect(res.body).toEqual({
        code: httpStatus.UNAUTHORIZED,
        message: ERROR_MESSAGES.USER_EMAIL_NOT_VERIFIED,
      });
    });
  });

  describe('POST /v1/auth/logout', () => {
    test('should return 204 if refresh token is valid', async () => {
      await insertUsers([userOne]);
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
      const refreshToken = tokenService.generateToken(userOne._id, expires, tokenTypes.REFRESH);
      await tokenService.saveToken(refreshToken, userOne._id, expires, tokenTypes.REFRESH);

      await request(app).post('/v1/auth/logout').send({ refreshToken }).expect(httpStatus.NO_CONTENT);

      const dbRefreshTokenDoc = await Token.findOne({ token: refreshToken });
      expect(dbRefreshTokenDoc).toBe(null);
    });

    test('should return 400 error if refresh token is missing from request body', async () => {
      await request(app).post('/v1/auth/logout').send().expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if refresh token is not found in the database', async () => {
      await insertUsers([userOne]);
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
      const refreshToken = tokenService.generateToken(userOne._id, expires, tokenTypes.REFRESH);

      await request(app).post('/v1/auth/logout').send({ refreshToken }).expect(httpStatus.NOT_FOUND);
    });

    test('should return 404 error if refresh token is blacklisted', async () => {
      await insertUsers([userOne]);
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
      const refreshToken = tokenService.generateToken(userOne._id, expires, tokenTypes.REFRESH);
      await tokenService.saveToken(refreshToken, userOne._id, expires, tokenTypes.REFRESH, true);

      await request(app).post('/v1/auth/logout').send({ refreshToken }).expect(httpStatus.NOT_FOUND);
    });
  });

  describe('POST /v1/auth/forgot-password', () => {
    beforeEach(() => {
      jest.spyOn(emailService.transport, 'sendMail').mockResolvedValue();
    });

    test('should return 204 and send reset password email to the user', async () => {
      await insertUsers([userOne]);
      const sendResetPasswordEmailSpy = jest.spyOn(emailService, 'sendResetPasswordEmail');

      await request(app).post('/v1/auth/forgot-password').send({ email: userOne.email }).expect(httpStatus.NO_CONTENT);

      expect(sendResetPasswordEmailSpy).toHaveBeenCalledWith(userOne.email, expect.any(String));
      const resetPasswordToken = sendResetPasswordEmailSpy.mock.calls[0][1];
      const dbResetPasswordTokenDoc = await Token.findOne({ token: resetPasswordToken, user: userOne._id });
      expect(dbResetPasswordTokenDoc).toBeDefined();
    });

    test('should return 400 if email is missing', async () => {
      await insertUsers([userOne]);

      await request(app).post('/v1/auth/forgot-password').send().expect(httpStatus.BAD_REQUEST);
    });

    test('should return 204 if email does not belong to any user', async () => {
      await request(app).post('/v1/auth/forgot-password').send({ email: userOne.email }).expect(httpStatus.NO_CONTENT);
    });
  });

  describe('POST /v1/auth/reset-password', () => {
    test('should return 204 and reset the password', async () => {
      await insertUsers([userOne]);
      const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
      const resetPasswordToken = tokenService.generateToken(userOne._id, expires, tokenTypes.RESET_PASSWORD);
      await tokenService.saveToken(resetPasswordToken, userOne._id, expires, tokenTypes.RESET_PASSWORD);

      await request(app)
        .post('/v1/auth/reset-password')
        .send({ password: 'Password2@', token: resetPasswordToken })
        .expect(httpStatus.NO_CONTENT);

      const dbUser = await User.findById(userOne._id);
      const isPasswordMatch = await bcrypt.compare('Password2@', dbUser.password);
      expect(isPasswordMatch).toBe(true);

      const dbResetPasswordTokenCount = await Token.countDocuments({ user: userOne._id, type: tokenTypes.RESET_PASSWORD });
      expect(dbResetPasswordTokenCount).toBe(0);
    });

    test('should return 400 if reset password token is missing', async () => {
      await insertUsers([userOne]);

      await request(app).post('/v1/auth/reset-password').send({ password: 'Password2@' }).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 if reset password token is blacklisted', async () => {
      await insertUsers([userOne]);
      const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
      const resetPasswordToken = tokenService.generateToken(userOne._id, expires, tokenTypes.RESET_PASSWORD);
      await tokenService.saveToken(resetPasswordToken, userOne._id, expires, tokenTypes.RESET_PASSWORD, true);

      await request(app)
        .post('/v1/auth/reset-password')
        .send({ password: 'Password2@', token: resetPasswordToken })
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 if reset password token is expired', async () => {
      await insertUsers([userOne]);
      const expires = moment().subtract(1, 'minutes');
      const resetPasswordToken = tokenService.generateToken(userOne._id, expires, tokenTypes.RESET_PASSWORD);
      await tokenService.saveToken(resetPasswordToken, userOne._id, expires, tokenTypes.RESET_PASSWORD);

      await request(app)
        .post('/v1/auth/reset-password')
        .send({ password: 'Password2@', token: resetPasswordToken })
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 if user is not found', async () => {
      const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
      const resetPasswordToken = tokenService.generateToken(userOne._id, expires, tokenTypes.RESET_PASSWORD);
      await tokenService.saveToken(resetPasswordToken, userOne._id, expires, tokenTypes.RESET_PASSWORD);

      await request(app)
        .post('/v1/auth/reset-password')
        .send({ password: 'Password2@', token: resetPasswordToken })
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 if password is missing or invalid', async () => {
      await insertUsers([userOne]);
      const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
      const resetPasswordToken = tokenService.generateToken(userOne._id, expires, tokenTypes.RESET_PASSWORD);
      await tokenService.saveToken(resetPasswordToken, userOne._id, expires, tokenTypes.RESET_PASSWORD);

      await request(app).post('/v1/auth/reset-password').query({ token: resetPasswordToken }).expect(httpStatus.BAD_REQUEST);

      await request(app)
        .post('/v1/auth/reset-password')
        .send({ password: 'short1', token: resetPasswordToken })
        .expect(httpStatus.BAD_REQUEST);

      await request(app)
        .post('/v1/auth/reset-password')
        .send({ password: 'password', token: resetPasswordToken })
        .expect(httpStatus.BAD_REQUEST);

      await request(app)
        .post('/v1/auth/reset-password')
        .send({ password: 'password1', token: resetPasswordToken })
        .expect(httpStatus.BAD_REQUEST);

      await request(app)
        .post('/v1/auth/reset-password')
        .send({ password: 'Password1', token: resetPasswordToken })
        .expect(httpStatus.BAD_REQUEST);

      await request(app)
        .post('/v1/auth/reset-password')
        .send({ password: '11111111', token: resetPasswordToken })
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /v1/auth/verify-email', () => {
    test('should return 200 and verify user email', async () => {
      await insertUsers([userOne]);
      const expires = moment().add(config.jwt.emailVerificationExpirationMinutes, 'minutes');
      const emailVerificationToken = tokenService.generateToken(userOne._id, expires, tokenTypes.EMAIL_VERIFICATION);
      await tokenService.saveToken(emailVerificationToken, userOne._id, expires, tokenTypes.EMAIL_VERIFICATION);

      await request(app).post('/v1/auth/verify-email').send({ token: emailVerificationToken }).expect(httpStatus.OK);

      const dbUser = await User.findById(userOne._id);
      expect(dbUser).toBeDefined();
      expect(dbUser).toMatchObject({
        status: USER_STATUSES.CONFIRMED,
        emailVerified: true,
      });

      const dbEmailVerificationTokenCount = await Token.countDocuments({
        user: userOne._id,
        type: tokenTypes.EMAIL_VERIFICATION,
      });
      expect(dbEmailVerificationTokenCount).toBe(0);
    });

    test('should return 400 if email verification token is missing', async () => {
      await insertUsers([userOne]);

      await request(app).post('/v1/auth/verify-email').expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 if email verification token is blacklisted', async () => {
      await insertUsers([userOne]);
      const expires = moment().add(config.jwt.emailVerificationExpirationMinutes, 'minutes');
      const emailVerificationToken = tokenService.generateToken(userOne._id, expires, tokenTypes.EMAIL_VERIFICATION);
      await tokenService.saveToken(emailVerificationToken, userOne._id, expires, tokenTypes.EMAIL_VERIFICATION, true);

      await request(app)
        .post('/v1/auth/verify-email')
        .send({ token: emailVerificationToken })
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 if email verification token is expired', async () => {
      await insertUsers([userOne]);
      const expires = moment().subtract(1, 'minutes');
      const emailVerificationToken = tokenService.generateToken(userOne._id, expires, tokenTypes.EMAIL_VERIFICATION);
      await tokenService.saveToken(emailVerificationToken, userOne._id, expires, tokenTypes.EMAIL_VERIFICATION);

      await request(app)
        .post('/v1/auth/verify-email')
        .send({ token: emailVerificationToken })
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 if user is not found', async () => {
      const expires = moment().add(config.jwt.emailVerificationExpirationMinutes, 'minutes');
      const emailVerificationToken = tokenService.generateToken(userOne._id, expires, tokenTypes.EMAIL_VERIFICATION);
      await tokenService.saveToken(emailVerificationToken, userOne._id, expires, tokenTypes.EMAIL_VERIFICATION);

      await request(app)
        .post('/v1/auth/verify-email')
        .send({ token: emailVerificationToken })
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /v1/auth/verify-user-invitation', () => {
    test('should return 200 and verify user invitation', async () => {
      await insertUsers([userOne]);
      const expires = moment().add(config.jwt.userInvitationExpirationMinutes, 'minutes');
      const userInvitationToken = tokenService.generateToken(userOne._id, expires, tokenTypes.USER_INVITATION);
      await tokenService.saveToken(userInvitationToken, userOne._id, expires, tokenTypes.USER_INVITATION);

      await request(app).post('/v1/auth/verify-user-invitation').send({ token: userInvitationToken }).expect(httpStatus.OK);

      const dbUser = await User.findById(userOne._id);
      expect(dbUser).toBeDefined();
      expect(dbUser).toMatchObject({
        status: USER_STATUSES.CONFIRMED,
        emailVerified: true,
      });

      const dbUserInvitationTokenCount = await Token.countDocuments({
        user: userOne._id,
        type: tokenTypes.USER_INVITATION,
      });
      expect(dbUserInvitationTokenCount).toBe(0);
    });

    test('should return 400 if user invitation verification token is missing', async () => {
      await insertUsers([userOne]);

      await request(app).post('/v1/auth/verify-user-invitation').expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 if user invitation verification token is blacklisted', async () => {
      await insertUsers([userOne]);
      const expires = moment().add(config.jwt.userInvitationExpirationMinutes, 'minutes');
      const userInvitationToken = tokenService.generateToken(userOne._id, expires, tokenTypes.USER_INVITATION);
      await tokenService.saveToken(userInvitationToken, userOne._id, expires, tokenTypes.USER_INVITATION, true);

      await request(app)
        .post('/v1/auth/verify-user-invitation')
        .send({ token: userInvitationToken })
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 if user invitation verification token is expired', async () => {
      await insertUsers([userOne]);
      const expires = moment().subtract(1, 'minutes');
      const userInvitationToken = tokenService.generateToken(userOne._id, expires, tokenTypes.USER_INVITATION);
      await tokenService.saveToken(userInvitationToken, userOne._id, expires, tokenTypes.USER_INVITATION);

      await request(app)
        .post('/v1/auth/verify-user-invitation')
        .send({ token: userInvitationToken })
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 if user is not found', async () => {
      const expires = moment().add(config.jwt.userInvitationExpirationMinutes, 'minutes');
      const userInvitationToken = tokenService.generateToken(userOne._id, expires, tokenTypes.USER_INVITATION);
      await tokenService.saveToken(userInvitationToken, userOne._id, expires, tokenTypes.USER_INVITATION);

      await request(app)
        .post('/v1/auth/verify-user-invitation')
        .send({ token: userInvitationToken })
        .expect(httpStatus.UNAUTHORIZED);
    });
  });
});

describe('Auth middleware', () => {
  beforeEach(async () => {
    const adminCopy = {};
    Object.assign(adminCopy, admin);

    const userOneCopy = {};
    Object.assign(userOneCopy, userOne);

    await insertUsers([userOneCopy, adminCopy]);
  });
  test('should call next with no errors if access token is valid', async () => {
    const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${userOneAccessToken}` } });
    const next = jest.fn();

    await auth()(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith();
    expect(req.user._id).toEqual(userOne._id);
  });

  test('should call next with unauthorized error if access token is not found in header', async () => {
    const req = httpMocks.createRequest();
    const next = jest.fn();

    await auth()(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: ERROR_MESSAGES.USER_NOT_LOGGED_IN })
    );
  });

  test('should call next with unauthorized error if access token is not a valid jwt token', async () => {
    const req = httpMocks.createRequest({ headers: { Authorization: 'Bearer randomToken' } });
    const next = jest.fn();

    await auth()(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: ERROR_MESSAGES.USER_NOT_LOGGED_IN })
    );
  });

  test('should call next with unauthorized error if the token is not an access token', async () => {
    const expires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
    const refreshToken = tokenService.generateToken(userOne._id, expires, tokenTypes.REFRESH);
    const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${refreshToken}` } });
    const next = jest.fn();

    await auth()(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: ERROR_MESSAGES.USER_NOT_LOGGED_IN })
    );
  });

  test('should call next with unauthorized error if access token is generated with an invalid secret', async () => {
    const expires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
    const accessToken = tokenService.generateToken(userOne._id, expires, tokenTypes.ACCESS, 'invalidSecret');
    const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${accessToken}` } });
    const next = jest.fn();

    await auth()(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: ERROR_MESSAGES.USER_NOT_LOGGED_IN })
    );
  });

  test('should call next with unauthorized error if access token is expired', async () => {
    const expires = moment().subtract(1, 'minutes');
    const accessToken = tokenService.generateToken(userOne._id, expires, tokenTypes.ACCESS);
    const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${accessToken}` } });
    const next = jest.fn();

    await auth()(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: ERROR_MESSAGES.USER_NOT_LOGGED_IN })
    );
  });

  test('should call next with unauthorized error if user is not found', async () => {
    const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${userTwoAccessToken}` } });
    const next = jest.fn();

    await auth()(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: ERROR_MESSAGES.USER_NOT_LOGGED_IN })
    );
  });

  test('should call next with forbidden error if user does not have required rights and userId is not in params', async () => {
    const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${userOneAccessToken}` } });
    const next = jest.fn();

    await auth('anyRight')(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: httpStatus.FORBIDDEN, message: ERROR_MESSAGES.FORBIDDEN })
    );
  });

  test('should call next with no errors if user does not have required rights but userId is in params', async () => {
    const req = httpMocks.createRequest({
      headers: { Authorization: `Bearer ${userOneAccessToken}` },
      params: { userId: userOne._id.toString() },
    });
    const next = jest.fn();

    await auth('anyRight')(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith();
  });

  test('should call next with no errors if user has required rights', async () => {
    const req = httpMocks.createRequest({
      headers: { Authorization: `Bearer ${adminAccessToken}` },
      params: { userId: userOne._id.toString() },
    });
    const next = jest.fn();

    await auth(...roleRights.get(ROLES.ADMIN))(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith();
  });
});
