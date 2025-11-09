// models/Share.js
const mongoose = require('mongoose');

const shareSchema = new mongoose.Schema({
  shareId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  sharedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sharedWith: {
    type: String, // email or user ID
    required: true
  },
  permission: {
    type: String,
    enum: ['view', 'edit'],
    default: 'view'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date, // Optional - null means no expiration
  accessCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  revokedAt: Date
});

module.exports = mongoose.model('Share', shareSchema);