const mongoose = require("mongoose");

// User Schema
const Schema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, unique: true, required: true },
    phone: String,
    address: String,
    profilePic: {
        data: Buffer,
        contentType: String,
    },
    password: { type: String, required: true }, // Password field
});

module.exports = Schema;
