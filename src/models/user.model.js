/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { ROLES } = require('../config/roles');
const { USER_STATUSES } = require('../config/constants');
const { ERROR_MESSAGES } = require('../config/messages');
const { TIMEZONES } = require('../config/timezones');
const { capitalCase } = require('../utils/helpers');

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: false,
      trim: true,
      validate(value) {
        this.firstName = capitalCase(value);
      },
    },
    lastName: {
      type: String,
      required: false,
      trim: true,
      validate(value) {
        this.lastName = capitalCase(value);
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
    emailVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUSES),
      default: USER_STATUSES.CONFIRMED,
    },
    password: {
      type: String,
      required: false,
      trim: true,
      minlength: 8,
      validate(value) {
        /**
            A mixture of both uppercase and lowercase - letters
            A mixture of letters and numbers
            Inclusion of at least one special character, e.g., ! @ # ? ]
        */
        const strongRegex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])');

        if (!strongRegex.test(value)) {
          throw new Error(ERROR_MESSAGES.USER_INVALID_PASSWORD);
        }
      },
      private: true, // used by the toJSON plugin
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },
    store: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Hub',
      required: false,
    },
    industry: {
      type: String,
      required: false,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: false,
      trim: true,
      validate(value) {
        const strongRegex = new RegExp('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\\s\\./0-9]*$');

        if (!strongRegex.test(value)) {
          throw new Error(ERROR_MESSAGES.INVALID_PHONE_NUMBER);
        }
      },
    },
    googleId: {
      type: String,
      required: false,
      trim: true,
    },
    timezone: {
      type: String,
      trim: true,
      required: false,
      enum: Object.values(TIMEZONES),
      default: '(GMT+01:00) Lagos',
    },
    avatar: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
