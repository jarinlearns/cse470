// JobDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const JobDetailsPage = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/jobs/${jobId}`);
      const data = await response.json();
      setJob(data);
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!job) return <div>Job not found</div>;

  return (
    <div>
      <h2>{job.title}</h2>
      
      <div>
        <h4>Job Type</h4>
        <p>{job.jobType}</p>
      </div>

      <div>
        <h4>Description</h4>
        <p>{job.description}</p>
      </div>

      <div>
        <h4>Responsibilities</h4>
        <ul>
          {job.responsibilities?.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      <div>
        <h4>Seniority Level</h4>
        <p>{job.seniorityLevel}</p>
      </div>

      <button>Apply Now</button>
    </div>
  );
};

export default JobDetailsPage;

// jobDetailsController.js
const Job = require('./jobModel');

const getJobDetails = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getJobDetails };

// jobModel.js (updated with new fields)
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: String,
  company: String,
  jobType: String,
  description: String,
  responsibilities: [String],
  seniorityLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Expert']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;
