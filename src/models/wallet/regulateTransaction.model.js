/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const regulateTransactionSchema = mongoose.Schema(
  {
    idempotentKey: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
regulateTransactionSchema.plugin(toJSON);
regulateTransactionSchema.plugin(paginate);

/**
 * @typedef RegulateTransaction
 */
const RegulateTransaction = mongoose.model('RegulateTransaction', regulateTransactionSchema);

module.exports = RegulateTransaction;
