const mongoose = require("mongoose");

let enrollmentschema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'courses', required: true },
    enrolledAt: { type: Date, default: Date.now }
});

enrollmentschema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('enrollments', enrollmentschema);