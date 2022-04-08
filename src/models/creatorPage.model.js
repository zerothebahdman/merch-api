const mongoose = require('mongoose');
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
