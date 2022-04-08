const mongoose = require('mongoose');
const { toJSON, paginate, auditableFields } = require('./plugins');

const creatorPageItemSchema = mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    creatorPage: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'CreatorPage',
      required: true,
    },
    type: {
      type: String,
      enum: ['youtube', 'music', 'pdf', 'link'],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
    },
    data: {
      type: Array,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    ...auditableFields,
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
creatorPageItemSchema.plugin(toJSON);
creatorPageItemSchema.plugin(paginate);

// Add Index to support creator page search
creatorPageItemSchema.index({ name: 'text' });

/**
 * @typedef creatorPageItem
 */
const CreatorPageItem = mongoose.model('CreatorPageItem', creatorPageItemSchema);

module.exports = CreatorPageItem;
