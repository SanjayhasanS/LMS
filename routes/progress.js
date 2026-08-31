const express = require('express');
const router = express.Router();
const Progress = require('../models/progressmodel');
const Lesson = require('../models/lessonmodel');
const authmiddleware = require('../middlewares/authmiddleware');

router.post('/complete', authmiddleware, async (req, res) => {
    const { courseId, lessonId } = req.body;
    const studentId = req.user.id;

    if (!courseId || !lessonId) {
        return res.status(400).json({ msg: 'courseId and lessonId are required' });
    }

    try {
        await Progress.findOneAndUpdate(
            { student: studentId, lesson: lessonId },
            { student: studentId, course: courseId, lesson: lessonId, completedAt: new Date() },
            { upsert: true, new: true }
        );
        res.json({ msg: 'lesson marked as complete' });
    } catch (error) {
        res.status(500).json({ msg: 'failed to update progress', error: error.message });
    }
});

router.get('/:courseId', authmiddleware, async (req, res) => {
    const { courseId } = req.params;
    const studentId = req.user.id;

    try {
        const totalLessons = await Lesson.countDocuments({ course: courseId });
        const completedLessons = await Progress.countDocuments({ student: studentId, course: courseId });
        const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        res.json({ courseId, totalLessons, completedLessons, percentage });
    } catch (error) {
        res.status(500).json({ msg: 'failed to fetch progress', error: error.message });
    }
});

module.exports = router;