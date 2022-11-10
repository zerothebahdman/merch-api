const moment = require('moment');
const config = require('../config/config');
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

const storeNameValidator = function (string) {
  /**
            Ensure it only starts with alphabets, can have numbers and can only contain '-', '_' special characters.
        */
  const strongRegex = new RegExp(/^[ A-Za-z0-9_-]*$/);

  if (!strongRegex.test(string)) {
    throw new Error('Invalid character in name. Only hiphen (-) and underscore (_) are allowed');
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

const calculatePeriod = (interval) => {
  let periodDate;
  // eslint-disable-next-line default-case
  switch (interval) {
    case 'weekly':
      periodDate = moment().add(1, 'week').startOf('day').toDate();
      break;
    case 'monthly':
      periodDate = moment().add(1, 'month').startOf('day').toDate();
      break;
    case 'yearly':
      periodDate = moment().add(1, 'year').startOf('day').toDate();
      break;
    case 'bi-weekly':
      periodDate = moment().add(2, 'week').startOf('day').toDate();
      break;
    case 'bi-monthly':
      periodDate = moment().add(2, 'month').startOf('day').toDate();
      break;
    case 'bi-annual':
      periodDate = moment().add(6, 'month').startOf('day').toDate();
      break;
    case 'quarterly':
      periodDate = moment().add(3, 'month').startOf('day').toDate();
      break;
  }
  return periodDate;
};

const calculateProfit = (amount, type) => {
  let profitAmount;
  switch (type) {
    case 'DStv':
      profitAmount = (Number(config.paymentProcessing.dstvProcessingCharge) / 100) * amount;
      break;
    case 'GOtv':
      profitAmount = (Number(config.paymentProcessing.gotvProcessingCharge) / 100) * amount;
      break;
    case 'StarTimes':
      profitAmount = (Number(config.paymentProcessing.startimesProcessingCharge) / 100) * amount;
      break;
    case 'AEDC':
      profitAmount = (Number(config.paymentProcessing.aedcProcessingCharge) / 100) * amount;
      break;
    case 'Ikeja Electric':
      profitAmount = (Number(config.paymentProcessing.ikejaElectricProcessingCharge) / 100) * amount;
      break;
    case 'PHED':
      profitAmount = (Number(config.paymentProcessing.phedProcessingCharge) / 100) * amount;
      break;
    case 'Ibadan Electricity Distribution Company':
      profitAmount = (Number(config.paymentProcessing.iedcProcessingCharge) / 100) * amount;
      break;
    case 'KEDCO':
      profitAmount = (Number(config.paymentProcessing.kedcoProcessingCharge) / 100) * amount;
      break;
    case 'Jos Electricity Distribution (JED)':
      profitAmount = (Number(config.paymentProcessing.jedElectricProcessingCharge) / 100) * amount;
      break;
    case 'Kaduna Electric':
      profitAmount = (Number(config.paymentProcessing.kadunaElectricProcessingCharge) / 100) * amount;
      break;
    case 'Eko Electricity (EKEDC)':
      profitAmount = (Number(config.paymentProcessing.ekedcProcessingCharge) / 100) * amount;
      break;
    default:
      profitAmount = 0;
      break;
  }
  return profitAmount;
};

module.exports = {
  titleCase,
  capitalCase,
  nameValidator,
  storeNameValidator,
  generateRandomChar,
  slugify,
  calculatePeriod,
  calculateProfit,
};
