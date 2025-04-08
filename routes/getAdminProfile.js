const express = require("express");
const mongoose = require("mongoose");
const sharp = require("sharp");
const bcrypt = require("bcryptjs"); // To hash the password
const userSchema = require("../schemas/adminProfileSchema");

module.exports = (upload) => {
    const router = express.Router();
    const User = mongoose.model("AdminProfileDetail", userSchema);

    // ✅ Get Admin Profile
    router.get("/getAdmin", async (req, res) => {
        try {
            const user = await User.findOne(); // Fetch the only record

            if (!user) {
                return res.status(404).json({ message: "Admin profile not found" });
            }

            res.json({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                address: user.address,
                profilePic: user.profilePic
                    ? `data:${user.profilePic.contentType};base64,${user.profilePic.data.toString("base64")}`
                    : null,
            });
        } catch (error) {
            console.error("Error fetching admin profile:", error);
            res.status(500).json({ message: "Error fetching admin data" });
        }
    });

    // ✅ Update Admin Profile
    router.post("/setAdmin", upload.single("profilePic"), async (req, res) => {
        try {
            let user = await User.findOne(); // Fetch the only record

            if (!user) {
                user = new User(); // Create a new user if it doesn't exist
            }

            // Handle profile picture update
            if (req.file) {
                let quality = 80;
                let resizedImageBuffer = await sharp(req.file.buffer)
                    .resize({ width: 300, height: 300 })
                    .jpeg({ quality })
                    .toBuffer();

                while (resizedImageBuffer.length > 100 * 1024 && quality > 10) {
                    quality -= 10;
                    resizedImageBuffer = await sharp(req.file.buffer)
                        .resize({ width: 300, height: 300 })
                        .jpeg({ quality })
                        .toBuffer();
                }

                user.profilePic = {
                    data: resizedImageBuffer,
                    contentType: "image/jpeg",
                };
            }

            // Update user details
            user.firstName = req.body.firstName || user.firstName;
            user.lastName = req.body.lastName || user.lastName;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;
            user.address = req.body.address || user.address;

            // Handle password update if provided
            if (req.body.password) {
                if (req.body.password !== req.body.confirmPassword) {
                    return res.status(400).json({ message: "Passwords do not match" });
                }

                // Hash the password before saving
                const hashedPassword = await bcrypt.hash(req.body.password, 10);
                user.password = hashedPassword;
            }

            await user.save();
            res.json({ message: "Admin profile updated successfully" });
        } catch (error) {
            console.error("Error updating admin profile:", error);
            res.status(500).json({ message: "Error updating admin data" });
        }
    });

    return router;
};
