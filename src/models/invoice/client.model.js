const { Schema, model } = require('mongoose');
const { toJSON, auditableFields } = require('../plugins');

const clientSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ...auditableFields,
  },
  {
    timestamps: true,
  }
);
clientSchema.plugin(toJSON);
const Client = model('Client', clientSchema);
module.exports = Client;
