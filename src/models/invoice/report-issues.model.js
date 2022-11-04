const { Schema, model } = require('mongoose');
const { toJSON, auditableFields } = require('../plugins');

const reportIssueSchema = new Schema(
  {
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    invoice: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true,
    },
    reasonForReport: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },

    ...auditableFields,
  },
  {
    timestamps: true,
  }
);

reportIssueSchema.plugin(toJSON);
const ReportIssue = model('ReportIssue', reportIssueSchema);
module.exports = ReportIssue;
