const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// 1. Create a new Job
router.post('/', jobController.createJob); 

// 2. Get ALL Jobs (for the public feed)
router.get('/', jobController.getJobs);

// 3. Get RECRUITER'S Jobs (Dashboard list)
router.get('/recruiter/my-jobs', jobController.getRecruiterJobs); 

// 4. Get SINGLE Job details FOR RECRUITER (Manage Applicants)
// 👇 THIS WAS MISSING AND CAUSED THE "JOB NOT FOUND" ERROR
router.get('/recruiter/:jobId', jobController.getJobForRecruiter);

// 5. Update Applicant Status (Accept/Reject button)
router.patch('/recruiter/:jobId/applicants/:applicantId', jobController.updateApplicantStatus);

// 6. Get ONE Job by ID (Generic public view)
// ⚠️ IMPORTANT: Keep this one LAST because ':id' matches everything!
router.get('/:id', jobController.getJobById);

module.exports = router;