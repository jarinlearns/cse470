import { useState } from 'react';
import axios from 'axios';

const ProfileUpdate = () => {
    // 1. STATE VARIABLES
    const [name, setName] = useState(''); 
    const [email, setEmail] = useState('');
    const [resume, setResume] = useState(null);
    // New State for Education (Feature 2)
    const [education, setEducation] = useState({ institution: '', degree: '', year: '' });
    const [status, setStatus] = useState('');

    // Handle file selection
    const handleFileChange = (e) => {
        setResume(e.target.files[0]);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        
        // NEW: Convert the education object to a string so backend can read it
        formData.append('education', JSON.stringify([education])); 
        
        if (resume) {
            formData.append('resume', resume);
        }

        try {
            // Retrieve token from storage (created during login/register)
            const token = localStorage.getItem('userInfo') 
                ? JSON.parse(localStorage.getItem('userInfo')).token 
                : '';

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            };

            const { data } = await axios.put('http://localhost:5000/api/users/profile', formData, config);
            setStatus('Profile Updated Successfully ✅');
            console.log(data);
        } catch (error) {
            setStatus('Error: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Update Profile</h2>
            {status && <p className="mb-4 text-center font-semibold text-blue-600">{status}</p>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Input */}
                <div>
                    <label className="block text-gray-700">Full Name</label>
                    <input 
                        type="text" 
                        className="w-full p-2 border rounded mt-1"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter new name"
                    />
                </div>

                {/* Email Input */}
                <div>
                    <label className="block text-gray-700">Email Address</label>
                    <input 
                        type="email" 
                        className="w-full p-2 border rounded mt-1"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter new email"
                    />
                </div>

                {/* NEW: Education Section (Feature 2) */}
                <div className="border-t pt-4 mt-4 bg-gray-50 p-3 rounded">
                    <h3 className="font-bold mb-2 text-gray-700">Education Details</h3>
                    <div className="space-y-2">
                        <input 
                            placeholder="University / Institution"
                            className="w-full p-2 border rounded"
                            value={education.institution}
                            onChange={(e) => setEducation({...education, institution: e.target.value})}
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <input 
                                placeholder="Degree (e.g. BSc)"
                                className="p-2 border rounded"
                                value={education.degree}
                                onChange={(e) => setEducation({...education, degree: e.target.value})}
                            />
                            <input 
                                placeholder="Year (e.g. 2025)"
                                className="p-2 border rounded"
                                value={education.year}
                                onChange={(e) => setEducation({...education, year: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                {/* Resume Input */}
                <div>
                    <label className="block text-gray-700 mt-4">Update Resume (PDF)</label>
                    <input 
                        type="file" 
                        accept="application/pdf"
                        className="w-full mt-1"
                        onChange={handleFileChange}
                    />
                </div>

                {/* Submit Button */}
                <button 
                    type="submit" 
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
                >
                    Save Changes
                </button>
            </form>
        </div>
    );
};

export default ProfileUpdate;