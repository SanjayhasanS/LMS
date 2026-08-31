const mongoose = require("mongoose");

let userschema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'instructor'], default: 'student' }
}, { timestamps: true });

module.exports = mongoose.model('users', userschema);