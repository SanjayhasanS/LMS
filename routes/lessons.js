const express = require('express');
const router = express.Router();
const lessons = require('../models/lessonmodel');
const courses = require('../models/coursemodel');
const authmiddleware = require('../middlewares/authmiddleware');
const upload = require('../middlewares/upload');

// Create a lesson under a course (instructor only)
router.post('/', authmiddleware, upload.single('attachment'), async (req, res) => {
    if (req.user.role !== 'instructor') {
        return res.status(403).json({ msg: 'only instructors can add lessons' });
    }

    const { courseId, title, content, order, videoUrl } = req.body;
    if (!courseId || !title || !content) {
        return res.status(400).json({ msg: 'courseId, title and content are required' });
    }

    try {
        const course = await courses.findById(courseId);
        if (!course) {
            return res.status(404).json({ msg: 'course not found' });
        }

        const lessonData = {
            title,
            content,
            course: courseId,
            order: order || 0,
            videoUrl: videoUrl || ''
        };

        if (req.file) {
            lessonData.attachment = {
                filename: req.file.filename,
                originalName: req.file.originalname,
                fileType: req.file.mimetype
            };
        }

        const newLesson = await lessons.create(lessonData);
        res.status(201).json({ msg: 'lesson created', lesson: newLesson });
    } catch (error) {
        res.status(500).json({ msg: 'failed to create lesson', error: error.message });
    }
});

// List all lessons
router.get('/', async (req, res) => {
    try {
        const allLessons = await lessons.find().populate('course', 'title instructor');
        res.json(allLessons);
    } catch (error) {
        res.status(500).json({ msg: 'failed to fetch lessons', error: error.message });
    }
});

// List lessons for a course
router.get('/course/:courseId', async (req, res) => {
    try {
        const courseLessons = await lessons.find({ course: req.params.courseId }).sort('order');
        res.json(courseLessons);
    } catch (error) {
        res.status(500).json({ msg: 'failed to fetch lessons', error: error.message });
    }
});

// Update a lesson (instructor only, must own the parent course, can move it to another owned course)
router.put('/:id', authmiddleware, upload.single('attachment'), async (req, res) => {
    if (req.user.role !== 'instructor') {
        return res.status(403).json({ msg: 'only instructors can update lessons' });
    }

    try {
        const lesson = await lessons.findById(req.params.id).populate('course');
        if (!lesson) {
            return res.status(404).json({ msg: 'lesson not found' });
        }
        if (lesson.course.instructor.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'you do not own this course' });
        }

        const { title, content, order, videoUrl, courseId } = req.body;

        if (courseId !== undefined && courseId !== lesson.course._id.toString()) {
            const newCourse = await courses.findById(courseId);
            if (!newCourse) {
                return res.status(404).json({ msg: 'target course not found' });
            }
            if (newCourse.instructor.toString() !== req.user.id) {
                return res.status(403).json({ msg: 'you do not own the target course' });
            }
            lesson.course = courseId;
        }

        if (title !== undefined) lesson.title = title;
        if (content !== undefined) lesson.content = content;
        if (order !== undefined) lesson.order = order;
        if (videoUrl !== undefined) lesson.videoUrl = videoUrl;

        if (req.file) {
            lesson.attachment = {
                filename: req.file.filename,
                originalName: req.file.originalname,
                fileType: req.file.mimetype
            };
        }

        await lesson.save();
        res.json({ msg: 'lesson updated', lesson });
    } catch (error) {
        res.status(500).json({ msg: 'failed to update lesson', error: error.message });
    }
});

// Delete a lesson (instructor only, must own the parent course)
router.delete('/:id', authmiddleware, async (req, res) => {
    if (req.user.role !== 'instructor') {
        return res.status(403).json({ msg: 'only instructors can delete lessons' });
    }

    try {
        const lesson = await lessons.findById(req.params.id).populate('course');
        if (!lesson) {
            return res.status(404).json({ msg: 'lesson not found' });
        }
        if (lesson.course.instructor.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'you do not own this course' });
        }

        await lesson.deleteOne();
        res.json({ msg: 'lesson deleted' });
    } catch (error) {
        res.status(500).json({ msg: 'failed to delete lesson', error: error.message });
    }
});

module.exports = router;