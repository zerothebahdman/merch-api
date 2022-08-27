/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const controlTransactionSchema = mongoose.Schema(
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
controlTransactionSchema.plugin(toJSON);
controlTransactionSchema.plugin(paginate);

/**
 * @typedef ControlTransaction
 */
const ControlTransaction = mongoose.model('ControlTransaction', controlTransactionSchema);

module.exports = ControlTransaction;
