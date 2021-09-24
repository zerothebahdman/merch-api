const mongoose = require('mongoose');

const auditableFields = {
  /**
   * We excluded createdAt and updatedAt because we are already passing
   * the timestamp option at the schema level.
   */
  createdBy: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: false,
  },
  updatedBy: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: false,
  },
  deletedBy: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: false,
  },
  deletedAt: {
    type: Date,
    required: false,
  },
};

module.exports = auditableFields;
