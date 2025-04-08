const express = require("express");
const mongoose = require("mongoose");
const teacherSchema = require("../schemas/teacherSchema");
const sharp = require("sharp");

module.exports = (upload) => {
  const router = express.Router();

  // Get teacher data (only active teachers)
  router.get("/getTeacherData/:p", async (req, res) => {
    try {
      const p = req.params.p;
      const teacherCollection = mongoose.model(p, teacherSchema);
      const teachers = await teacherCollection.find({ });

      const updatedTeachers = teachers.map((teacher) => ({
        _id: teacher._id,
        fullname: teacher.fullname,
        email: teacher.email,
        qualification: teacher.qualification,
        mobileNo: teacher.mobileNo,
        active: teacher.active,
        teacherImage: teacher.teacherImage
          ? `data:${teacher.teacherImage.contentType};base64,${teacher.teacherImage.data.toString("base64")}`
          : null,
      }));

      res.json(updatedTeachers);
    } catch (e) {
      console.error(e);
      res.status(500).json({ msg: "Failed to get teachers data" });
    }
  });

  // Add a new teacher
  router.post("/setTeacherData/:p", upload.single("teacherImage"), async (req, res) => {
    try {
      const p = req.params.p;
      const { fullname, email, qualification, mobileNo } = req.body;

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

      const teacherCollection = mongoose.model(p, teacherSchema);
      const teacher = new teacherCollection({
        fullname,
        email,
        qualification,
        mobileNo,
        active: true, // Teacher is active by default
        teacherImage: {
          data: resizedImageBuffer,
          contentType: "image/jpeg",
        },
      });

      await teacher.save();
      res.status(200).json({ message: "Teacher added successfully!" });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Failed to add teacher.", error: e.message });
    }
  });

  // Update teacher data
  router.put("/updateTeacher/:p/:id", upload.single("teacherImage"), async (req, res) => {
    try {
      const { p, id } = req.params;
      const { fullname, email, qualification, mobileNo } = req.body;
      const teacherCollection = mongoose.model(p, teacherSchema);

      let updateData = { fullname, email, qualification, mobileNo };

      if (req.file) {
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

        updateData.teacherImage = {
          data: resizedImageBuffer,
          contentType: "image/jpeg",
        };
      }

      await teacherCollection.findByIdAndUpdate(id, updateData);
      res.status(200).json({ message: "Teacher updated successfully!" });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Failed to update teacher.", error: e.message });
    }
  });



  // Enable teacher (set active to true)
  router.put("/enableTeacher/:p/:id", async (req, res) => {
    try {
      const { p, id } = req.params;
      const teacherCollection = mongoose.model(p, teacherSchema);
      await teacherCollection.findByIdAndUpdate(id, { active: true });

      res.status(200).json({ message: "Teacher enabled successfully!" });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Failed to enable teacher.", error: e.message });
    }
  });

  // Disable teacher (set active to false)
  router.put("/disableTeacher/:p/:id", async (req, res) => {
    try {
      const { p, id } = req.params;
      const teacherCollection = mongoose.model(p, teacherSchema);
      await teacherCollection.findByIdAndUpdate(id, { active: false });

      res.status(200).json({ message: "Teacher disabled successfully!" });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Failed to disable teacher.", error: e.message });
    }
  });



  return router;
};
