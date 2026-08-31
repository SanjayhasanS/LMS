const express = require('express');
const router = express.Router();
const courses = require('../models/coursemodel');
const authmiddleware = require('../middlewares/authmiddleware');

// Create a course (instructor only)
router.post('/', authmiddleware, async (req, res) => {
    if (req.user.role !== 'instructor') {
        return res.status(403).json({ msg: 'only instructors can create courses' });
    }
    const { title, description, price } = req.body;
    if (!title || !description) {
        return res.status(400).json({ msg: 'title and description are required' });
    }
    try {
        const newCourse = await courses.create({
            title,
            description,
            price: price || 0,
            instructor: req.user.id
        });
        res.status(201).json({ msg: 'course created', course: newCourse });
    } catch (error) {
        res.status(500).json({ msg: 'failed to create course', error: error.message });
    }
});

// List all courses
router.get('/', async (req, res) => {
    try {
        const allCourses = await courses.find().populate('instructor', 'name email');
        res.json(allCourses);
    } catch (error) {
        res.status(500).json({ msg: 'failed to fetch courses', error: error.message });
    }
});

// Get single course
router.get('/:id', async (req, res) => {
    try {
        const course = await courses.findById(req.params.id).populate('instructor', 'name email');
        if (!course) {
            return res.status(404).json({ msg: 'course not found' });
        }
        res.json(course);
    } catch (error) {
        res.status(500).json({ msg: 'failed to fetch course', error: error.message });
    }
});

// Update a course (instructor only, must own it)
router.put('/:id', authmiddleware, async (req, res) => {
    if (req.user.role !== 'instructor') {
        return res.status(403).json({ msg: 'only instructors can update courses' });
    }

    try {
        const course = await courses.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ msg: 'course not found' });
        }
        if (course.instructor.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'you do not own this course' });
        }

        const { title, description, price } = req.body;
        if (title !== undefined) course.title = title;
        if (description !== undefined) course.description = description;
        if (price !== undefined) course.price = price;

        await course.save();
        res.json({ msg: 'course updated', course });
    } catch (error) {
        res.status(500).json({ msg: 'failed to update course', error: error.message });
    }
});

// Delete a course (instructor only, must own it)
router.delete('/:id', authmiddleware, async (req, res) => {
    if (req.user.role !== 'instructor') {
        return res.status(403).json({ msg: 'only instructors can delete courses' });
    }

    try {
        const course = await courses.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ msg: 'course not found' });
        }
        if (course.instructor.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'you do not own this course' });
        }

        await course.deleteOne();
        res.json({ msg: 'course deleted' });
    } catch (error) {
        res.status(500).json({ msg: 'failed to delete course', error: error.message });
    }
});

module.exports = router;