const express = require("express");
const router = express.Router();

router.get("/data", (req, res) => {
  res.send("Hello World!");
});

router.get("/getAdminData", (req, res) => {
  res.send("korevardhak@gmail.com");
});

module.exports = router;
