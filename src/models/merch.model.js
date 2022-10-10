const mongoose = require('mongoose');
const { toJSON, paginate, auditableFields } = require('./plugins');
const { CURRENCIES, MERCH_PRODUCTION_DURATION } = require('../config/constants');

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
    metadata: {
      colors: {
        type: Array,
      },
      sizes: {
        type: Array,
      },
    },
    discount: {
      type: Number,
    },
    published: {
      type: Boolean,
      default: true,
    },
    paymentLink: {
      type: String,
    },
    creatorPage: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'CreatorPage',
      required: true,
    },
    preOrder: {
      enabled: { type: Boolean, default: false },
      maxNumOfPreOrders: { type: Number, default: 0 },
      productionDuration: { type: String, enum: Object.values(MERCH_PRODUCTION_DURATION) },
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
