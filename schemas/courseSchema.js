const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  courseTitle: { type: String, required: true },
  courseInfo: { type: String, required: true },
  courseImage: {
    data: Buffer, // Store binary image data
    contentType: String, // Store image MIME type
  },
  assignedTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher", // make sure your teacher model uses this name
    required: false,
  },
});

module.exports = courseSchema;
