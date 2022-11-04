const { Schema, model } = require('mongoose');
const { PAYMENT_LINK_TYPES } = require('../../config/constants');
const { toJSON } = require('../plugins');

const paymentLinkClientSchema = new Schema({
  paymentType: { type: String, enum: Object.values(PAYMENT_LINK_TYPES) },
  clientFirstName: { type: String, required: true },
  clientLastName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  clientPhoneNumber: { type: String, required: true },
  creatorPaymentLink: {
    type: Schema.Types.ObjectId,
    ref: 'PaymentLink',
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  card: {
    token: { type: String },
    last_4digits: { type: String },
    first_6digits: { type: String },
    expiry: { type: String },
    type: { type: String },
    issuer: { type: String },
    country: { type: String },
  },
  eventMetaDetails: [Object],
});

paymentLinkClientSchema.plugin(toJSON);
const PaymentLinkClient = model('PaymentLinkClient', paymentLinkClientSchema);
module.exports = PaymentLinkClient;
