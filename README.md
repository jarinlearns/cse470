//Feature 1 //Form-Based App

import React,{ useState } from 'react'; //Appform

const ApplicationForm=({ jobId })=> {
  const [formData,setFormData]=useState({
    coverLetter: '',
    expectedJoiningDate: '',
    expectedSalary: ''
  });

  const handleChange=(e)=> {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit=async (e)=> {
    e.preventDefault();
    const token=localStorage.getItem('authToken');
    try {
      const response=await fetch(`${process.env.REACT_APP_API_URL}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          jobId,
          ...formData
        })
      });

      if (response.ok) {
        alert('Application submitted successfully');
        window.dispatchEvent(new Event('applicationSubmitted'));
      }
    } catch (error) {
      console.error('Submission error:',error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <textarea
          name="coverLetter"
          value={formData.coverLetter}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          rows="4"
          placeholder="Cover letter..."
          required
        />
      </div>
      <div>
        <input
          type="date"
          name="expectedJoiningDate"
          value={formData.expectedJoiningDate}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <input
          type="number"
          name="expectedSalary"
          value={formData.expectedSalary}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Expected salary"
        />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Submit Application
      </button>
    </form>
  );
};

export default ApplicationForm;

//Feature 2 // Join Date and Salary 

const mongoose = require('mongoose'); //Model
const applicationSchema=new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  jobSeekerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coverLetter: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  expectedJoiningDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value>new Date();
      },
      message: 'Joining date must be in the future'
    }
  },
  expectedSalary: {
    type: Number,
    min: 0,
    validate: {
      validator: Number.isInteger,
      message: 'Salary must be a whole number'
    }
  },
  status: {
    type: String,
    enum: ['Pending','Reviewed','Accepted','Rejected'],
    default: 'Pending'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports=mongoose.model('Application',applicationSchema);

const Application=require('../models/applicationModel'); //appcontroller
exports.submitApplication=async (req,res)=> {
  try {
    const {jobId,coverLetter,expectedJoiningDate,expectedSalary}=req.body;
    if (!coverLetter || coverLetter.trim().length===0) {                  //Validation 
      return res.status(400).json({error: 'Cover letter is required' });
    }

    const application=new Application({
      jobId,
      jobSeekerId: req.user.id,
      coverLetter: coverLetter.trim(),
      expectedJoiningDate: expectedJoiningDate || null,
      expectedSalary: expectedSalary || null,
      appliedAt: new Date()
    });

    await application.save();
    res.status(201).json({message: 'Application submitted',applicationId: application._id});
    
  } catch (error) {
    console.error('Application error:',error);
    res.status(500).json({error: 'Internal server error'});
  }
};

