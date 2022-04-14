const mongoose = require('mongoose');
const { CURRENCIES } = require('../config/constants');
const { toJSON, paginate, auditableFields } = require('./plugins');

const creatorPageSchema = mongoose.Schema(
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
    storeInfo: {
      name: {
        type: String,
      },
      description: {
        type: String,
      },
      banner: {
        type: String,
      },
      country: {
        type: String,
      },
      currency: {
        type: String,
        enum: Object.values(CURRENCIES),
        default: CURRENCIES.NAIRA,
      },
      address: {
        type: String,
      },
      phone: {
        type: String,
      },
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
      socialLinks: [
        {
          platform: {
            type: String,
          },
          url: {
            type: String,
          },
        },
      ],
    },
    ...auditableFields,
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
creatorPageSchema.plugin(toJSON);
creatorPageSchema.plugin(paginate);

// Add Index to support creator page search
creatorPageSchema.index({ name: 'text' });

/**
 * @typedef creatorPage
 */
const CreatorPage = mongoose.model('CreatorPage', creatorPageSchema);

module.exports = CreatorPage;
