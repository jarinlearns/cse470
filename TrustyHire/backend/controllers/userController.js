const User = require('../models/User');

// @desc    Create or Update User Profile (Sync with Clerk)
// @route   POST /api/users/sync
// @access  Public (Called by Frontend after Login)
exports.syncUser = async (req, res) => {
  try {
    // 1. Log what the frontend is sending (Check your terminal for this!)
    console.log("📥 Sync User Body:", req.body);

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

    // 2. CRITICAL SAFETY CHECK: Cannot save without Clerk ID or Email
    if (!clerkId || !email) {
      console.error("❌ Error: Missing Clerk ID or Email in request.");
      return res.status(400).json({ message: "Clerk ID and Email are required" });
    }

    let user = await User.findOne({ clerkId });

    if (user) {
      // --- UPDATE EXISTING USER ---
      console.log(`🔄 Updating existing user: ${email}`);
      
      user.name = name || user.name;
      user.email = email || user.email;
      user.role = role || user.role;
      
      // Update Recruiter Fields (only if provided)
      if (companyName) user.companyName = companyName;
      if (companyWebsite) user.companyWebsite = companyWebsite;

      // Update Job Seeker Fields
      if (bio) user.bio = bio;
      if (skills) user.skills = skills;
      if (gender) user.gender = gender;
      if (dob) user.dob = dob;
      if (phone) user.phone = phone;
      if (address) user.address = address;
      if (desiredJobTitle) user.desiredJobTitle = desiredJobTitle;
      if (preferredCategory) user.preferredCategory = preferredCategory;
      if (preferredLocation) user.preferredLocation = preferredLocation;
      if (expectedSalary) user.expectedSalary = expectedSalary;
      if (jobType) user.jobType = jobType;
      
      // For arrays, we overwrite if new data is sent
      if (education) user.education = education;
      if (experience) user.experience = experience;

      await user.save();
      console.log("✅ User Updated!");
      return res.json(user);

    } else {
      // --- CREATE NEW USER ---
      console.log(`🆕 Creating new user: ${email}`);

      user = new User({
        clerkId,
        email,
        name,
        role: role || 'job_seeker', // Default role
        companyName: companyName || "", // Prevent undefined
        companyWebsite: companyWebsite || "",
        bio: bio || "",
        skills: skills || [],
        gender: gender || "",
        dob: dob,
        phone: phone || "",
        address: address || "",
        desiredJobTitle: desiredJobTitle || "",
        preferredCategory: preferredCategory || "",
        preferredLocation: preferredLocation || "",
        expectedSalary: expectedSalary || "",
        jobType: jobType || "",
        education: education || [],
        experience: experience || []
      });
      
      await user.save();
      console.log("✅ New User Created!");
      return res.status(201).json(user);
    }
  } catch (error) {
    console.error('❌ Error syncing user:', error);
    // Return the actual error message so you can see it in the frontend console
    res.status(500).json({ message: 'Server Error', error: error.message });
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