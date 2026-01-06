const mongoose = require('mongoose');

const jobSchema = mongoose.Schema({
    // Recruiter Info
    recruiterId: { 
        type: mongoose.Schema.Types.ObjectId, // CHANGED: Allows .populate('recruiterId')
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
    // CHANGED: Arrays allow easier bullet-point rendering on frontend
    responsibilities: [{ 
        type: String 
    }], 
    requirements: [{ 
        type: String 
    }], 
    
    // Job Specifications
    category: { 
        type: String, 
        required: true 
    },
    jobType: { 
    type: String, 
    // Add 'Full-Time' to the allowed list
    enum: ['Full-time', 'Full-Time', 'Part-time', 'Part-Time', 'Contract', 'Internship', 'Freelance'],
    required: true 
},

    location: { 
        type: String, 
        required: true 
    },
    
    // CHANGED: Objects allow for better database filtering later
    salary: { 
        min: { type: Number },
        max: { type: Number },
        currency: { type: String, default: 'USD' },
        negotiable: { type: Boolean, default: false }
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
    // NOTE: If you expect thousands of applicants, move this to a separate 'Application' model.
    applicants: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // CHANGED: Allows populating applicant info
        appliedAt: { type: Date, default: Date.now },
        status: { 
            type: String, 
            enum: ['Pending', 'Accepted', 'Rejected'],
            default: 'Pending'
        },
        coverLetter: String,
        expectedJoiningDate: String,
        expectedSalary: String // Keeping this string is fine as it's user input
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
// Added index for text search if you want a search bar feature later
jobSchema.index({ title: 'text', description: 'text', companyName: 'text' }); 

// Check if 'Job' is already defined; if so, use it. If not, define it.
module.exports = mongoose.models.Job || mongoose.model('Job', jobSchema);