const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });
const Video = require('../schemas/videoSchema'); // Base schema

// POST /api/upload/class_<id>_lectures
router.post('/upload/:collectionName', upload.single('video'), async (req, res) => {
  try {
    const { collectionName } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!req.body.title || !req.body.courseTitle) {
      return res.status(400).json({ error: 'Missing title or courseTitle' });
    }

    const DynamicVideoModel = mongoose.model(collectionName, Video);

    const newVideo = new DynamicVideoModel({
      title: req.body.title,
      courseTitle: req.body.courseTitle, // added for filtering
      videoUrl: req.file.path,
      publicId: req.file.filename,
    });

    await newVideo.save();

    res.status(200).json({ message: 'Video uploaded successfully', data: newVideo });
  } catch (err) {
    console.error('🔥 Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/videos/class_<id>_lectures
router.get('/videos/:collectionName', async (req, res) => {
  try {
    const { collectionName } = req.params;
    const DynamicVideoModel = mongoose.model(collectionName, Video);

    const videos = await DynamicVideoModel.find().sort({ createdAt: -1 });

    res.status(200).json(videos);
  } catch (err) {
    console.error('❌ Fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /update-video/:collectionName/:videoId
router.put('/update-video/:collectionName/:videoId', async (req, res) => {
  try {
    const { collectionName, videoId } = req.params;
    const { title } = req.body;

    const DynamicVideo = mongoose.model(collectionName, Video);
    const updated = await DynamicVideo.findByIdAndUpdate(
      videoId,
      { title, updatedAt: new Date() },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.status(200).json({ message: 'Video updated successfully', data: updated });
  } catch (err) {
    console.error('❌ Update error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /delete-video/:collectionName/:videoId
router.delete('/delete-video/:collectionName/:videoId', async (req, res) => {
  try {
    const { collectionName, videoId } = req.params;
    const { publicId } = req.body;

    const DynamicVideo = mongoose.model(collectionName, Video);
    const deleted = await DynamicVideo.findByIdAndDelete(videoId);

    if (!deleted) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Optional: Delete video from Cloudinary
    const cloudinary = require('cloudinary').v2;
    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });

    res.status(200).json({ message: 'Video deleted successfully' });
  } catch (err) {
    console.error('❌ Delete error:', err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
