const express = require('express');
const router = express.Router();
const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');
const { requireAuth } = require('@clerk/express');

// ========== SAVE A JOB ==========
router.post('/saved-jobs', requireAuth(), async (req, res) => {
    try {
        const { jobId } = req.body;
        const userId = req.auth.userId;

        if (!jobId) {
            return res.status(400).json({
                success: false,
                message: 'Job ID is required'
            });
        }

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Check if already saved
        const existingSave = await SavedJob.findOne({ userId, jobId });
        if (existingSave) {
            return res.status(400).json({
                success: false,
                message: 'Job already saved'
            });
        }

        // Create new saved job
        const savedJob = new SavedJob({
            userId,
            jobId,
            jobTitle: job.title,
            companyName: job.companyName
        });

        await savedJob.save();

        res.status(201).json({
            success: true,
            message: 'Job saved successfully',
            savedJob
        });
    } catch (error) {
        console.error('Error saving job:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save job',
            error: error.message
        });
    }
});

// ========== UNSAVE/REMOVE A JOB ==========
router.delete('/saved-jobs/:jobId', requireAuth(), async (req, res) => {
    try {
        const { jobId } = req.params;
        const userId = req.auth.userId;

        const savedJob = await SavedJob.findOneAndDelete({ userId, jobId });

        if (!savedJob) {
            return res.status(404).json({
                success: false,
                message: 'Saved job not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Job removed from saved list'
        });
    } catch (error) {
        console.error('Error removing saved job:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove saved job',
            error: error.message
        });
    }
});

// ========== GET ALL SAVED JOBS FOR USER ==========
router.get('/saved-jobs', requireAuth(), async (req, res) => {
    try {
        const userId = req.auth.userId;

        // Get all saved job records for the user
        const savedJobs = await SavedJob.find({ userId })
            .sort({ savedAt: -1 })
            .populate('jobId');

        // Filter out any jobs that no longer exist (in case they were deleted)
        const validSavedJobs = savedJobs.filter(saved => saved.jobId !== null);

        res.status(200).json({
            success: true,
            savedJobs: validSavedJobs,
            count: validSavedJobs.length
        });
    } catch (error) {
        console.error('Error fetching saved jobs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch saved jobs',
            error: error.message
        });
    }
});

// ========== CHECK IF JOB IS SAVED ==========
router.get('/saved-jobs/check/:jobId', requireAuth(), async (req, res) => {
    try {
        const { jobId } = req.params;
        const userId = req.auth.userId;

        const savedJob = await SavedJob.findOne({ userId, jobId });

        res.status(200).json({
            success: true,
            isSaved: !!savedJob
        });
    } catch (error) {
        console.error('Error checking saved job:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check saved job status',
            error: error.message
        });
    }
});

// ========== GET SAVED JOB IDS (for bulk checking) ==========
router.get('/saved-jobs/ids', requireAuth(), async (req, res) => {
    try {
        const userId = req.auth.userId;

        const savedJobs = await SavedJob.find({ userId }).select('jobId');
        const jobIds = savedJobs.map(saved => saved.jobId.toString());

        res.status(200).json({
            success: true,
            jobIds
        });
    } catch (error) {
        console.error('Error fetching saved job IDs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch saved job IDs',
            error: error.message
        });
    }
});

module.exports = router;