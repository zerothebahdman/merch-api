const mongoose = require('mongoose');
const { toJSON, paginate, auditableFields } = require('./plugins');

const storeSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 4,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    avatar: {
      type: String,
      required: false,
    },
    coverImage: {
      type: String,
      required: false,
    },
    metadata: {
      description: {
        type: String,
        required: false,
        trim: true,
      },
      intro: {
        type: String,
        required: false,
        trim: true,
      },
    },
    ...auditableFields,
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
storeSchema.plugin(toJSON);
storeSchema.plugin(paginate);

// Add Index to support Store search
storeSchema.index({ name: 'text' });

/**
 * @typedef Store
 */
const Store = mongoose.model('Store', storeSchema);

module.exports = Store;
