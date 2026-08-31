const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const users = require('../models/usermodel');

// Signup
router.post('/signup', async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ msg: 'name, email and password are required' });
    }

    try {
        const existing = await users.findOne({ email });
        if (existing) {
            return res.status(409).json({ msg: 'user already exists with this email' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await users.create({
            name,
            email,
            password: hashedPassword,
            role: role === 'instructor' ? 'instructor' : 'student'
        });

        res.status(201).json({
            msg: 'user created',
            user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
        });
    } catch (error) {
        res.status(500).json({ msg: 'signup failed', error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: 'email and password are required' });
    }

    try {
        const user = await users.findOne({ email });
        if (!user) {
            return res.status(401).json({ msg: 'invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ msg: 'invalid email or password' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            msg: 'login successful',
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ msg: 'login failed', error: error.message });
    }
});

module.exports = router;