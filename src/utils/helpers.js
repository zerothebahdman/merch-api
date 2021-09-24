const { ERROR_MESSAGES } = require('../config/messages');

const titleCase = function (string) {
  const sentence = string.toLowerCase().split(' ');
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < sentence.length; i++) {
    sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1);
  }
  return sentence.join(' ');
};

const capitalCase = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

const nameValidator = function (string) {
  /**
            Ensure it only starts with alphabets, can have numbers and does not contain special characters.
        */
  const strongRegex = new RegExp('^[a-zA-Z][a-zA-Z0-9 ]*$');

  if (!strongRegex.test(string)) {
    throw new Error(ERROR_MESSAGES.INVALID_NAME);
  }
};

/**
 * Generate random characters with specified length
 * @param {Int16Array} length
 * @param {string} type e.g "num" - Numbers only, "alpha" - letters only (upper & lower), "upper" - Uppercase letters only, "lower" - Lowercase letters only, "upper-num" - A mix of uppercase letters & number, "lower-num" - A mix of lowecase letters and numbers, "alpha-num" - A mix of letters and numbers
 * @returns {string} e.g 'som3RandomStr1ng';
 */
const generateRandomChar = (length = 32, type = 'alpha-num') => {
  // "num", "upper", "lower", "upper-num", "lower-num", "alpha-num"
  let result = '';
  let characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  if (type === 'num') characters = '0123456789';
  if (type === 'upper-num') characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ0123456789';
  if (type === 'lower-num') characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  if (type === 'upper') characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (type === 'lower') characters = 'abcdefghijklmnopqrstuvwxyz';
  if (type === 'alpha') characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  const charactersLength = characters.length;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

/**
 * Generate slug from string
 * @param {string} type e.g 'Nice Place To Be'
 * @returns {string} e.g 'nice-place-to-be';
 */
const slugify = (str) => {
  return str.toLowerCase().replace(/ /g, '-');
};

module.exports = {
  titleCase,
  capitalCase,
  nameValidator,
  generateRandomChar,
  slugify,
};
