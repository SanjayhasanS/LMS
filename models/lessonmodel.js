const mongoose = require("mongoose");

let lessonschema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'courses', required: true },
    order: { type: Number, default: 0 },
    videoUrl: { type: String, default: '' },
    attachment: {
        filename: { type: String, default: '' },
        originalName: { type: String, default: '' },
        fileType: { type: String, default: '' }
    }
}, { timestamps: true });

module.exports = mongoose.model('lessons', lessonschema);
