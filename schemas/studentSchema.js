const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    qualification: { // Fixed typo from 'colification' to 'qualification'
      type: String,
      required: true,
    },
    mobileNo: {
      type: Number,
      required: true,
    },
    active: {
      type: Boolean,
      default: true, // Default is active, soft delete sets this to false
    },
    studentImage: {
      data: Buffer, // Store binary image data
      contentType: String, // Store image MIME type
    },
  },
  { versionKey: false }
);

module.exports = studentSchema;
