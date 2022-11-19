/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const transactionDumpSchema = mongoose.Schema(
  {
    data: {
      type: Object,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      required: false,
      default: null,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
transactionDumpSchema.plugin(toJSON);
transactionDumpSchema.plugin(paginate);

/**
 * @typedef TransactionDump
 */
const TransactionDump = mongoose.model('TransactionDump', transactionDumpSchema);

module.exports = TransactionDump;
