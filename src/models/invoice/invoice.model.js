const { Schema, model } = require('mongoose');
const { CURRENCIES, INVOICE_STATUSES } = require('../../config/constants');
const { toJSON, auditableFields, paginate } = require('../plugins');

const invoiceSchema = new Schema(
  {
    invoiceCode: String,
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    items: [
      {
        itemDetails: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
      },
    ],
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    totalAmount: Number,
    currency: {
      type: String,
      required: true,
      default: CURRENCIES.NAIRA,
    },
    status: {
      type: String,
      enum: Object.values(INVOICE_STATUSES),
      default: INVOICE_STATUSES.UNPAID,
    },
    invoiceNote: {
      type: String,
    },
    dueDate: Date,
    paymentLink: String,
    datePaid: Date,
    amountPaid: { type: Number, default: 0 },
    reminder: {
      beforeDueDate: Date,
      onDueDate: Date,
      afterDueDate: Date,
    },
    ...auditableFields,
  },
  {
    timestamps: true,
  }
);
invoiceSchema.plugin(toJSON);
invoiceSchema.plugin(paginate);

const Invoice = model('Invoice', invoiceSchema);
module.exports = Invoice;
