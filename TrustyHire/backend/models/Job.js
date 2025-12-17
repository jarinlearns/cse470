const mongoose = require('mongoose');

const jobSchema = mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true }, // e.g. "Remote", "Dhaka", "New York"
    category: { type: String, required: true }, // e.g. "Engineering", "Design"
    type: { type: String, required: true },     // e.g. "Full-time", "Part-time"
    salary: { type: String },
    description: { type: String },
    postedBy: { type: String }, // Clerk ID of the recruiter (optional for now)
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);