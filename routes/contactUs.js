const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const contactSchema = require("../schemas/contactUsSchema");

// ✅ Define the model ONCE
const ContactModel = mongoose.model("contact_message", contactSchema);

// ✅ POST /sendMessage - store contact form messages
router.post("/sendContactMessage", async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const newMessage = new ContactModel({ name, email, message });
        await newMessage.save();

        res.status(200).json({ message: "Message received successfully!" });
    } catch (error) {
        console.error("Error saving contact message:", error);
        res.status(500).json({ error: "Failed to send message." });
    }
});

// ✅ GET all contact messages
router.get("/getMessages", async (req, res) => {
    try {
        const messages = await ContactModel.find().sort({ submittedAt: -1 });
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});

// ✅ PUT /markViewed/:id - update viewed status
router.put("/contactMessage/markViewed/:id", async (req, res) => {
    try {
        const updated = await ContactModel.findByIdAndUpdate(
            req.params.id,
            { viewed: true },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ error: "Message not found" });
        }

        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update status" });
    }
});

module.exports = router;
