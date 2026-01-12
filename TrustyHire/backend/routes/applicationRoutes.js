const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    submitApplication,
    checkApplicationStatus,
    getMyApplications
} = require('../controllers/applicationController');

router.post('/apply', protect, submitApplication);
router.get('/status/:jobId', protect, checkApplicationStatus);
router.get('/my-applications', protect, getMyApplications);

module.exports = router;