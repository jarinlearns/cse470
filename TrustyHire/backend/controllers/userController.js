// 👇 THIS WAS MISSING
const User = require('../models/User'); 

exports.syncUser = async (req, res) => {
  try {
    console.log("📥 Sync User Body:", req.body);

    const { 
      clerkId, 
      email, 
      name, 
      role, 
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
    } = req.body;

    if (!clerkId || !email) {
      return res.status(400).json({ message: "Clerk ID and Email are required" });
    }

    // Check if user exists by Clerk ID OR by Email
    let user = await User.findOne({ 
        $or: [{ clerkId: clerkId }, { email: email }] 
    });

    if (user) {
      // --- UPDATE EXISTING USER ---
      console.log(`🔄 Found existing user (ID: ${user._id}). Updating...`);
      
      user.clerkId = clerkId; // Ensure Clerk ID is linked
      user.name = name || user.name;
      user.email = email || user.email;
      user.role = role || user.role;
      
      // Update Recruiter Fields
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
      
      if (education) user.education = education;
      if (experience) user.experience = experience;

      await user.save();
      console.log("✅ User Updated Successfully!");
      return res.json(user);

    } else {
      // --- CREATE NEW USER ---
      console.log(`🆕 Creating brand new user: ${email}`);

      user = new User({
        clerkId,
        email,
        name,
        role: role || 'job_seeker',
        companyName: companyName || "",
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
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get Current User Profile
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