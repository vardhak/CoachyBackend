const express = require("express");
const mongoose = require("mongoose");
const visitorsSchema = require("../schemas/visitorsSchema");

const router = express.Router();

// Get visitors data
router.get("/getVisitorsData", async (req, res) => {
  try {
    const visitorsModel = mongoose.model("visitorsData", visitorsSchema);

    const data = await visitorsModel.aggregate([
      { $sort: { _id: -1 } }, // Get the last 5 records (newest first)
      { $limit: 5 }, // Keep only the last 5 records
      { $sort: { _id: 1 } }, // Re-sort them in original order (oldest first)
    ]);

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching visitorsData" });
  }
});

module.exports = router;
