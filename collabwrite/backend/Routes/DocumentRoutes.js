// Routes/DocumentRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authMiddleware = require('../Middleware/auth');

// Get Document model
const Document = mongoose.model('document');

// ====== CREATE NEW DOCUMENT ======
router.post('/api/documents', authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const ownerId = req.user.id;

    const newDocument = new Document({
      title: title || 'Untitled Document',
      content: content || '',
      ownerId: ownerId,
      isShared: false
    });

    await newDocument.save();

    res.status(201).json({
      success: true,
      message: 'Document created successfully',
      document: {
        _id: newDocument._id,
        title: newDocument.title,
        content: newDocument.content,
        ownerId: newDocument.ownerId,
        createdAt: newDocument.createdAt
      }
    });
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create document: ' + error.message
    });
  }
});

// ====== GET DOCUMENT BY ID ======
router.get('/api/documents/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid document ID format'
      });
    }

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Check if user is owner or collaborator
    if (document.ownerId.toString() !== userId) {
      const isCollaborator = document.collaborators.some(
        c => c.userId.toString() === userId
      );
      if (!isCollaborator) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized'
        });
      }
    }

    res.json({
      success: true,
      document: {
        _id: document._id,
        title: document.title,
        content: document.content,
        ownerId: document.ownerId,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
        isShared: document.isShared
      }
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch document: ' + error.message
    });
  }
});

// ====== UPDATE DOCUMENT ======
router.put('/api/documents/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user.id;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid document ID format'
      });
    }

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Check ownership or edit permission
    if (document.ownerId.toString() !== userId) {
      const collaborator = document.collaborators.find(
        c => c.userId.toString() === userId
      );
      if (!collaborator || collaborator.permission !== 'edit') {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized: You do not have edit permission'
        });
      }
    }

    // Update document
    if (title) document.title = title;
    if (content) document.content = content;
    document.updatedAt = new Date();

    await document.save();

    res.json({
      success: true,
      message: 'Document updated successfully',
      document: {
        _id: document._id,
        title: document.title,
        content: document.content,
        updatedAt: document.updatedAt
      }
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update document: ' + error.message
    });
  }
});

// ====== GET USER'S DOCUMENTS ======
router.get('/api/user/documents', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const documents = await Document.find({ ownerId: userId })
      .select('_id title createdAt updatedAt isShared')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      documents: documents
    });
  } catch (error) {
    console.error('Get user documents error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch documents: ' + error.message
    });
  }
});

// ====== DELETE DOCUMENT ======
router.delete('/api/documents/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid document ID format'
      });
    }

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Only owner can delete
    if (document.ownerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: Only owner can delete'
      });
    }

    await Document.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete document: ' + error.message
    });
  }
});

module.exports = router;