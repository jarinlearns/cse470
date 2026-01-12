const mongoose = require('mongoose');

const applicationSchema = mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    jobSeekerId: { type: String, required: true },
    coverLetter: { type: String, required: true },
    expectedJoiningDate: { type: Date },
    expectedSalary: { type: String },
    status: { 
        type: String, 
        enum: ['submitted', 'under_review', 'shortlisted', 'rejected', 'accepted'],
        default: 'submitted'
    },
    appliedAt: { type: Date, default: Date.now }
}, { timestamps: true });

applicationSchema.index({ jobId: 1, jobSeekerId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);