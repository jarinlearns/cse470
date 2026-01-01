import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import JobCard from './JobCard';

const SavedJobsPage = () => {
    const { getToken } = useAuth();
    const navigate = useNavigate();

    const [savedJobs, setSavedJobs] = useState([]);
    const [savedJobIds, setSavedJobIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSavedJobs();
    }, []);

    const fetchSavedJobs = async () => {
        try {
            const token = await getToken();
            const response = await axios.get('/api/saved-jobs', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setSavedJobs(response.data.savedJobs);
                // Extract job IDs for the JobCard component
                const ids = response.data.savedJobs.map(saved => saved.jobId._id);
                setSavedJobIds(ids);
            }
        } catch (error) {
            setError('Failed to fetch saved jobs');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveToggle = () => {
        // Refresh the saved jobs list when a job is unsaved
        fetchSavedJobs();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl">Loading saved jobs...</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Saved Jobs</h1>
                <button
                    onClick={() => navigate('/jobs')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Browse Jobs
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {savedJobs.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <svg
                        className="w-24 h-24 mx-auto text-gray-400 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                    </svg>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                        No saved jobs yet
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Start saving jobs to keep track of opportunities you're interested in
                    </p>
                    <button
                        onClick={() => navigate('/jobs')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Browse Jobs
                    </button>
                </div>
            ) : (
                <>
                    <p className="text-gray-600 mb-6">
                        You have {savedJobs.length} saved {savedJobs.length === 1 ? 'job' : 'jobs'}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {savedJobs.map((savedJob) => (
                            <JobCard
                                key={savedJob._id}
                                job={savedJob.jobId}
                                savedJobIds={savedJobIds}
                                onSaveToggle={handleSaveToggle}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default SavedJobsPage;