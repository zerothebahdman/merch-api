/* eslint-disable jest/no-disabled-tests */
const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { User } = require('../../src/models');
const { userOne, userTwo, userThree, admin, insertUsers } = require('../fixtures/user.fixture');
const { userOneAccessToken, userTwoAccessToken, adminAccessToken } = require('../fixtures/token.fixture');
const { ROLES } = require('../../src/config/roles');
const { capitalCase } = require('../../src/utils/helpers');

setupTestDB();

describe('User routes', () => {
  describe.skip('GET /v1/users', () => {
    beforeEach(async () => {
      const adminCopy = {};
      Object.assign(adminCopy, admin);

      const userOneCopy = {};
      Object.assign(userOneCopy, userOne);

      const userTwoCopy = {};
      Object.assign(userTwoCopy, userTwo);

      await insertUsers([userOneCopy, userTwoCopy, adminCopy]);
    });

    test('should return 200 and the users under a workspace for an admin', async () => {
      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0]).toEqual({
        id: userOne._id.toString(),
        firstName: userOne.firstName,
        lastName: userOne.lastName,
        email: userOne.email,
        role: userOne.role,
        emailVerified: userOne.emailVerified,
        timezone: '(GMT+01:00) Lagos',
        status: userOne.status,
      });
    });

    test('should return 401 if access token is missing', async () => {
      await request(app).get('/v1/users').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should correctly apply filter on firstName field', async () => {
      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ firstName: userOne.firstName })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 1,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(userOne._id.toString());
    });

    test('should correctly apply filter on role field', async () => {
      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ role: ROLES.USER })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 1,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(userOne._id.toString());
    });

    test('should correctly apply filter on role and firstName fields', async () => {
      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ role: ROLES.USER, firstName: userOne.firstName })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 1,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(userOne._id.toString());
    });

    test('should correctly sort the returned array if descending sort param is specified', async () => {
      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'role:desc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0].id).toBe(userOne._id.toString());
      expect(res.body.results[1].id).toBe(admin._id.toString());
    });

    test('should correctly sort the returned array if ascending sort param is specified', async () => {
      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'role:asc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0].id).toBe(admin._id.toString());
      expect(res.body.results[1].id).toBe(userOne._id.toString());
    });

    test('should correctly sort the returned array if multiple sorting criteria are specified', async () => {
      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'role:desc,name:asc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);

      const expectedOrder = [userOne, admin].sort((a, b) => {
        if (a.role < b.role) {
          return 1;
        }
        if (a.role > b.role) {
          return -1;
        }
        return a.name < b.name ? -1 : 1;
      });

      expectedOrder.forEach((user, index) => {
        expect(res.body.results[index].id).toBe(user._id.toString());
      });
    });

    test('should limit returned array if limit param is specified', async () => {
      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ limit: 1 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 1,
        totalPages: 2,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(userOne._id.toString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ page: 2, limit: 1 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 2,
        limit: 1,
        totalPages: 2,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(admin._id.toString());
    });
  });

  describe.skip('GET /v1/users/:userId', () => {
    beforeEach(async () => {
      const adminCopy = {};
      Object.assign(adminCopy, admin);

      const userOneCopy = {};
      Object.assign(userOneCopy, userOne);

      const userTwoCopy = {};

      await insertUsers([userOneCopy, userTwoCopy, adminCopy]);
    });
    test('should return 200 and the user object if data is ok', async () => {
      const res = await request(app)
        .get(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual({
        id: userOne._id.toString(),
        email: userOne.email,
        firstName: userOne.firstName,
        lastName: userOne.lastName,
        role: userOne.role,
        emailVerified: userOne.emailVerified,
        timezone: '(GMT+01:00) Lagos',
        status: userOne.status,
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).get(`/v1/users/${userOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user is trying to get another user within the same workspace', async () => {
      await request(app)
        .get(`/v1/users/${userTwo._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 200 and the user object if admin is trying to get another user within the same workspace', async () => {
      await request(app)
        .get(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);
    });

    test('should return 403 if admin is trying to get another user in a different workspace', async () => {
      await request(app)
        .get(`/v1/users/${userTwo._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 error if userId is not a valid mongo id', async () => {
      await request(app)
        .get('/v1/users/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if user is not found', async () => {
      await request(app)
        .get(`/v1/users/${userThree._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/users/:userId', () => {
    const userTwoCopy = {};
    beforeEach(async () => {
      const adminCopy = {};
      Object.assign(adminCopy, admin);

      const userOneCopy = {};
      Object.assign(userOneCopy, userOne);

      Object.assign(userTwoCopy, userTwo);

      await insertUsers([userOneCopy, userTwoCopy, adminCopy]);
    });
    test('should return 200 and successfully update user if data is ok', async () => {
      const updateBody = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      };

      const res = await request(app)
        .patch(`/v1/users/${userTwo._id}`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual({
        id: userTwo._id.toString(),
        firstName: capitalCase(updateBody.firstName),
        lastName: capitalCase(updateBody.lastName),
        email: userTwo.email,
        role: userTwo.role,
        emailVerified: userTwo.emailVerified,
        isReviewer: false,
        timezone: '(GMT+01:00) Lagos',
        status: userTwo.status,
      });

      const dbUser = await User.findById(userTwo._id);
      expect(dbUser).toBeDefined();
      expect(dbUser.password).not.toBe(updateBody.password);
      expect(dbUser).toMatchObject({
        firstName: capitalCase(updateBody.firstName),
        lastName: capitalCase(updateBody.lastName),
      });
    });

    test('should return 401 error if access token is missing', async () => {
      const updateBody = {
        firstName: faker.name.findName(),
        lastName: faker.name.lastName(),
      };

      await request(app).patch(`/v1/users/${userOne._id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if user is updating another user', async () => {
      const updateBody = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 200 and successfully update user if admin is updating another user within the same workspace', async () => {
      const updateBody = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
    });

    test('should return 403 and if admin is updating another user within another workspace', async () => {
      const updateBody = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      };

      await request(app)
        .patch(`/v1/users/${userTwo._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 404 if admin is updating another user that is not found', async () => {
      const updateBody = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      };

      await request(app)
        .patch(`/v1/users/${userThree._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if userId is not a valid mongo id', async () => {
      const updateBody = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      };

      await request(app)
        .patch(`/v1/users/invalidId`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 200 if phone number is valid', async () => {
      const updateBody = {
        phoneNumber: '08023454958',
      };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
    });

    test('should return 400 error if phone number is not valid', async () => {
      const updateBody = {
        phoneNumber: 'wrongNumber',
      };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if password is part of the update body', async () => {
      const updateBody = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        password: 'Password1@',
      };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if the excluded fields are part of the update body and it is done by a non-admin', async () => {
      let updateBody = { email: userTwo.email };

      await request(app)
        .patch(`/v1/users/${userTwo._id}`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);

      updateBody = { reviewer: userTwo._id.toString() };

      await request(app)
        .patch(`/v1/users/${userTwo._id}`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);

      updateBody = { reporting: { schedule: 'bi-weekly', weekDay: 'monday' } };

      await request(app)
        .patch(`/v1/users/${userTwo._id}`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 200 if the excluded fields are part of the update body and it is done by an admin', async () => {
      let updateBody = { email: userOne.email };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      updateBody = { reviewer: userOne._id.toString() };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      updateBody = { reporting: { schedule: 'bi-weekly', weekDay: 'monday' } };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
    });
  });

  describe.skip('POST /v1/users/:userId/upload-avatar', () => {
    const userTwoCopy = {};
    beforeEach(async () => {
      const adminCopy = {};
      Object.assign(adminCopy, admin);

      const userOneCopy = {};
      Object.assign(userOneCopy, userOne);

      Object.assign(userTwoCopy, userTwo);

      await insertUsers([userOneCopy, userTwoCopy, adminCopy]);
    });

    test('should return 200 if avatar is updated', async () => {
      const updateBody = {
        avatar:
          'data:image/jpeg;base64,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',
      };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
    });
  });
});
