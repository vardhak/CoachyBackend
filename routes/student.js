const express = require("express");
const mongoose = require("mongoose");
const studentSchema = require("../schemas/studentSchema");
const sharp = require("sharp");
const { ObjectId } = mongoose.Types;

module.exports = (upload) => {
  const router = express.Router();

  // Get student data
  router.get("/getStudentData/:p", async (req, res) => {
    try {
      const p = req.params.p;
      const StudentCollection = mongoose.model(p, studentSchema);
      const students = await StudentCollection.find({});

      const updatedStudents = students.map((student) => ({
        _id: student._id,
        fullname: student.fullname,
        email: student.email,
        qualification: student.qualification,
        mobileNo: student.mobileNo,
        active: student.active ?? true, // Ensure active is included (default to true if missing)
        studentImage: student.studentImage
          ? `data:${student.studentImage.contentType};base64,${student.studentImage.data.toString("base64")}`
          : null,
      }));

      res.json(updatedStudents);
    } catch (e) {
      console.error(e);
      res.status(500).json({ msg: "Failed to get student data" });
    }
  });


  // Add student
  router.post("/setStudentData/:p", upload.single("studentImage"), async (req, res) => {
    try {
      const { p } = req.params;

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      let quality = 80;
      let resizedImageBuffer = await sharp(req.file.buffer)
        .resize({ width: 800 })
        .jpeg({ quality })
        .toBuffer();

      while (resizedImageBuffer.length > 500 * 1024 && quality > 10) {
        quality -= 10;
        resizedImageBuffer = await sharp(req.file.buffer)
          .resize({ width: 800 })
          .jpeg({ quality })
          .toBuffer();
      }

      const StudentCollection = mongoose.model(p, studentSchema);
      const student = new StudentCollection({
        fullname: req.body.fullname,
        email: req.body.email,
        mobileNo: req.body.mobileNo,
        qualification: req.body.qualification,
        studentImage: {
          data: resizedImageBuffer,
          contentType: "image/jpeg",
        },
      });

      await student.save();
      res.status(200).json({ message: "Student data added successfully!" });
    } catch (e) {
      console.error("Error storing student data:", e);
      res.status(500).json({ message: "Failed to add student data.", error: e.message });
    }
  });

  // Update student details
  router.put("/updateStudent/:collectionName/:id", upload.single("studentImage"), async (req, res) => {
    try {
      const { collectionName, id } = req.params;
      const { fullname, email, mobileNo, qualification } = req.body;

      const StudentCollection = mongoose.model(collectionName, studentSchema);
      const updateData = { fullname, email, mobileNo, qualification };

      if (req.file) {
        updateData.studentImage = {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        };
      }

      await StudentCollection.findByIdAndUpdate(id, updateData);

      res.json({ message: "Student Updated Successfully!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update student" });
    }
  });

  router.put("/deleteStudent/:collectionName/:id", async (req, res) => {
    try {
      const { collectionName, id } = req.params;
      const StudentCollection = mongoose.model(collectionName, studentSchema);

      await StudentCollection.updateOne({ _id: new ObjectId(id) }, { $set: { active: false } });

      res.json({ message: "Student marked as inactive" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete student" });
    }
  });

  router.put("/enableStudent/:p/:studentId", async (req, res) => {
    try {
      const { p, studentId } = req.params;
      const StudentCollection = mongoose.model(p, studentSchema);

      await StudentCollection.findByIdAndUpdate(studentId, { active: true });

      res.json({ msg: "Student reactivated successfully." });
    } catch (e) {
      console.error(e);
      res.status(500).json({ msg: "Failed to enable student" });
    }
  });


  return router;
};
