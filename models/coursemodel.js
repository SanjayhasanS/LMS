const mongoose = require("mongoose");

let courseschema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    price: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('courses', courseschema);