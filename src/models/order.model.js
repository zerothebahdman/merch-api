const mongoose = require('mongoose');
const { toJSON, paginate, auditableFields } = require('./plugins');
const { CURRENCIES, ORDER_STATUSES } = require('../config/constants');

const orderSchema = mongoose.Schema(
  {
    merches: [
      {
        merchId: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: 'Merch',
        },
        quantity: {
          type: Number,
        },
        amount: {
          unitPrice: {
            type: Number,
            required: true,
          },
          currency: {
            type: String,
            enum: Object.values(CURRENCIES),
            default: CURRENCIES.NAIRA,
          },
        },
      },
    ],
    totalAmount: {
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
    discount: {
      type: Number,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    creatorPage: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    orderCode: {
      type: String,
    },
    paymentUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUSES),
      default: ORDER_STATUSES.IN_PROGRESS,
    },
    ...auditableFields,
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
orderSchema.plugin(toJSON);
orderSchema.plugin(paginate);

/**
 * @typedef Order
 */
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
