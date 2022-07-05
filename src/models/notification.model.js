/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const notificationSchema = mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },
    target: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
notificationSchema.plugin(toJSON);
notificationSchema.plugin(paginate);

/**
 * @typedef Notification
 */
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
