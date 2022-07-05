/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const bankSchema = mongoose.Schema({
  name: {
    type: String,
  },
  uuid: {
    type: String,
  },
  interInstitutionCode: {
    type: String,
  },
  sortCode: {
    type: String,
  },
});

// add plugin that converts mongoose to json
bankSchema.plugin(toJSON);
bankSchema.plugin(paginate);

/**
 * @typedef Bank
 */
const Bank = mongoose.model('Bank', bankSchema);

module.exports = Bank;
