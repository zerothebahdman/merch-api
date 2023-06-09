/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');
const { toJSON, paginate, auditableFields } = require('../plugins');

const accountSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      ref: 'User',
      unique: true,
    },
    accountInfo: {
      accountNumber: {
        type: String,
      },
      accountName: {
        type: String,
      },
      bankName: {
        type: String,
      },
      referenceNumber: {
        type: String,
      },
      accountReference: {
        type: String,
      },
      callbackUrl: {
        type: String,
      },
    },
    balance: {
      naira: {
        type: Number,
        default: 0,
        min: 0,
      },
      dollar: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    debt: {
      naira: {
        type: Number,
        default: 0,
        min: 0,
      },
      dollar: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    stash: {
      naira: {
        type: Number,
        default: 0,
        min: 0,
      },
      dollar: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    ...auditableFields,
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
accountSchema.plugin(toJSON);
accountSchema.plugin(paginate);

/**
 * @typedef Account
 */
const Account = mongoose.model('Account', accountSchema);

module.exports = Account;
