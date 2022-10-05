/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const chargeSchema = mongoose.Schema({
  uuid: {
    type: String,
  },
  order: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Order',
    required: true,
  },
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  charge: {
    type: Number,
    required: true,
  },
  source: {
    type: String,
    default: 'card',
  },
});

// add plugin that converts mongoose to json
chargeSchema.plugin(toJSON);
chargeSchema.plugin(paginate);

/**
 * @typedef Charge
 */
const Charge = mongoose.model('Charge', chargeSchema);

module.exports = Charge;
