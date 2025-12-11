// ApplicationForm.jsx //Feature 1
import React, { useState } from 'react';

const ApplicationForm = ({ jobId = "job-001" }) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [expectedJoiningDate, setExpectedJoiningDate] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!coverLetter.trim()) {
      setResult('Cover letter is required');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const response = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          coverLetter,
          expectedJoiningDate: expectedJoiningDate || null,
          expectedSalary: expectedSalary || null
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult('Application submitted');
        setCoverLetter('');
        setExpectedJoiningDate('');
        setExpectedSalary('');
      } else {
        setResult(data.error || 'Failed');
      }
    } catch (error) {
      setResult('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Application Form</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Cover Letter *</label>
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Expected Joining Date</label>
          <input
            type="date"
            value={expectedJoiningDate}
            onChange={(e) => setExpectedJoiningDate(e.target.value)}
          />
        </div>

        <div>
          <label>Expected Salary</label>
          <input
            type="number"
            value={expectedSalary}
            onChange={(e) => setExpectedSalary(e.target.value)}
            min="0"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>

      {result && <div>{result}</div>}
    </div>
  );
};

export default ApplicationForm;

//Feature 2 // Join Date and Salary 

// applicationController.js
const Application = require('./applicationModel');

const submitApplication = async (req, res) => {
  try {
    const { jobId, coverLetter, expectedJoiningDate, expectedSalary } = req.body;

    if (!jobId || !coverLetter) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const application = new Application({
      jobId,
      jobSeekerId: req.user?.id || 'user',
      coverLetter,
      expectedJoiningDate: expectedJoiningDate || null,
      expectedSalary: expectedSalary || null,
      status: 'Pending'
    });

    await application.save();

    res.status(201).json({
      success: true,
      applicationId: application._id
    });

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { submitApplication };

// applicationModel.js
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: String,
  jobSeekerId: String,
  coverLetter: String,
  expectedJoiningDate: Date,
  expectedSalary: Number,
  status: {
    type: String,
    default: 'Pending'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;
