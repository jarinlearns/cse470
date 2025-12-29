const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const User = require('../models/User');
const { requireAuth } = require('@clerk/express');

// Middleware to verify recruiter
const verifyRecruiter = async (req, res, next) => {
    try {
        req.recruiterId = req.auth.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

// ========== GET ALL APPLICANTS FOR A SPECIFIC JOB ==========
router.get('/jobs/:jobId/applicants', requireAuth(), verifyRecruiter, async (req, res) => {
    try {
        const { jobId } = req.params;
        const { status } = req.query; // Optional filter: Pending, Accepted, Rejected

        // Find the job and verify ownership
        const job = await Job.findOne({
            _id: jobId,
            recruiterId: req.recruiterId
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found or you do not have permission to view applicants'
            });
        }

        // Filter applicants by status if provided
        let applicants = job.applicants;
        if (status) {
            applicants = applicants.filter(app => app.status === status);
        }

        // Populate user details for each applicant
        const populatedApplicants = await Promise.all(
            applicants.map(async (applicant) => {
                const userDetails = await User.findOne({ clerkId: applicant.userId })
                    .select('-__v');
                
                return {
                    _id: applicant._id,
                    userId: applicant.userId,
                    appliedAt: applicant.appliedAt,
                    status: applicant.status,
                    coverLetter: applicant.coverLetter,
                    expectedJoiningDate: applicant.expectedJoiningDate,
                    expectedSalary: applicant.expectedSalary,
                    userDetails: userDetails || null
                };
            })
        );

        res.status(200).json({
            success: true,
            job: {
                _id: job._id,
                title: job.title,
                companyName: job.companyName,
                status: job.status
            },
            applicants: populatedApplicants,
            totalApplicants: applicants.length
        });
    } catch (error) {
        console.error('Error fetching applicants:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch applicants',
            error: error.message
        });
    }
});

// ========== GET SINGLE APPLICANT DETAILS WITH FULL PROFILE ==========
router.get('/jobs/:jobId/applicants/:applicantId', requireAuth(), verifyRecruiter, async (req, res) => {
    try {
        const { jobId, applicantId } = req.params;

        // Find the job and verify ownership
        const job = await Job.findOne({
            _id: jobId,
            recruiterId: req.recruiterId
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found or you do not have permission'
            });
        }

        // Find the specific applicant
        const applicant = job.applicants.find(
            app => app._id.toString() === applicantId
        );

        if (!applicant) {
            return res.status(404).json({
                success: false,
                message: 'Applicant not found'
            });
        }

        // Get full user profile
        const userProfile = await User.findOne({ clerkId: applicant.userId });

        if (!userProfile) {
            return res.status(404).json({
                success: false,
                message: 'User profile not found'
            });
        }

        res.status(200).json({
            success: true,
            applicant: {
                _id: applicant._id,
                appliedAt: applicant.appliedAt,
                status: applicant.status,
                coverLetter: applicant.coverLetter,
                expectedJoiningDate: applicant.expectedJoiningDate,
                expectedSalary: applicant.expectedSalary
            },
            profile: {
                // Personal Info
                name: userProfile.name,
                email: userProfile.email,
                phone: userProfile.phone,
                address: userProfile.address,
                gender: userProfile.gender,
                dob: userProfile.dob,

                // Career Info
                desiredJobTitle: userProfile.desiredJobTitle,
                preferredCategory: userProfile.preferredCategory,
                preferredLocation: userProfile.preferredLocation,
                expectedSalary: userProfile.expectedSalary,
                jobType: userProfile.jobType,
                bio: userProfile.bio,

                // Education
                education: userProfile.education,

                // Experience
                experience: userProfile.experience,

                // Skills
                skills: userProfile.skills,

                // Resume
                resume: userProfile.resume
            },
            job: {
                _id: job._id,
                title: job.title,
                companyName: job.companyName
            }
        });
    } catch (error) {
        console.error('Error fetching applicant details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch applicant details',
            error: error.message
        });
    }
});

// ========== UPDATE APPLICANT STATUS ==========
router.patch('/jobs/:jobId/applicants/:applicantId/status', requireAuth(), verifyRecruiter, async (req, res) => {
    try {
        const { jobId, applicantId } = req.params;
        const { status } = req.body;

        // Validate status
        if (!['Pending', 'Accepted', 'Rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be Pending, Accepted, or Rejected'
            });
        }

        // Find the job and verify ownership
        const job = await Job.findOne({
            _id: jobId,
            recruiterId: req.recruiterId
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found or you do not have permission'
            });
        }

        // Find and update the applicant status
        const applicant = job.applicants.find(
            app => app._id.toString() === applicantId
        );

        if (!applicant) {
            return res.status(404).json({
                success: false,
                message: 'Applicant not found'
            });
        }

        applicant.status = status;
        await job.save();

        res.status(200).json({
            success: true,
            message: `Applicant status updated to ${status}`,
            applicant: {
                _id: applicant._id,
                userId: applicant.userId,
                status: applicant.status
            }
        });
    } catch (error) {
        console.error('Error updating applicant status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update applicant status',
            error: error.message
        });
    }
});

// ========== GET APPLICANTS STATISTICS FOR A JOB ==========
router.get('/jobs/:jobId/applicants/stats', requireAuth(), verifyRecruiter, async (req, res) => {
    try {
        const { jobId } = req.params;

        const job = await Job.findOne({
            _id: jobId,
            recruiterId: req.recruiterId
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        const stats = {
            total: job.applicants.length,
            pending: job.applicants.filter(a => a.status === 'Pending').length,
            accepted: job.applicants.filter(a => a.status === 'Accepted').length,
            rejected: job.applicants.filter(a => a.status === 'Rejected').length
        };

        res.status(200).json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Error fetching applicant stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch applicant statistics',
            error: error.message
        });
    }
});

// ========== DOWNLOAD APPLICANT RESUME ==========
router.get('/jobs/:jobId/applicants/:applicantId/resume', requireAuth(), verifyRecruiter, async (req, res) => {
    try {
        const { jobId, applicantId } = req.params;

        const job = await Job.findOne({
            _id: jobId,
            recruiterId: req.recruiterId
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        const applicant = job.applicants.find(
            app => app._id.toString() === applicantId
        );

        if (!applicant) {
            return res.status(404).json({
                success: false,
                message: 'Applicant not found'
            });
        }

        const userProfile = await User.findOne({ clerkId: applicant.userId });

        if (!userProfile || !userProfile.resume || !userProfile.resume.url) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }

        res.status(200).json({
            success: true,
            resume: {
                url: userProfile.resume.url,
                public_id: userProfile.resume.public_id
            }
        });
    } catch (error) {
        console.error('Error fetching resume:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch resume',
            error: error.message
        });
    }
});

module.exports = router;