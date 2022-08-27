/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const errorTrackerSchema = mongoose.Schema(
  {
    data: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
errorTrackerSchema.plugin(toJSON);
errorTrackerSchema.plugin(paginate);

/**
 * @typedef ErrorTracker
 */
const ErrorTracker = mongoose.model('ErrorTracker', errorTrackerSchema);

module.exports = ErrorTracker;
