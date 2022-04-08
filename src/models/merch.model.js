const mongoose = require('mongoose');
const { toJSON, paginate, auditableFields } = require('./plugins');
const { CURRENCIES } = require('../config/constants');

const merchSchema = mongoose.Schema(
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
    quantity: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    price: {
      currency: {
        type: String,
        enum: Object.values(CURRENCIES),
        default: CURRENCIES.NAIRA,
      },
      amount: {
        type: Number,
        required: true,
      },
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    discount: {
      type: Number,
    },
    published: {
      type: Boolean,
      default: false,
    },
    category: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Category',
    },
    creatorPage: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'CreatorPage',
      required: true,
    },
    ...auditableFields,
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
merchSchema.plugin(toJSON);
merchSchema.plugin(paginate);

// Add Index to support item search
merchSchema.index({ name: 'text' });

/**
 * @typedef Merch
 */
const Merch = mongoose.model('Merch', merchSchema);

module.exports = Merch;
