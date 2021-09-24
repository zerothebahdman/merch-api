const { Onboarding } = require('../../../src/models');

describe('Onboarding model', () => {
  describe('Onboarding validation', () => {
    let newOnboarding;
    beforeEach(() => {
      newOnboarding = {
        user: '5fb5061576b5ac003c6c2ff1',
        stages: ['admin_SignedUp', 'admin_CreatedWorkSpace', 'user_SignedUp'],
      };
    });
    test('should correctly validate a valid dataset', async () => {
      await expect(new Onboarding(newOnboarding).validate()).resolves.toBeUndefined();
    });
    test('should throw a validation error if stages is invalid', async () => {
      newOnboarding.stages = ['admin_SignedUp', 9];
      await expect(new Onboarding(newOnboarding).validate()).rejects.toThrow();
    });
    test('should throw a validation error if user is an invalid mongo id', async () => {
      newOnboarding.user = 'invalidId';
      await expect(new Onboarding(newOnboarding).validate()).rejects.toThrow();
    });
  });
});
