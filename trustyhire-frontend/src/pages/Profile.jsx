import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddExperience from '../components/AddExperience'; // NEW IMPORT
import AddEducation from '../components/AddEducation';

const Profile = () => {
    const [profileData, setProfileData] = useState({
        status: 'Open to work', 
        bio: '', 
        location: '', 
        website: '', 
        githubusername: '',
        experience: [], // Initialize as an empty array
        education: []    // Initialize as an empty array
    });
    // Loading / error state used by form submit and data fetching
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // --- Experience Array Management ---

    const handleAddExperience = () => {
        setProfileData({ 
            ...profileData, 
            experience: [
                ...profileData.experience, 
                { title: '', company: '', from: '', current: false, description: '' }
            ]
        });
    };

    const handleRemoveExperience = (index) => {
        const newExperience = profileData.experience.filter((_, i) => i !== index);
        setProfileData({ ...profileData, experience: newExperience });
    };

    const handleExperienceChange = (index, e) => {
        const { name, value, type, checked } = e.target;
        const newExperience = profileData.experience.map((exp, i) => {
            if (i === index) {
                // Handle checkbox specially
                if (name === 'current' && type === 'checkbox') {
                    // If marked current, clear the 'to' date
                    return { ...exp, current: checked, to: checked ? '' : exp.to }; 
                }
                return { ...exp, [name]: value };
            }
            return exp;
        });
        setProfileData({ ...profileData, experience: newExperience });
    };
    // trustyhire-frontend/src/pages/Profile.jsx (Inside the Profile component)

// ... Experience Array Management Functions ...

// --- Education Array Management ---

const handleAddEducation = () => {
    setProfileData({ 
        ...profileData, 
        education: [
            ...profileData.education, 
            { school: '', degree: '', fieldofstudy: '', from: '', description: '' }
        ]
    });
};

const handleRemoveEducation = (index) => {
    const newEducation = profileData.education.filter((_, i) => i !== index);
    setProfileData({ ...profileData, education: newEducation });
};

const handleEducationChange = (index, e) => {
    const { name, value } = e.target;
    const newEducation = profileData.education.map((edu, i) => {
        if (i === index) {
            return { ...edu, [name]: value };
        }
        return edu;
    });
    setProfileData({ ...profileData, education: newEducation });
};

// ... handleLogout function ...

// ... JSX rendering starts here ...
    // --- Integration in handleSubmit ---

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // Note: The backend profileController is already set up to receive the experience array!
            await axios.post('http://localhost:5000/api/profile', profileData);
            alert('Profile saved successfully!');
        } catch (err) {
            console.error('Failed to save profile', err);
            setError(err?.response?.data?.message || err.message || 'Failed to save profile');
            // Provide a visible notification for now
            alert('Failed to save profile: ' + (err?.response?.data?.message || err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    // ... handleLogout function ...

    // --- Integration in JSX Return ---
    
    return (
        <div className="container mx-auto p-4 max-w-4xl">
            {/* ... Header and Basic Details form fields ... */}

            <form onSubmit={handleSubmit}>
                {/* ... Basic Details and Links ... */}
                
                {/* EXPERIENCE SECTION */}
                <h3 className="text-2xl font-semibold mt-8 mb-4 border-b pb-2 text-gray-800">Work Experience</h3>
                
                {profileData.experience.map((exp, index) => (
                    <AddExperience
                        key={index}
                        experience={exp}
                        index={index}
                        handleChange={handleExperienceChange}
                        handleRemove={handleRemoveExperience}
                    />
                ))}


                <button
                    type="button"
                    onClick={handleAddExperience}
                    className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 transition mb-6"
                >
                    + Add New Experience
                </button>
                {profileData.education.map((edu, index) => (
                    <AddEducation
                        key={index}
                        education={edu}
                        index={index}
                        handleChange={handleEducationChange}
                        handleRemove={handleRemoveEducation}
                    />
                ))}

                {/* NOTE: You would repeat this structure for Education next */}

                <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition mt-4">
                    Save and Update Profile
                </button>
            </form>
        </div>
    );
};

export default Profile;