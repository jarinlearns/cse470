// RecruiterDashboard.jsx
import React, { useState, useEffect } from 'react';

const RecruiterDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const jobsResponse = await fetch('http://localhost:5000/api/recruiter/jobs');
      const jobsData = await jobsResponse.json();
      setJobs(jobsData);

      const applicantsResponse = await fetch('http://localhost:5000/api/recruiter/applicants');
      const applicantsData = await applicantsResponse.json();
      setApplicants(applicantsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadResume = (resumeUrl) => {
    window.open(resumeUrl, '_blank');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h3>Recruiter Dashboard</h3>

      <div>
        <h4>Job Posts ({jobs.length})</h4>
        <div>
          <button>Create New Job</button>
          <button>View All Jobs</button>
        </div>
        
        {jobs.slice(0, 5).map(job => (
          <div key={job._id}>
            <h5>{job.title}</h5>
            <p>Status: {job.status}</p>
          </div>
        ))}
      </div>

      <div>
        <h4>Recent Applicants ({applicants.length})</h4>
        {applicants.slice(0, 5).map(applicant => (
          <div key={applicant._id}>
            <h5>{applicant.name}</h5>
            <p>Applied for: {applicant.jobTitle}</p>
            <button onClick={() => downloadResume(applicant.resume)}>Download Resume</button>
            <button>Contact</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecruiterDashboard;

// dashboardController.js
const Job = require('./jobModel');
const Application = require('./applicationModel');

const getDashboardData = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    
    const jobs = await Job.find({ recruiterId });
    
    const jobIds = jobs.map(job => job._id);
    const applicants = await Application.find({ jobId: { $in: jobIds } })
      .populate('jobSeekerId', 'name email')
      .limit(10);
    
    res.json({ jobs, applicants });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getDashboardData };
