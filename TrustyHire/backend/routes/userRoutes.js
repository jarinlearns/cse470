const express = require('express');
const router = express.Router();
const multer = require('multer');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); 
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

// --- FEATURE 1: REGISTER WITH EMAIL VERIFICATION ---
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    
    try {
        // 1. Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 2. Generate secure token
        const verificationToken = crypto.randomBytes(20).toString('hex');

        // 3. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Create user in Database
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            verificationToken
        });

        // 5. Attempt to Send Email (With Error Safety)
        const verifyUrl = `http://localhost:5173/verify/${verificationToken}`;
        const message = `
            <h1>Welcome to TrustyHire!</h1>
            <p>Please click the link below to verify your email:</p>
            <a href="${verifyUrl}">${verifyUrl}</a>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'TrustyHire Email Verification',
                message,
            });
            
            res.status(201).json({ 
                message: 'Registration successful! Please check your email.' 
            });

        } catch (emailError) {
            console.error("❌ Email Sending Failed:", emailError.message);
            // Even if email fails, tell frontend the account was created
            res.status(201).json({ 
                message: 'Account created, but email failed to send. Please contact support.' 
            });
        }

    } catch (error) {
        console.error("❌ Server Error:", error);
        res.status(500).json({ message: error.message });
    }
});

// --- VERIFY EMAIL ROUTE ---
router.post('/verify', async (req, res) => {
    const { token } = req.body;
    try {
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.json({ message: 'Email Verified Successfully! You can now login.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- LOGIN ROUTE ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            if (!user.isVerified) {
                return res.status(401).json({ message: 'Please verify your email first.' });
            }
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                education: user.education,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- PROFILE UPDATE ROUTE ---
router.put('/profile', protect, upload.single('resume'), async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;

            if (req.body.education) {
                user.education = JSON.parse(req.body.education);
            }
            
            if (req.file) {
                user.resume = { url: req.file.path, public_id: req.file.filename };
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                education: updatedUser.education,
                resume: updatedUser.resume,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;