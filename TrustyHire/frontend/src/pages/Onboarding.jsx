import React, { useState } from 'react';
import axios from 'axios';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const Onboarding = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('job_seeker'); 
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSyncUser = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      
      const payload = {
        clerkId: user.id,
        email: user.primaryEmailAddress.emailAddress,
        name: user.fullName,
        role: role,
        companyName: role === 'recruiter' ? companyName : undefined 
      };

      // Ensure this URL matches your backend port (5000)
      await axios.post('http://localhost:5000/api/users/sync', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (role === 'recruiter') {
        navigate('/recruiter'); // Go to Recruiter Dashboard
      } else {
        navigate('/dashboard');
      }

    } catch (error) {
      console.error("Onboarding failed:", error);
      alert("Something went wrong saving your profile. Check backend console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4">Welcome, {user?.firstName}!</h2>
        <p className="text-gray-600 mb-8">Choose your role to finish setup:</p>

        <div className="flex gap-4 mb-6 justify-center">
          <button
            onClick={() => setRole('job_seeker')}
            className={`px-6 py-3 rounded-lg border-2 ${role === 'job_seeker' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200'}`}
          >
            Job Seeker
          </button>
          <button
            onClick={() => setRole('recruiter')}
            className={`px-6 py-3 rounded-lg border-2 ${role === 'recruiter' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200'}`}
          >
            Recruiter
          </button>
        </div>

        {role === 'recruiter' && (
          <div className="mb-6 text-left">
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Your Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
        )}

        <button
          onClick={handleSyncUser}
          disabled={loading || (role === 'recruiter' && !companyName)}
          className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;