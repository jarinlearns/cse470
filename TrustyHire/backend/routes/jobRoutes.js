const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

// @route   GET /api/jobs
// @desc    Get all jobs with Search & Filters
router.get('/', async (req, res) => {
    try {
        const { keyword, location, category, type } = req.query;

        // Build the Query Object
        let query = {};

        // 1. Keyword Search (Regex for partial match, case-insensitive)
        if (keyword) {
            query.title = { $regex: keyword, $options: 'i' };
        }

        // 2. Exact Filters
        if (location) query.location = location;
        if (category) query.category = category;
        if (type) query.type = type;

        const jobs = await Job.find(query).sort({ createdAt: -1 }); // Newest first
        res.json(jobs);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/jobs
// @desc    Post a dummy job (Just for your testing!)
router.post('/', async (req, res) => {
    try {
        const job = await Job.create(req.body);
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;