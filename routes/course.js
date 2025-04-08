const express = require("express");
const mongoose = require("mongoose");
const courseSchema = require("../schemas/courseSchema");
const sharp = require("sharp");

module.exports = (upload) => {
  const router = express.Router();

  // ✅ 1. Get all courses (with teacher assigned if any)
  router.get("/getCourses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const CourseModel = mongoose.model(id, courseSchema);
      const courses = await CourseModel.find();

      const updatedCourses = courses.map((course) => ({
        _id: course._id,
        courseTitle: course.courseTitle,
        courseInfo: course.courseInfo,
        assignedTeacher: course.assignedTeacher || null,
        courseImage: course.courseImage
          ? `data:${course.courseImage.contentType};base64,${course.courseImage.data.toString("base64")}`
          : null,
      }));

      res.json(updatedCourses);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching courses" });
    }
  });

  // ✅ 2. Add a new course
  router.post("/addCourse/:id", upload.single("image"), async (req, res) => {
    try {
      const { id } = req.params;

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

      const Course = mongoose.model(id, courseSchema);
      const newCourse = new Course({
        courseTitle: req.body.courseTitle,
        courseInfo: req.body.courseInfo,
        assignedTeacher: req.body.assignedTeacher || null, // 🆕 Add this
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

  // ✅ 3. Edit/Update a Course
  router.put("/updateCourse/:id/:courseId", upload.single("image"), async (req, res) => {
    try {
      const { id, courseId } = req.params;
      const CourseModel = mongoose.model(id, courseSchema);

      let updatedFields = {
        courseTitle: req.body.courseTitle,
        courseInfo: req.body.courseInfo,
        assignedTeacher: req.body.assignedTeacher || null, // 🆕 Add this
      };

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

        updatedFields.courseImage = {
          data: resizedImageBuffer,
          contentType: "image/jpeg",
        };
      }

      const updatedCourse = await CourseModel.findByIdAndUpdate(courseId, updatedFields, { new: true });

      if (!updatedCourse) {
        return res.status(404).json({ message: "Course not found" });
      }

      res.json({ message: "Course updated successfully", course: updatedCourse });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update course" });
    }
  });

  // ✅ 4. Delete a Course
  router.delete("/deleteCourse/:id/:courseId", async (req, res) => {
    try {
      const { id, courseId } = req.params;
      const CourseModel = mongoose.model(id, courseSchema);

      const deletedCourse = await CourseModel.findByIdAndDelete(courseId);

      if (!deletedCourse) {
        return res.status(404).json({ message: "Course not found" });
      }

      res.json({ message: "Course deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete course" });
    }
  });

  return router;
};
