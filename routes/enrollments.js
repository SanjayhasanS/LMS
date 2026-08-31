const express = require('express');
const router = express.Router();
const enrollments = require('../models/enrollmentmodel');
const courses = require('../models/coursemodel');
const authmiddleware = require('../middlewares/authmiddleware');

// Enroll in a course (student only)
router.post('/', authmiddleware, async (req, res) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ msg: 'only students can enroll in courses' });
    }

    const { courseId } = req.body;
    if (!courseId) {
        return res.status(400).json({ msg: 'courseId is required' });
    }

    try {
        const course = await courses.findById(courseId);
        if (!course) {
            return res.status(404).json({ msg: 'course not found' });
        }

        const existing = await enrollments.findOne({ student: req.user.id, course: courseId });
        if (existing) {
            return res.status(409).json({ msg: 'already enrolled in this course' });
        }

        const newEnrollment = await enrollments.create({ student: req.user.id, course: courseId });
        res.status(201).json({ msg: 'enrolled successfully', enrollment: newEnrollment });
    } catch (error) {
        res.status(500).json({ msg: 'failed to enroll', error: error.message });
    }
});

// Get the logged-in student's enrolled courses
router.get('/my', authmiddleware, async (req, res) => {
    try {
        const myEnrollments = await enrollments
            .find({ student: req.user.id })
            .populate('course', 'title description price');
        res.json(myEnrollments);
    } catch (error) {
        res.status(500).json({ msg: 'failed to fetch enrollments', error: error.message });
    }
});

// Get all students enrolled in a course (instructor only, must own the course)
router.get('/course/:courseId', authmiddleware, async (req, res) => {
    if (req.user.role !== 'instructor') {
        return res.status(403).json({ msg: 'only instructors can view course enrollments' });
    }

    try {
        const course = await courses.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ msg: 'course not found' });
        }
        if (course.instructor.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'you do not own this course' });
        }

        const courseEnrollments = await enrollments
            .find({ course: req.params.courseId })
            .populate('student', 'name email');
        res.json(courseEnrollments);
    } catch (error) {
        res.status(500).json({ msg: 'failed to fetch enrollments', error: error.message });
    }
});

module.exports = router;