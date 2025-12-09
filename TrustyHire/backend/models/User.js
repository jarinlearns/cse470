const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    name: { type: String },

    // 1. Personal Info
    gender: { type: String },
    dob: { type: String },
    phone: { type: String },
    address: { type: String },

    // 2. Career Information
    desiredJobTitle: { type: String },
    preferredCategory: { type: String },
    preferredLocation: { type: String },
    expectedSalary: { type: String },
    jobType: { type: String },
    bio: { type: String },

    // 3. Education Details
    education: [{
        degree: String,
        institution: String,
        subject: String,
        result: String,
        startDate: String,
        endDate: String
    }],

    // 4. Work Experience
    experience: [{
        company: String,
        position: String,
        // FIX: We must define 'type' like this to avoid Mongoose errors
        type: { type: String }, 
        responsibilities: String,
        startDate: String,
        endDate: String,
        isCurrent: { type: Boolean, default: false }
    }],

    // 5. Skills
    skills: [String], 

    resume: { public_id: String, url: String },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);