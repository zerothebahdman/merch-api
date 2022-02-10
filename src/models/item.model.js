const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { CURRENCIES } = require('../config/constants');

const itemSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 5,
      trim: true,
    },
    images: {
      type: Array,
      required: false,
    },
    avatar: {
      type: String,
      required: false,
    },
    baseAmount: {
      currency: {
        type: String,
        enum: Object.values(CURRENCIES),
        default: CURRENCIES.NAIRA,
      },
      price: {
        type: Number,
        required: true,
      },
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    color: {
      type: String,
      default: 'white',
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
itemSchema.plugin(toJSON);
itemSchema.plugin(paginate);

// Add Index to support item search
itemSchema.index({ name: 'text' });

/**
 * @typedef Item
 */
const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
