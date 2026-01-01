// ManageJobPanel.jsx
import React, { useState, useEffect } from 'react';

const ManageJobPanel = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/recruiter/jobs');
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateJobStatus = async (jobId, action) => {
    try {
      const response = await fetch(`http://localhost:5000/api/recruiter/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      
      if (response.ok) {
        fetchJobs();
      }
    } catch (error) {
      console.error('Error updating job:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h3>Manage Job Posts</h3>
      
      <div>
        <h4>Active Jobs</h4>
        {jobs.filter(job => job.status === 'active').map(job => (
          <div key={job._id}>
            <h5>{job.title}</h5>
            <p>{job.company}</p>
            <button onClick={() => updateJobStatus(job._id, 'cancel')}>Cancel</button>
            <button onClick={() => updateJobStatus(job._id, 'edit')}>Edit</button>
          </div>
        ))}
      </div>

      <div>
        <h4>Past Jobs</h4>
        {jobs.filter(job => job.status === 'closed').map(job => (
          <div key={job._id}>
            <h5>{job.title}</h5>
            <p>{job.company} - Closed</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageJobPanel;

// jobController.js (for manage panel)
const Job = require('./jobModel');

const getRecruiterJobs = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const jobs = await Job.find({ recruiterId });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const updateJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { action } = req.body;

    let update = {};
    if (action === 'cancel') update.status = 'cancelled';
    if (action === 'close') update.status = 'closed';
    if (action === 'activate') update.status = 'active';

    const job = await Job.findByIdAndUpdate(jobId, update, { new: true });
    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getRecruiterJobs, updateJobStatus };

// jobModel.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: String,
  company: String,
  description: String,
  recruiterId: String,
  status: {
    type: String,
    enum: ['draft', 'active', 'closed', 'cancelled'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;
