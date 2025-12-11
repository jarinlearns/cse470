const Application = require('../models/Application');

exports.submitApplication = async (req, res) => {
    try {
        const { jobId, coverLetter, expectedJoiningDate, expectedSalary } = req.body;
        const jobSeekerId = req.auth.userId;

        if (!jobId) {
            return res.status(400).json({ error: 'Job ID is required' });
        }
        if (!coverLetter || coverLetter.trim().length === 0) {
            return res.status(400).json({ error: 'Cover letter is required' });
        }

        const existingApplication = await Application.findOne({ jobId, jobSeekerId });
        if (existingApplication) {
            return res.status(400).json({ 
                error: 'You have already applied to this job',
                alreadyApplied: true 
            });
        }

        const application = new Application({
            jobId,
            jobSeekerId,
            coverLetter: coverLetter.trim(),
            expectedJoiningDate: expectedJoiningDate || null,
            expectedSalary: expectedSalary || null,
            status: 'submitted',
            appliedAt: new Date()
        });

        await application.save();

        res.status(201).json({
            message: 'Application submitted successfully',
            applicationId: application._id,
            status: application.status
        });

    } catch (error) {
        console.error('Application submission error:', error);
        res.status(500).json({ error: 'Failed to submit application' });
    }
};

exports.checkApplicationStatus = async (req, res) => {
    try {
        const { jobId } = req.params;
        const jobSeekerId = req.auth.userId;

        const application = await Application.findOne({ jobId, jobSeekerId });

        if (application) {
            return res.json({ 
                alreadyApplied: true, 
                status: application.status,
                appliedAt: application.appliedAt 
            });
        } else {
            return res.json({ alreadyApplied: false });
        }

    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({ error: 'Failed to check application status' });
    }
};

exports.getMyApplications = async (req, res) => {
    try {
        const jobSeekerId = req.auth.userId;

        const applications = await Application.find({ jobSeekerId })
            .populate('jobId', 'title company location salary jobType')
            .sort({ appliedAt: -1 });

        res.json({
            total: applications.length,
            applications: applications.map(app => ({
                applicationId: app._id,
                jobId: app.jobId._id,
                jobTitle: app.jobId.title,
                company: app.jobId.company,
                location: app.jobId.location,
                salary: app.jobId.salary,
                jobType: app.jobId.jobType,
                coverLetter: app.coverLetter,
                expectedJoiningDate: app.expectedJoiningDate,
                expectedSalary: app.expectedSalary,
                status: app.status,
                appliedAt: app.appliedAt,
                updatedAt: app.updatedAt
            }))
        });

    } catch (error) {
        console.error('Fetch applications error:', error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
};