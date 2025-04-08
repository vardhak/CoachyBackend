const express = require("express");
const cors = require("cors");
const multer = require("multer");
const sharp = require("sharp");
require("dotenv").config();
const mongoose = require("mongoose");
const DATABASE = "CoachyDatabase";
const teacherSchema = require("./schemas/teacherSchema");
const studentSchema = require("./schemas/studentSchema");
const courseSchema = require("./schemas/courseSchema");
const visitorsSchema = require("./schemas/visitorsSchema");

const app = express();
exports.app = app;
const port = 3000;

// connection to the frontend
const corsOptions = {
  origin: ["http://localhost:5173"],
};
exports.corsOptions = corsOptions;
app.use(express.json()); // Add this line

// connection to the monogdb database

mongoose
  .connect(process.env.MONGODB_CON_PUBLIC_URL + DATABASE)
  .then(() => {
    console.log("Database Connected !");
  })
  .catch((e) => {
    console.log("Database Failed To Connect : " + e);
  });

app.use(cors(corsOptions));

// adding the video related API
app.use(require("./routes/video"));


// Multer setup (store file in memory, not disk)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



// ---------------------------------------------------------------------------------------------------------

app.get("/data", (req, res) => {
  res.send("Hello World!");
});

app.get("/getAdminData", (req, res) => {
  res.send("korevardhak@gmail.com");
});

//method to get the teacher data form databse
app.get("/getTeacherData/:p", async (req, res) => {
  try {
    const p = req.params.p;
    const teacherCollection = mongoose.model(p, teacherSchema);
    const teachers = await teacherCollection.find({});

    // Map student data to include image URLs
    const updatedTeachers = teachers.map((teacher) => ({
      _id: teacher._id,
      fullname: teacher.fullname,
      email: teacher.email,
      colification: teacher.colification,
      mobileNo: teacher.mobileNo,
      teacherImage: teacher.teacherImage
        ? `data:${teacher.teacherImage.contentType};base64,${teacher.teacherImage.data.toString('base64')}`
        : null, // If image exists, generate a URL
    }));

    res.json(updatedTeachers);
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Failed to get teachers data" });
  }
});

app.get("/getStudentData/:p", async (req, res) => {
  try {
    const p = req.params.p;
    const StudentCollection = mongoose.model(p, studentSchema);
    const students = await StudentCollection.find({});

    // Map student data to include image URLs
    const updatedStudents = students.map((student) => ({
      _id: student._id,
      fullname: student.fullname,
      email: student.email,
      colification: student.colification,
      mobileNo: student.mobileNo,
      studentImage: student.studentImage
        ? `data:${student.studentImage.contentType};base64,${student.studentImage.data.toString('base64')}`
        : null, // If image exists, generate a URL
    }));

    res.json(updatedStudents);
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Failed to get student data" });
  }
});


app.get('/getCourses/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Dynamically get the correct Course model
    const CourseModel = mongoose.model(id, courseSchema);

    const courses = await CourseModel.find();

    // Map the courses and include base64-encoded images
    const updatedCourses = courses.map(course => ({
      _id: course._id,
      courseTitle: course.courseTitle,
      courseInfo: course.courseInfo,
      courseImage: course.courseImage
        ? `data:${course.courseImage.contentType};base64,${course.courseImage.data.toString('base64')}`
        : null, // Convert binary image data to base64
    }));

    res.json(updatedCourses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching courses" });
  }
});

app.get("/getVisitorsData", async (req, res) => {
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
})


// ==========================================================POST METHODS============================================

// method to set data to specific stanadrad teachers collection
app.post("/setTeacherData/:p", upload.single("teacherImage"), async (req, res) => {
  try {
    // Assuming you send employee data as JSON in the request body
    const p = req.params.p;

    const { fullname, email, qualification, mobileNo } = req.body; // Use req.body to access the sent data

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let quality = 80;
    let resizedImageBuffer = await sharp(req.file.buffer)
      .resize({ width: 800 }) // Resize image width to 800px
      .jpeg({ quality }) // Set initial quality
      .toBuffer();

    // Keep reducing quality until it's under 500KB
    while (resizedImageBuffer.length > 500 * 1024 && quality > 10) {
      quality -= 10;
      resizedImageBuffer = await sharp(req.file.buffer)
        .resize({ width: 800 })
        .jpeg({ quality })
        .toBuffer();
    }


    // Create a new document based on the schema and model
    const teacherCollection = mongoose.model(p, teacherSchema);
    const teacher = new teacherCollection({
      fullname: fullname,
      email: email,
      colification: qualification,
      mobileNo: mobileNo,
      teacherImage: {
        data: resizedImageBuffer,
        contentType: "image/jpeg",
      }
    });

    // Save the document to the database
    await teacher.save();

    // Respond with a success message
    res.status(200).json({ message: "Teacher data added successfully!" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to add data.", error: e.message });
  }
});

app.post("/setStudentData/:p", upload.single("studentImage"), async (req, res) => {
  try {
    const { p } = req.params;
    // const { fullname, email, qualification, mobileNo } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let quality = 80;
    let resizedImageBuffer = await sharp(req.file.buffer)
      .resize({ width: 800 }) // Resize image width to 800px
      .jpeg({ quality }) // Set initial quality
      .toBuffer();

    // Keep reducing quality until it's under 500KB
    while (resizedImageBuffer.length > 500 * 1024 && quality > 10) {
      quality -= 10;
      resizedImageBuffer = await sharp(req.file.buffer)
        .resize({ width: 800 })
        .jpeg({ quality })
        .toBuffer();
    }

    // Get student collection dynamically
    const StudentCollection = mongoose.model(p, studentSchema);
    // Create a new student document
    const student = new StudentCollection({
      fullname: req.body.fullname,
      email: req.body.email,
      mobileNo: req.body.mobileNo,
      colification: req.body.qualification, // Fix typo "colification"
      studentImage: {
        data: resizedImageBuffer,
        contentType: "image/jpeg",
      }, // Assign only if image exists
    });

    // Save to database
    await student.save();

    res.status(200).json({ message: "Student data added successfully!" });
  } catch (e) {
    console.error("Error storing student data:", e);
    res.status(500).json({ message: "Failed to add student data.", error: e.message });
  }
});


app.post("/addCourse/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let quality = 80; // Initial quality for compression
    let resizedImageBuffer = await sharp(req.file.buffer)
      .resize({ width: 800 }) // Resize width to max 800px (optional)
      .jpeg({ quality }) // Initial compression
      .toBuffer();

    // Loop to ensure size is <= 500KB
    while (resizedImageBuffer.length > 500 * 1024 && quality > 10) {
      quality -= 10; // Reduce quality further
      resizedImageBuffer = await sharp(req.file.buffer)
        .resize({ width: 800 })
        .jpeg({ quality })
        .toBuffer();
    }

    const Course = mongoose.model(id, courseSchema);
    const newCourse = new Course({
      courseTitle: req.body.courseTitle,
      courseInfo: req.body.courseInfo,
      courseImage: {
        data: resizedImageBuffer,
        contentType: "image/jpeg",
      },
    });

    await newCourse.save();
    res.json({ message: `Course added successfully for ID: ${id}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add course" });
  }
});








app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
