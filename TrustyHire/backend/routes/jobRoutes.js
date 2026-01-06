const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// Ensure these names match EXACTLY what is in jobController.js
router.post('/', jobController.createJob); 
router.get('/', jobController.getJobs);       // <--- This was likely the one causing the crash
router.get('/:id', jobController.getJobById);

module.exports = router;