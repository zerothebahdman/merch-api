/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const reportSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      required: false,
      ref: 'User',
    },
    transaction: {
      type: mongoose.SchemaTypes.ObjectId,
      required: false,
      ref: 'Transaction',
    },
    reason: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      default: null,
    },
    info: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      default: 'active',
      enum: ['active', 'resolved'],
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
reportSchema.plugin(toJSON);
reportSchema.plugin(paginate);

/**
 * @typedef Report
 */
const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
