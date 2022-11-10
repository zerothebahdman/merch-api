const { Schema, model } = require('mongoose');
const { auditableFields, paginate } = require('./plugins');

const merchroEarningsSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
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
    profit: Number,
    transaction: {
      type: Schema.Types.ObjectId,
      ref: 'TransactionLog',
    },
    amountSpent: Number,
    ...auditableFields,
  },
  { timestamps: true }
);

merchroEarningsSchema.plugin(paginate);

const MerchroEarnings = model('MerchroEarnings', merchroEarningsSchema);
module.exports = MerchroEarnings;
