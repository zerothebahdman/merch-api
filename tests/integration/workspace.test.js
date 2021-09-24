const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { titleCase } = require('../../src/utils/helpers');
const { User, Workspace } = require('../../src/models');
const { userOne, admin, adminTwo, insertUsers } = require('../fixtures/user.fixture');
const { workspaceOne, workspaceTwo, workspaceThree, insertWorkspaces } = require('../fixtures/workspace.fixture');
const { userOneAccessToken, adminAccessToken } = require('../fixtures/token.fixture');

setupTestDB();

describe('Workspace routes', () => {
  describe('POST /v1/workspaces', () => {
    let newWorkspace;

    beforeEach(() => {
      newWorkspace = {
        name: faker.lorem.word(5),
      };
    });

    test('should return 201 and successfully create new workspace if data is ok', async () => {
      await insertUsers([admin]);

      const res = await request(app)
        .post('/v1/workspaces')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newWorkspace)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.anything(),
        name: titleCase(newWorkspace.name),
        timezone: '(GMT+01:00) Lagos',
        createdBy: admin._id.toString(),
      });

      const dbWorkspace = await Workspace.findById(res.body.id);
      expect(dbWorkspace).toBeDefined();
      expect(dbWorkspace).toMatchObject({ name: titleCase(newWorkspace.name) });

      const dbUser = await User.findById(admin._id);
      expect(dbUser).toBeDefined();
      expect(dbUser.workspace.toJSON()).toEqual(res.body.id);
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/workspaces').send(newWorkspace).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if logged in user is not admin', async () => {
      await insertUsers([userOne]);

      await request(app)
        .post('/v1/workspaces')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newWorkspace)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 error if name is invalid', async () => {
      await insertUsers([admin]);
      newWorkspace.name = '1ba';

      await request(app)
        .post('/v1/workspaces')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newWorkspace)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if name is already used', async () => {
      await insertUsers([admin]);
      await insertWorkspaces([workspaceOne]);
      newWorkspace.name = workspaceOne.name;

      await request(app)
        .post('/v1/workspaces')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newWorkspace)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if admin is attempting to create another workspace when he has already being assigned to one', async () => {
      const workSpaceOneCopy = {};
      Object.assign(workSpaceOneCopy, workspaceOne);
      workSpaceOneCopy.createdBy = admin._id;
      await insertWorkspaces([workSpaceOneCopy]);

      const adminCopy = {};
      Object.assign(adminCopy, admin);
      adminCopy.workspace = workspaceOne._id;

      await insertUsers([adminCopy]);

      await request(app)
        .post('/v1/workspaces')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newWorkspace)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if name length is less than 2 characters', async () => {
      await insertUsers([admin]);
      newWorkspace.name = 'n';

      await request(app)
        .post('/v1/workspaces')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newWorkspace)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if name starts with special character or number', async () => {
      await insertUsers([admin]);
      newWorkspace.name = '@na';

      await request(app)
        .post('/v1/workspaces')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newWorkspace)
        .expect(httpStatus.BAD_REQUEST);

      newWorkspace.name = '1na';

      await request(app)
        .post('/v1/workspaces')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newWorkspace)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/workspaces/:workspaceId', () => {
    const adminCopy = {};

    beforeEach(async () => {
      const workSpaceOneCopy = {};
      Object.assign(workSpaceOneCopy, workspaceOne);
      workSpaceOneCopy.createdBy = admin._id;
      await insertWorkspaces([workSpaceOneCopy]);

      Object.assign(adminCopy, admin);
      adminCopy.workspace = workspaceOne._id;

      const userOneCopy = {};
      Object.assign(userOneCopy, userOne);
      userOneCopy.workspace = workspaceOne._id;

      await insertUsers([userOneCopy, adminCopy]);
    });
    test('should return 200 and the workspace object if data is ok', async () => {
      // A user should be able to fetch the details of a workspace
      let res = await request(app)
        .get(`/v1/workspaces/${workspaceOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: workspaceOne._id.toString(),
        name: titleCase(workspaceOne.name),
        timezone: '(GMT+01:00) Lagos',
        createdBy: admin._id.toString(),
      });

      // An admin should be able to fetch the details of a workspace
      res = await request(app)
        .get(`/v1/workspaces/${workspaceOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: workspaceOne._id.toString(),
        name: titleCase(workspaceOne.name),
        timezone: '(GMT+01:00) Lagos',
        createdBy: admin._id.toString(),
      });
    });

    test('should return 200, the workspace object and other relationship when you set the include query param if data is ok', async () => {
      // A user should be able to fetch the details of a workspace
      const createdBy = {
        id: adminCopy._id.toString(),
        firstName: adminCopy.firstName,
        lastName: adminCopy.lastName,
        email: adminCopy.email,
        emailVerified: adminCopy.emailVerified,
        isReviewer: false,
        role: adminCopy.role,
        status: adminCopy.status,
        timezone: '(GMT+01:00) Lagos',
        workspace: adminCopy.workspace._id.toString(),
        reporting: {
          schedule: 'weekly',
          weekDay: 'friday',
        },
      };
      let res = await request(app)
        .get(`/v1/workspaces/${workspaceOne._id}?include=[createdBy]`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);
      expect(res.body).toEqual({
        id: workspaceOne._id.toString(),
        timezone: '(GMT+01:00) Lagos',
        name: titleCase(workspaceOne.name),
        createdBy,
      });

      // An admin should be able to fetch the details of a workspace
      res = await request(app)
        .get(`/v1/workspaces/${workspaceOne._id}?include=[createdBy]`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);
      expect(res.body).toEqual({
        id: workspaceOne._id.toString(),
        name: titleCase(workspaceOne.name),
        timezone: '(GMT+01:00) Lagos',
        createdBy,
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).get(`/v1/workspaces/${workspaceOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if workspaceId is not a valid mongo id', async () => {
      await request(app)
        .get('/v1/workspaces/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if workspace is not found', async () => {
      await request(app)
        .get(`/v1/workspaces/${workspaceTwo._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 403 error when user or admin is trying to fetch another workspace information', async () => {
      // TODO: Furnish this use-case
    });
  });

  describe('PATCH /v1/workspaces/:workspaceId', () => {
    const adminCopy = {};

    beforeEach(async () => {
      const workSpaceOneCopy = {};
      Object.assign(workSpaceOneCopy, workspaceOne);
      workSpaceOneCopy.createdBy = admin._id;

      const workSpaceTwoCopy = {};
      Object.assign(workSpaceTwoCopy, workspaceTwo);
      workSpaceTwoCopy.createdBy = adminTwo._id;
      await insertWorkspaces([workSpaceOneCopy, workSpaceTwoCopy]);

      Object.assign(adminCopy, admin);
      adminCopy.workspace = workspaceOne._id;

      const userOneCopy = {};
      Object.assign(userOneCopy, userOne);
      userOneCopy.workspace = workspaceOne._id;

      await insertUsers([userOneCopy, adminCopy]);
    });

    test('should return 200 and successfully update workspace if data is ok', async () => {
      const updateBody = {
        name: faker.lorem.word(6),
      };

      const res = await request(app)
        .patch(`/v1/workspaces/${workspaceOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: workspaceOne._id.toString(),
        name: titleCase(updateBody.name),
        timezone: '(GMT+01:00) Lagos',
        createdBy: admin._id.toString(),
        updatedBy: admin._id.toString(),
      });

      const dbWorkspace = await Workspace.findById(workspaceOne._id);
      expect(dbWorkspace).toBeDefined();
      expect(dbWorkspace).toMatchObject({
        name: titleCase(updateBody.name),
      });
    });

    test('should return 401 error if access token is missing', async () => {
      const updateBody = {
        name: faker.lorem.word(4),
      };

      await request(app).patch(`/v1/workspaces/${workspaceOne._id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if user is updating a workspace', async () => {
      const updateBody = {
        name: faker.lorem.word(5),
      };

      await request(app)
        .patch(`/v1/workspaces/${workspaceOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 403 error when admin is trying to update another workspace', async () => {
      const updateBody = {
        name: faker.lorem.word(6),
      };
      await request(app)
        .patch(`/v1/workspaces/${workspaceTwo._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 404 if admin is updating workspace that is not found', async () => {
      const updateBody = {
        name: faker.lorem.word(),
      };

      await request(app)
        .patch(`/v1/workspaces/${workspaceThree._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if workspaceId is not a valid mongo id', async () => {
      const updateBody = {
        name: faker.lorem.word(),
      };

      await request(app)
        .patch(`/v1/workspaces/invalidId`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if name is invalid', async () => {
      const updateBody = { name: '@na' };

      await request(app)
        .patch(`/v1/workspaces/${workspaceOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if name is already taken', async () => {
      const updateBody = { name: workspaceTwo.name };

      await request(app)
        .patch(`/v1/workspaces/${workspaceOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    // eslint-disable-next-line jest/no-disabled-tests
    test.skip('should not return 400 if name is my name', async () => {
      const updateBody = { name: workspaceOne.name };

      await request(app)
        .patch(`/v1/workspaces/${workspaceOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
    });

    test('should return 400 if name length is less than 2 characters', async () => {
      const updateBody = { name: 'n' };

      await request(app)
        .patch(`/v1/workspaces/${workspaceOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if name starts with numbers and contains special characters', async () => {
      const updateBody = { name: '1na' };

      await request(app)
        .patch(`/v1/workspaces/${workspaceOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);

      updateBody.name = 'na@';

      await request(app)
        .patch(`/v1/workspaces/${workspaceOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /v1/workspaces/invite-teams', () => {
    let newTeamMembers;

    beforeEach(() => {
      newTeamMembers = {
        emails: [faker.internet.email().toLowerCase()],
      };
    });

    // eslint-disable-next-line jest/no-disabled-tests
    test.skip('should return 204 and successfully invite team members to workspace if data is ok', async () => {
      const adminCopy = {};
      Object.assign(adminCopy, admin);
      adminCopy.workspace = admin._id;
      await insertUsers([adminCopy]);
      const workSpaceOneCopy = {};
      Object.assign(workSpaceOneCopy, workspaceOne);
      workSpaceOneCopy.createdBy = admin._id;
      await insertWorkspaces([workSpaceOneCopy]);

      await request(app)
        .post('/v1/workspaces/invite-team')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newTeamMembers)
        .expect(httpStatus.NO_CONTENT);
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/workspaces/invite-team').send(newTeamMembers).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if logged in user is not admin', async () => {
      await insertUsers([userOne]);

      await request(app)
        .post('/v1/workspaces/invite-team')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newTeamMembers)
        .expect(httpStatus.FORBIDDEN);
    });
  });

  describe('POST /v1/workspaces/complete-setup', () => {
    // eslint-disable-next-line jest/no-disabled-tests
    test.skip('should return 204 and successfully send welcome email to admin', async () => {
      const adminCopy = {};
      Object.assign(adminCopy, admin);
      adminCopy.workspace = admin._id;
      await insertUsers([adminCopy]);
      const workSpaceOneCopy = {};
      Object.assign(workSpaceOneCopy, workspaceOne);
      workSpaceOneCopy.createdBy = admin._id;
      await insertWorkspaces([workSpaceOneCopy]);

      await request(app)
        .post('/v1/workspaces/complete-setup')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/workspaces/complete-setup').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if logged in user is not admin', async () => {
      await insertUsers([userOne]);

      await request(app)
        .post('/v1/workspaces/complete-setup')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });
  });
});
