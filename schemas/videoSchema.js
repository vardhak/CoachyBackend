const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  publicId: { type: String, required: true },
  courseTitle: { type: String, required: true }, // for filtering
}, { timestamps: true });

module.exports = videoSchema;
