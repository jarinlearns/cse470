import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import JobCard from './JobCard';

const JobSeekerDashboard = () => {
    const { getToken, userId } = useAuth();
    const navigate = useNavigate();

    const [savedJobs, setSavedJobs] = useState([]);
    const [savedJobIds, setSavedJobIds] = useState([]);
    const [recentJobs, setRecentJobs] = useState([]);
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalSaved: 0,
        totalApplied: 0,
        pending: 0,
        accepted: 0,
        rejected: 0
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = await getToken();

            // Fetch saved jobs
            const savedResponse = await axios.get('/api/saved-jobs', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (savedResponse.data.success) {
                const saved = savedResponse.data.savedJobs.slice(0, 4); // Get first 4
                setSavedJobs(saved);
                const ids = savedResponse.data.savedJobs.map(s => s.jobId._id);
                setSavedJobIds(ids);

                setStats(prev => ({
                    ...prev,
                    totalSaved: savedResponse.data.savedJobs.length
                }));
            }

            // Fetch recent published jobs (latest 4)
            const jobsResponse = await axios.get('/api/jobs/published?limit=4', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (jobsResponse.data.success) {
                setRecentJobs(jobsResponse.data.jobs);
            }

            // Fetch applied jobs (you'll need to create this endpoint)
            const appliedResponse = await axios.get('/api/applications/my-applications', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (appliedResponse.data.success) {
                setAppliedJobs(appliedResponse.data.applications.slice(0, 5)); // Latest 5
                
                // Calculate stats
                const applications = appliedResponse.data.applications;
                setStats(prev => ({
                    ...prev,
                    totalApplied: applications.length,
                    pending: applications.filter(a => a.status === 'Pending').length,
                    accepted: applications.filter(a => a.status === 'Accepted').length,
                    rejected: applications.filter(a => a.status === 'Rejected').length
                }));
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveToggle = () => {
        fetchDashboardData();
    };

    const getStatusColor = (status) => {
        const colors = {
            Pending: 'bg-yellow-100 text-yellow-800',
            Accepted: 'bg-green-100 text-green-800',
            Rejected: 'bg-red-100 text-red-800'
        };
        return colors[status] || colors.Pending;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
                <p className="text-gray-600">Here's your job search overview</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Saved Jobs</p>
                            <p className="text-2xl font-bold">{stats.totalSaved}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Applied</p>
                            <p className="text-2xl font-bold">{stats.totalApplied}</p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-full">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Pending</p>
                            <p className="text-2xl font-bold">{stats.pending}</p>
                        </div>
                        <div className="bg-yellow-100 p-3 rounded-full">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Accepted</p>
                            <p className="text-2xl font-bold">{stats.accepted}</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Rejected</p>
                            <p className="text-2xl font-bold">{stats.rejected}</p>
                        </div>
                        <div className="bg-red-100 p-3 rounded-full">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Saved Jobs Section */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Saved Jobs</h2>
                    {savedJobs.length > 0 && (
                        <button
                            onClick={() => navigate('/saved-jobs')}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            View All →
                        </button>
                    )}
                </div>

                {savedJobs.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <p className="text-gray-600 mb-4">No saved jobs yet</p>
                        <button
                            onClick={() => navigate('/jobs')}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Browse Jobs
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {savedJobs.map((savedJob) => (
                            <JobCard
                                key={savedJob._id}
                                job={savedJob.jobId}
                                savedJobIds={savedJobIds}
                                onSaveToggle={handleSaveToggle}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Jobs Section */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Latest Job Postings</h2>
                    <button
                        onClick={() => navigate('/jobs')}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        View All →
                    </button>
                </div>

                {recentJobs.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <p className="text-gray-600">No recent jobs available</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recentJobs.map((job) => (
                            <JobCard
                                key={job._id}
                                job={job}
                                savedJobIds={savedJobIds}
                                onSaveToggle={handleSaveToggle}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Applied Jobs Section */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Recent Applications</h2>
                    {appliedJobs.length > 0 && (
                        <button
                            onClick={() => navigate('/my-applications')}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            View All →
                        </button>
                    )}
                </div>

                {appliedJobs.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <p className="text-gray-600 mb-4">You haven't applied to any jobs yet</p>
                        <button
                            onClick={() => navigate('/jobs')}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Start Applying
                        </button>
                    </div>
                ) : (
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {appliedJobs.map((application) => (
                                    <tr key={application._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {application.jobId?.title || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {application.jobId?.companyName || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(application.appliedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                                {application.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobSeekerDashboard;