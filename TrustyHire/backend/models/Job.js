const mongoose = require('mongoose');

const jobSchema = mongoose.Schema({
    // Recruiter Info
    recruiterId: { 
        type: String, 
        required: true,
        ref: 'User'
    },
    recruiterEmail: { 
        type: String, 
        required: true 
    },
    companyName: { 
        type: String, 
        required: true 
    },

    // Job Details
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    responsibilities: { 
        type: String 
    },
    requirements: { 
        type: String 
    },
    
    // Job Specifications
    category: { 
        type: String, 
        required: true 
    },
    jobType: { 
        type: String, 
        enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
        required: true 
    },
    location: { 
        type: String, 
        required: true 
    },
    salary: { 
        type: String 
    },
    seniorityLevel: { 
        type: String, 
        enum: ['Beginner', 'Intermediate', 'Expert'],
        default: 'Intermediate'
    },

    // Status Management
    status: { 
        type: String, 
        enum: ['draft', 'published', 'closed'],
        default: 'draft'
    },
    publishedAt: { 
        type: Date 
    },
    closedAt: { 
        type: Date 
    },

    // Application Management
    applicants: [{
        userId: { type: String, ref: 'User' },
        appliedAt: { type: Date, default: Date.now },
        status: { 
            type: String, 
            enum: ['Pending', 'Accepted', 'Rejected'],
            default: 'Pending'
        },
        coverLetter: String,
        expectedJoiningDate: String,
        expectedSalary: String
    }],

    // Metadata
    views: { 
        type: Number, 
        default: 0 
    },
    
}, { timestamps: true });

// Index for efficient queries
jobSchema.index({ recruiterId: 1, status: 1 });
jobSchema.index({ status: 1, publishedAt: -1 });

module.exports = mongoose.model('Job', jobSchema);