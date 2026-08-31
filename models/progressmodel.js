const mongoose = require("mongoose");

let progressschema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'courses', required: true },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'lessons', required: true },
    completedAt: { type: Date, default: Date.now }
});

progressschema.index({ student: 1, lesson: 1 }, { unique: true });

module.exports = mongoose.model('progress', progressschema);