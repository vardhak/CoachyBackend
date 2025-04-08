const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    month: {
      type: String,
      required: true,
    },
    visitors: {
        type: Number,
        required: true,
      },
  },
  { versionKey: false }
);

module.exports = schema;
