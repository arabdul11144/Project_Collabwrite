// Routes/ShareRoutes.js
const express = require('express');
const router = express.Router();
const Share = require('../Models/Share');
const Document = require('../Models/Document');
const crypto = require('crypto');
const authMiddleware = require('../Middleware/auth'); // ✅ IMPORT CORRECT AUTH MIDDLEWARE

// ====== UTILITY FUNCTIONS ======

// Generate unique share token
const generateShareToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate share link
const generateShareLink = (shareId) => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/share/${shareId}`;
};

// Validate email format
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// ====== CREATE OR UPDATE SHARE =====
router.post('/api/documents/:documentId/share', authMiddleware, async (req, res) => {
  try {
    const { documentId } = req.params;
    const { sharedWith, permission } = req.body;
    const sharedBy = req.user.id;

    console.log('Share request:', { documentId, sharedWith, permission, sharedBy });

    // Step 1: Validate inputs
    if (!sharedWith || !permission) {
      return res.status(400).json({
        success: false,
        error: 'sharedWith and permission are required'
      });
    }

    if (!['view', 'edit'].includes(permission)) {
      return res.status(400).json({
        success: false,
        error: 'Permission must be either "view" or "edit"'
      });
    }

    if (!isValidEmail(sharedWith)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address'
      });
    }

    // Step 2: Verify document exists and user is owner
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    if (document.ownerId.toString() !== sharedBy) {
      return res.status(403).json({
        success: false,
        error: 'You can only share your own documents'
      });
    }

    // Step 3: Check if already shared with this user
    const existingShare = await Share.findOne({
      documentId,
      sharedWith,
      isActive: true
    });

    if (existingShare) {
      // Update existing share
      existingShare.permission = permission;
      existingShare.updatedAt = new Date();
      await existingShare.save();

      return res.json({
        success: true,
        message: 'Share permission updated',
        shareData: {
          shareId: existingShare.shareId,
          permission: existingShare.permission,
          shareLink: generateShareLink(existingShare.shareId),
          expiresAt: existingShare.expiresAt
        }
      });
    }

    // Step 4: Create new share record
    const shareId = generateShareToken();
    const newShare = new Share({
      shareId,
      documentId,
      sharedBy,
      sharedWith,
      permission,
      accessCount: 0,
      isActive: true
    });

    await newShare.save();

    // Step 5: Update document's shared status
    if (!document.isShared) {
      document.isShared = true;
      await document.save();
    }

    console.log('Share created successfully:', shareId);

    res.status(201).json({
      success: true,
      message: 'Document shared successfully',
      shareData: {
        shareId,
        permission,
        shareLink: generateShareLink(shareId),
        expiresAt: newShare.expiresAt
      }
    });

  } catch (error) {
    console.error('Share creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to share document: ' + error.message
    });
  }
});

// ===== ACCESS SHARED DOCUMENT =====
router.get('/api/documents/shared/:shareId', async (req, res) => {
  try {
    const { shareId } = req.params;

    console.log('Accessing shared document:', shareId);

    // Step 1: Find share record
    const share = await Share.findOne({ shareId, isActive: true })
      .populate('documentId')
      .populate('sharedBy', 'name email');

    if (!share) {
      return res.status(404).json({
        success: false,
        error: 'Share link not found or has been revoked'
      });
    }

    // Step 2: Check expiration
    if (share.expiresAt && new Date() > share.expiresAt) {
      share.isActive = false;
      await share.save();
      return res.status(403).json({
        success: false,
        error: 'Share link has expired'
      });
    }

    // Step 3: Increment access count
    share.accessCount += 1;
    await share.save();

    // Step 4: Return document with permission info
    const document = share.documentId;
    res.json({
      success: true,
      document: {
        _id: document._id,
        title: document.title,
        content: document.content,
        createdAt: document.createdAt,
        sharedBy: share.sharedBy ? share.sharedBy.name : 'Unknown'
      },
      permission: share.permission,
      canEdit: share.permission === 'edit',
      canView: true
    });

  } catch (error) {
    console.error('Access shared document error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to access document: ' + error.message
    });
  }
});

// ===== LIST ALL SHARES FOR A DOCUMENT =====
router.get('/api/documents/:documentId/shares', authMiddleware, async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;

    console.log('Listing shares for document:', documentId);

    // Verify ownership
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    if (document.ownerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    // Get all active shares
    const shares = await Share.find({
      documentId,
      isActive: true
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      shares: shares.map(share => ({
        shareId: share.shareId,
        sharedWith: share.sharedWith,
        permission: share.permission,
        createdAt: share.createdAt,
        expiresAt: share.expiresAt,
        accessCount: share.accessCount,
        shareLink: generateShareLink(share.shareId)
      }))
    });

  } catch (error) {
    console.error('List shares error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch shares: ' + error.message
    });
  }
});

// ===== UPDATE SHARE PERMISSION =====
router.patch('/api/documents/:documentId/share/:shareId', authMiddleware, async (req, res) => {
  try {
    const { documentId, shareId } = req.params;
    const { permission } = req.body;
    const userId = req.user.id;

    console.log('Updating share permission:', { shareId, permission });

    // Validate permission
    if (!['view', 'edit'].includes(permission)) {
      return res.status(400).json({
        success: false,
        error: 'Permission must be either "view" or "edit"'
      });
    }

    // Verify document ownership
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    if (document.ownerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    // Update share
    const share = await Share.findOneAndUpdate(
      { shareId, isActive: true },
      { permission, updatedAt: new Date() },
      { new: true }
    );

    if (!share) {
      return res.status(404).json({
        success: false,
        error: 'Share not found'
      });
    }

    res.json({
      success: true,
      message: 'Permission updated successfully',
      shareData: {
        shareId: share.shareId,
        permission: share.permission
      }
    });

  } catch (error) {
    console.error('Update permission error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update permission: ' + error.message
    });
  }
});

// ===== REVOKE SHARE ACCESS =====
router.delete('/api/documents/:documentId/share/:shareId', authMiddleware, async (req, res) => {
  try {
    const { documentId, shareId } = req.params;
    const userId = req.user.id;

    console.log('Revoking share:', shareId);

    // Verify document ownership
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    if (document.ownerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    // Revoke share
    const share = await Share.findOneAndUpdate(
      { shareId, documentId },
      { 
        isActive: false, 
        revokedAt: new Date() 
      },
      { new: true }
    );

    if (!share) {
      return res.status(404).json({
        success: false,
        error: 'Share not found'
      });
    }

    res.json({
      success: true,
      message: 'Share access revoked successfully'
    });

  } catch (error) {
    console.error('Revoke share error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to revoke share: ' + error.message
    });
  }
});

module.exports = router;