import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

const JobCard = ({ job, savedJobIds, onSaveToggle }) => {
    const { getToken } = useAuth();
    const navigate = useNavigate();
    
    const [isSaved, setIsSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Check if this job is in the saved jobs list
        if (savedJobIds && savedJobIds.includes(job._id)) {
            setIsSaved(true);
        }
    }, [savedJobIds, job._id]);

    const handleSaveToggle = async (e) => {
        e.stopPropagation(); // Prevent card click event
        setIsLoading(true);

        try {
            const token = await getToken();

            if (isSaved) {
                // Unsave the job
                await axios.delete(`/api/saved-jobs/${job._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setIsSaved(false);
            } else {
                // Save the job
                await axios.post('/api/saved-jobs', 
                    { jobId: job._id },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setIsSaved(true);
            }

            // Notify parent component to refresh saved jobs list
            if (onSaveToggle) {
                onSaveToggle();
            }
        } catch (error) {
            console.error('Error toggling save:', error);
            alert(error.response?.data?.message || 'Failed to update saved status');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCardClick = () => {
        navigate(`/jobs/${job._id}`);
    };

    return (
        <div
            onClick={handleCardClick}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer relative"
        >
            {/* Save Button */}
            <button
                onClick={handleSaveToggle}
                disabled={isLoading}
                className={`absolute top-4 right-4 p-2 rounded-full transition-all ${
                    isLoading
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-gray-100'
                }`}
                title={isSaved ? 'Remove from saved' : 'Save job'}
            >
                {isSaved ? (
                    <svg
                        className="w-6 h-6 text-red-500 fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                    >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                ) : (
                    <svg
                        className="w-6 h-6 text-gray-400 hover:text-red-500 transition-colors"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                    </svg>
                )}
            </button>

            {/* Job Content */}
            <div className="pr-12">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                    {job.title}
                </h3>

                <p className="text-gray-600 font-medium mb-3">
                    {job.companyName}
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                        {job.jobType}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                        {job.seniorityLevel}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                        {job.category}
                    </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.location}
                    </span>
                    {job.salary && (
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {job.salary}
                        </span>
                    )}
                </div>

                <p className="text-gray-700 text-sm line-clamp-2">
                    {job.description}
                </p>

                <p className="text-xs text-gray-500 mt-3">
                    Posted {new Date(job.publishedAt || job.createdAt).toLocaleDateString()}
                </p>
            </div>
        </div>
    );
};

export default JobCard;