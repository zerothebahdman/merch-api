const { Schema, model } = require('mongoose');
const { PAYMENT_LINK_TYPES } = require('../../config/constants');
const { toJSON, auditableFields, paginate } = require('../plugins');

const paymentLinkSchema = new Schema(
  {
    paymentType: { type: String, enum: Object.values(PAYMENT_LINK_TYPES) },
    paymentCode: { type: String, required: true },
    pageName: { type: String, required: true },
    pageDescription: { type: String, required: true },
    pageImage: { type: String, required: false },
    pageRedirectUrl: { type: String, required: true },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
    },
    recurringPayment: {
      type: { type: Boolean, default: false },
      interval: String,
      frequency: Number,
    },
    absorbFees: { type: Boolean, default: true },
    eventPayment: {
      type: { type: Boolean, default: false },
      location: String,
      date: {
        from: Date,
        to: Date,
      },
      tickets: [
        {
          ticketType: String,
          ticketPrice: Number,
          ticketQuantity: Number,
        },
      ],
    },
    ...auditableFields,
  },
  {
    timestamps: true,
  }
);

paymentLinkSchema.plugin(toJSON);
paymentLinkSchema.plugin(paginate);

const PaymentLink = model('PaymentLink', paymentLinkSchema);
module.exports = PaymentLink;
