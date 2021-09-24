const faker = require('faker');
const { Goal } = require('../../../src/models');

describe('Goal model', () => {
  describe('Goal validation', () => {
    let newGoal;
    beforeEach(() => {
      newGoal = {
        name: 'To be a better developer',
        measurement: {
          unit: 'numeric',
        },
        startValue: 5,
        targetValue: 100,
        startDate: faker.date.past(),
        endDate: faker.date.future(),
        status: 'pending',
        assignee: '5fb5061576b5ac003c6c2ff2',
        workspace: '5fb5061576b5ac003c6c2ff8',
      };
    });
    test('should correctly validate', async () => {
      await expect(new Goal(newGoal).validate()).resolves.toBeUndefined();
    });
    test('should throw a validation error if name is invalid', async () => {
      newGoal.name = ['invalidName'];
      await expect(new Goal(newGoal).validate()).rejects.toThrow();
    });
    test('should throw a validation error if measurement unit is invalid', async () => {
      newGoal.measurement.unit = 'decimal';
      await expect(new Goal(newGoal).validate()).rejects.toThrow();
    });
    test('should throw a validation error if start value is invalid', async () => {
      newGoal.startValue = 'five';
      await expect(new Goal(newGoal).validate()).rejects.toThrow();
    });
    test('should throw a validation error if target value is invalid', async () => {
      newGoal.targetValue = 'hundred';
      await expect(new Goal(newGoal).validate()).rejects.toThrow();
    });
    test('should throw a validation error if start date is invalid', async () => {
      newGoal.startDate = 'invalidStartDate';
      await expect(new Goal(newGoal).validate()).rejects.toThrow();
    });
    test('should throw a validation error if endDate is invalid', async () => {
      newGoal.endDate = 'invalidEndDate';
      await expect(new Goal(newGoal).validate()).rejects.toThrow();
    });
    test('should throw a validation error if status is invalid', async () => {
      newGoal.status = 'invalidStatus';
      await expect(new Goal(newGoal).validate()).rejects.toThrow();
    });
  });
});
