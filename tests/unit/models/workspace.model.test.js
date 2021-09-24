const faker = require('faker');
const { Workspace } = require('../../../src/models');

describe('Workspace model', () => {
  describe('Workspace validation', () => {
    let newWorkspace;
    beforeEach(() => {
      newWorkspace = {
        name: faker.lorem.word(5),
      };
    });

    test('should correctly validate a valid workspace', async () => {
      await expect(new Workspace(newWorkspace).validate()).resolves.toBeUndefined();
    });

    test('should correctly validate if name contains a number', async () => {
      newWorkspace.name = 'na1';
      await expect(new Workspace(newWorkspace).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if name length is less than 2 characters', async () => {
      newWorkspace.name = 'n';
      await expect(new Workspace(newWorkspace).validate()).rejects.toThrow();
    });

    test('should throw a validation error if name starts with a number', async () => {
      newWorkspace.name = '1na';
      await expect(new Workspace(newWorkspace).validate()).rejects.toThrow();
    });

    test('should throw a validation error if name contains a special character', async () => {
      newWorkspace.name = '@na';
      await expect(new Workspace(newWorkspace).validate()).rejects.toThrow();
    });
  });
});
