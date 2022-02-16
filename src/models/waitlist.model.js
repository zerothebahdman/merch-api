/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON, paginate } = require('./plugins');
const { ERROR_MESSAGES } = require('../config/messages');
const { capitalCase } = require('../utils/helpers');

const waitlistSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: false,
      trim: true,
      validate(value) {
        this.firstName = capitalCase(value);
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error(ERROR_MESSAGES.INVALID_EMAIL);
        }
      },
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
waitlistSchema.plugin(toJSON);
waitlistSchema.plugin(paginate);

/**
 * @typedef Waitlist
 */
const Waitlist = mongoose.model('Waitlist', waitlistSchema);

module.exports = Waitlist;
