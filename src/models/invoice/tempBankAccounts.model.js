const { Schema, model } = require('mongoose');
const { PAYMENT_TYPES } = require('../../config/constants');
const { toJSON, paginate, auditableFields } = require('../plugins');

const tempBankAccountSchema = Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    unique: true,
  },
  paymentType: { type: String, enum: Object.values(PAYMENT_TYPES) },
  accountNumber: Number,
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  paymentItem: {
    invoice: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
    paymentLink: {
      type: Schema.Types.ObjectId,
      ref: 'PaymentLink',
    },
  },
  amount: {
    expected: Number,
    received: Number,
    balance: Number,
  },
  status: { type: String, enum: ['paid', 'pending', 'partly-paid'] },
  ...auditableFields,
});

tempBankAccountSchema.plugin(toJSON);
tempBankAccountSchema.plugin(paginate);

const TempBankAccount = model('TempBankAccount', tempBankAccountSchema);
module.exports = TempBankAccount;
