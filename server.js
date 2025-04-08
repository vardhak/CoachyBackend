const express = require("express");
const cors = require("cors");
const multer = require("multer");
require("dotenv").config();
const mongoose = require("mongoose");

const app = express();
const port = process.env.PORT || 3000;
const DATABASE = "CoachyDatabase";

// Middleware
const corsOptions = {
  origin: [process.env.CORS_ORIGIN],
};
app.use(cors(corsOptions));
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_CON_PUBLIC_URL + DATABASE)
  .then(() => console.log("Database Connected!"))
  .catch((e) => console.log("Database Failed To Connect: " + e));

// Multer setup (in-memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Import modular routes
app.use("/", require("./routes/general"));
app.use("/", require("./routes/contactUs"));
app.use("/", require("./routes/teacher")(upload));
app.use("/", require("./routes/student")(upload));
app.use("/", require("./routes/course")(upload));
app.use("/", require("./routes/visitor"));
app.use("/", require("./routes/video"));
app.use("/", require("./routes/getAdminProfile")(upload));

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
