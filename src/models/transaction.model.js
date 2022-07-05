/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');
const { TRANSACTION_TYPES, TRANSACTION_SOURCES } = require('../config/constants');
const { toJSON, paginate, auditableFields } = require('./plugins');

const transactionSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      ref: 'User',
      unique: true,
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
    meta: {
      type: String,
    },
    ...auditableFields,
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
transactionSchema.plugin(toJSON);
transactionSchema.plugin(paginate);

/**
 * @typedef Transaction
 */
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
