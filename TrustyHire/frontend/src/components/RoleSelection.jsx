import React from 'react';
import { useAuth, useUser } from "@clerk/clerk-react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Briefcase, Users } from 'lucide-react';

const RoleSelection = () => {
    const { getToken } = useAuth();
    const { user } = useUser();
    const navigate = useNavigate();

    const handleRoleSelect = async (role) => {
        try {
            const token = await getToken();
            
            // We update the user's role in your MongoDB
            await axios.put('http://localhost:5000/api/users/profile', 
                { 
                    role: role,
                    email: user.primaryEmailAddress.emailAddress, // Ensure email is sent
                    name: user.fullName
                }, 
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            // Redirect based on choice
            if (role === 'recruiter') {
                navigate('/recruiter');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            console.error("Error setting role:", error);
            alert("Failed to save role. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black text-gray-900 italic tracking-tight mb-4">Welcome to TrustyHire</h1>
                <p className="text-gray-500 text-lg">How do you plan to use our platform?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                {/* Job Seeker Card */}
                <button 
                    onClick={() => handleRoleSelect('job_seeker')}
                    className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group text-left"
                >
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                        <Briefcase className="text-blue-600 group-hover:text-white" size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">I am a Job Seeker</h3>
                    <p className="text-gray-500 font-medium leading-relaxed">
                        Find your dream job, track applications, and boost your career.
                    </p>
                </button>

                {/* Recruiter Card */}
                <button 
                    onClick={() => handleRoleSelect('recruiter')}
                    className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all group text-left"
                >
                    <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors">
                        <Users className="text-purple-600 group-hover:text-white" size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">I am a Recruiter</h3>
                    <p className="text-gray-500 font-medium leading-relaxed">
                        Post jobs, manage applicants, and find the perfect talent.
                    </p>
                </button>
            </div>
        </div>
    );
};

export default RoleSelection;