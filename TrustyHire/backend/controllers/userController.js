const User = require('../models/User');

// @desc    Create or Update User Profile (Sync with Clerk)
// @route   POST /api/users/sync
// @access  Public (Called by Frontend after Login)
exports.syncUser = async (req, res) => {
  const { 
    clerkId, 
    email, 
    name, 
    role, 
    // Recruiter specific
    companyName,
    companyWebsite,
    // Job Seeker specific
    bio, 
    skills, 
    gender, 
    dob, 
    phone, 
    address,
    desiredJobTitle,
    preferredCategory,
    preferredLocation,
    expectedSalary,
    jobType,
    education,
    experience
  } = req.body;

  try {
    let user = await User.findOne({ clerkId });

    if (user) {
      // --- UPDATE EXISTING USER ---
      user.name = name || user.name;
      user.email = email || user.email;
      user.role = role || user.role;
      
      // Update Recruiter Fields
      user.companyName = companyName || user.companyName;
      user.companyWebsite = companyWebsite || user.companyWebsite;

      // Update Job Seeker Fields
      user.bio = bio || user.bio;
      user.skills = skills || user.skills;
      user.gender = gender || user.gender;
      user.dob = dob || user.dob;
      user.phone = phone || user.phone;
      user.address = address || user.address;
      user.desiredJobTitle = desiredJobTitle || user.desiredJobTitle;
      user.preferredCategory = preferredCategory || user.preferredCategory;
      user.preferredLocation = preferredLocation || user.preferredLocation;
      user.expectedSalary = expectedSalary || user.expectedSalary;
      user.jobType = jobType || user.jobType;
      
      // For arrays (Education/Experience), we usually overwrite the whole list
      if (education) user.education = education;
      if (experience) user.experience = experience;

      await user.save();
      return res.json(user);

    } else {
      // --- CREATE NEW USER ---
      user = new User({
        clerkId,
        email,
        name,
        role: role || 'job_seeker', // Default to job_seeker if missing
        companyName,
        companyWebsite,
        bio,
        skills,
        gender,
        dob,
        phone,
        address,
        desiredJobTitle,
        preferredCategory,
        preferredLocation,
        expectedSalary,
        jobType,
        education,
        experience
      });
      
      await user.save();
      return res.status(201).json(user);
    }
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get Current User Profile
// @route   GET /api/users/:clerkId
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findOne({ clerkId: req.params.clerkId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};