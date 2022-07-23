/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');
const { TRANSACTION_TYPES, TRANSACTION_SOURCES } = require('../config/constants');
const { toJSON, paginate, auditableFields } = require('./plugins');

const transactionLogSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      ref: 'User',
    },
    transactionDump: {
      type: mongoose.SchemaTypes.ObjectId,
      required: false,
      ref: 'TransactionDump',
    },
    type: {
      type: String,
      enums: Object.values(TRANSACTION_TYPES),
    },
    amount: {
      type: Number,
    },
    source: {
      type: String,
      enum: Object.values(TRANSACTION_SOURCES),
    },
    reference: {
      type: String,
      required: false,
    },
    purpose: {
      type: String,
      required: false,
    },
    meta: {
      type: Object,
    },
    ...auditableFields,
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
transactionLogSchema.plugin(toJSON);
transactionLogSchema.plugin(paginate);

/**
 * @typedef TransactionLog
 */
const TransactionLog = mongoose.model('TransactionLog', transactionLogSchema);

module.exports = TransactionLog;
