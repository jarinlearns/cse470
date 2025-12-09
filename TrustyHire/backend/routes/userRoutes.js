const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

router.put('/profile', protect, upload.single('resume'), async (req, res) => {
    try {
        const clerkId = req.auth.userId;
        const body = req.body;

        let user = await User.findOne({ clerkId });
        if (!user) {
            user = new User({ clerkId, email: body.email, name: body.name });
        }

        // Update Simple Fields
        const fields = ['name', 'gender', 'dob', 'phone', 'address', 'desiredJobTitle', 'preferredCategory', 'preferredLocation', 'expectedSalary', 'jobType', 'bio'];
        fields.forEach(field => {
            if (body[field]) user[field] = body[field];
        });

        // Update Arrays (Parse JSON strings from FormData)
        if (body.education) user.education = JSON.parse(body.education);
        if (body.experience) user.experience = JSON.parse(body.experience);
        if (body.skills) user.skills = JSON.parse(body.skills);

        // Update File
        if (req.file) {
            user.resume = { url: req.file.path, public_id: req.file.filename };
        }

        await user.save();
        res.json(user);

    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ message: error.message });
    }
});

router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findOne({ clerkId: req.auth.userId });
        if (user) res.json(user);
        else res.status(404).json({ message: 'User not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;