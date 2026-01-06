const Job = require('../models/Job');

// --- 1. POST: Create a New Job ---
exports.createJob = async (req, res) => {
    try {
        console.log("📥 Received Job Data:", req.body);

        const { 
            title, jobTitle, 
            description, jobDescription, 
            category, jobCategory,
            jobType, 
            location, 
            salary,
            companyName
        } = req.body;

        // --- FIX 1: Handle Missing User ID ---
        let userId = req.body.recruiterId || req.body.userId;
        let userEmail = req.body.recruiterEmail || "test@trustyhire.com";

        if (!userId) {
            console.log("⚠️ No User ID found. Using 'DUMMY ID' to allow posting.");
            // THIS IS A VALID 24-CHAR HEX STRING (Required by Mongoose)
            userId = "000000000000000000000000"; 
        }

        // --- FIX 2: Handle Missing Category ---
        const finalCategory = category || jobCategory || "General"; 

        const newJob = new Job({
            title: title || jobTitle,
            description: description || jobDescription,
            category: finalCategory,
            jobType: jobType, 
            location: location,
            salary: salary,
            companyName: companyName || "TrustyHire",
            
            recruiterId: userId,
            recruiterEmail: userEmail,
        });

        const savedJob = await newJob.save();
        console.log("✅ Job Created Successfully:", savedJob._id);
        res.status(201).json(savedJob);

    } catch (error) {
        console.error("❌ CRASH ERROR:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// --- 2. GET: Get All Jobs ---
exports.getJobs = async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 });
        res.status(200).json(jobs);
    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// --- 3. GET: Get Jobs for a Specific Recruiter ---
exports.getRecruiterJobs = async (req, res) => {
    try {
        const recruiterId = req.params.recruiterId || "000000000000000000000000";
        const jobs = await Job.find({ recruiterId: recruiterId }).sort({ createdAt: -1 });
        res.status(200).json(jobs);
    } catch (error) {
        console.error("Error fetching recruiter jobs:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// --- 4. GET: Get Single Job by ID ---
exports.getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found" });
        res.status(200).json(job);
    } catch (error) {
        console.error("Error fetching single job:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};