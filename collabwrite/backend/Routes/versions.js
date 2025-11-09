const express = require("express");
const router = express.Router();
const Version = require("../Models/Version");

// Save version
router.post("/:docId/version", async (req, res) => {
  const { docId } = req.params;
  const { content, user } = req.body;
  await Version.create({ docId, content, user });

  // Keep only last 3 versions
  const versions = await Version.find({ docId }).sort({ timestamp: -1 });
  if (versions.length > 3) {
    const idsToDelete = versions.slice(3).map(v => v._id);
    await Version.deleteMany({ _id: { $in: idsToDelete } });
  }

  res.json({ msg: "Version saved" });
});

// Get last 3 versions
router.get("/:docId/versions", async (req, res) => {
  const { docId } = req.params;
  const versions = await Version.find({ docId }).sort({ timestamp: -1 }).limit(3);
  res.json(versions);
});

module.exports = router;