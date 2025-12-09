const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // Feature 1: Verification Status
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    
    // Feature 2: Detailed Profile Info
    education: [{
        institution: String,
        degree: String,
        year: String
    }],
    experience: [{
        company: String,
        role: String,
        duration: String
    }],
    
    // Existing Feature 3 (Resume)
    resume: {
        public_id: String,
        url: String
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);