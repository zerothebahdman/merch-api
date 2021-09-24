const { ERROR_MESSAGES } = require('../config/messages');

const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid mongo id');
  }
  return value;
};

const password = (value, helpers) => {
  /**
   *  At least 8 characters—the more characters, the better
      A mixture of both uppercase and lowercase - letters
      A mixture of letters and numbers
      Inclusion of at least one special character, e.g., ! @ # ? ]
   */
  const strongRegex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})');

  if (!strongRegex.test(value)) {
    return helpers.message(ERROR_MESSAGES.INVALID_PASSWORD);
  }
  return value;
};

module.exports = {
  objectId,
  password,
};
