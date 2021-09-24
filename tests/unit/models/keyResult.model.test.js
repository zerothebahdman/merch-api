const { KeyResult } = require('../../../src/models');

describe('KeyResult model', () => {
  describe('KeyResult validation', () => {
    let newKeyResult;
    beforeEach(() => {
      newKeyResult = {
        name: 'Number of developers',
        measurement: {
          unit: 'binary',
        },
        startValue: 5,
        targetValue: 100,
        goal: '5fb5061576b5ac003c6c2ff1',
        assignee: '5fb5061576b5ac003c6c2ff2',
        workspace: '5fb5061576b5ac003c6c2ff8',
      };
    });
    test('should correctly validate a valid name', async () => {
      await expect(new KeyResult(newKeyResult).validate()).resolves.toBeUndefined();
    });
    test('should throw a validation error if name is invalid', async () => {
      newKeyResult.name = [5];
      await expect(new KeyResult(newKeyResult).validate()).rejects.toThrow();
    });
    test('should throw a validation error if measurement unit is invalid', async () => {
      newKeyResult.measurement.unit = 5;
      await expect(new KeyResult(newKeyResult).validate()).rejects.toThrow();
    });
    test('should throw a validation error if start value is invalid', async () => {
      newKeyResult.startValue = 'five';
      await expect(new KeyResult(newKeyResult).validate()).rejects.toThrow();
    });
    test('should throw a validation error if target value is invalid', async () => {
      newKeyResult.targetValue = 'hundred';
      await expect(new KeyResult(newKeyResult).validate()).rejects.toThrow();
    });
  });
});
