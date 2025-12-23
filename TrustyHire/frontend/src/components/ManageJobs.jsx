import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

const ManageJobs = () => {
    const { getToken } = useAuth();
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchJobs();
    }, []);

    useEffect(() => {
        filterJobs();
    }, [statusFilter, jobs]);

    const fetchJobs = async () => {
        try {
            const token = await getToken();
            const response = await axios.get('/api/jobs/my-jobs', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setJobs(response.data.jobs);
                setFilteredJobs(response.data.jobs);
            }
        } catch (error) {
            setError('Failed to fetch jobs');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filterJobs = () => {
        if (statusFilter === 'all') {
            setFilteredJobs(jobs);
        } else {
            setFilteredJobs(jobs.filter(job => job.status === statusFilter));
        }
    };

    const handleEdit = (jobId) => {
        navigate(`/recruiter/edit-job/${jobId}`);
    };

    const handleDelete = async (jobId) => {
        if (window.confirm('Are you sure you want to delete this draft?')) {
            try {
                const token = await getToken();
                const response = await axios.delete(`/api/jobs/${jobId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    alert('Draft deleted successfully!');
                    fetchJobs();
                }
            } catch (error) {
                alert(error.response?.data?.message || 'Failed to delete draft');
                console.error(error);
            }
        }
    };

    const handlePublish = async (jobId) => {
        if (window.confirm('Are you sure you want to publish this job?')) {
            try {
                const token = await getToken();
                const response = await axios.patch(`/api/jobs/${jobId}/publish`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    alert('Job published successfully!');
                    fetchJobs();
                }
            } catch (error) {
                alert(error.response?.data?.message || 'Failed to publish job');
                console.error(error);
            }
        }
    };

    const handleClose = async (jobId) => {
        if (window.confirm('Are you sure you want to close this job posting?')) {
            try {
                const token = await getToken();
                const response = await axios.patch(`/api/jobs/${jobId}/close`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    alert('Job closed successfully!');
                    fetchJobs();
                }
            } catch (error) {
                alert(error.response?.data?.message || 'Failed to close job');
                console.error(error);
            }
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            draft: 'bg-yellow-100 text-yellow-800',
            published: 'bg-green-100 text-green-800',
            closed: 'bg-gray-100 text-gray-800'
        };
        return badges[status] || badges.draft;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl">Loading jobs...</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Job Posts</h1>
                <button
                    onClick={() => navigate('/recruiter/create-job')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    + Create New Job
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 border-b">
                <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-4 py-2 font-medium ${
                        statusFilter === 'all'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                    All ({jobs.length})
                </button>
                <button
                    onClick={() => setStatusFilter('draft')}
                    className={`px-4 py-2 font-medium ${
                        statusFilter === 'draft'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                    Drafts ({jobs.filter(j => j.status === 'draft').length})
                </button>
                <button
                    onClick={() => setStatusFilter('published')}
                    className={`px-4 py-2 font-medium ${
                        statusFilter === 'published'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                    Published ({jobs.filter(j => j.status === 'published').length})
                </button>
                <button
                    onClick={() => setStatusFilter('closed')}
                    className={`px-4 py-2 font-medium ${
                        statusFilter === 'closed'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                    Closed ({jobs.filter(j => j.status === 'closed').length})
                </button>
            </div>

            {/* Jobs List */}
            {filteredJobs.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-lg">
                        {statusFilter === 'all' 
                            ? 'No jobs found. Create your first job post!' 
                            : `No ${statusFilter} jobs found.`}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredJobs.map((job) => (
                        <div
                            key={job._id}
                            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-semibold">{job.title}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(job.status)}`}>
                                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                        </span>
                                    </div>
                                    
                                    <p className="text-gray-600 mb-2">{job.companyName}</p>
                                    
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                                        <span>📍 {job.location}</span>
                                        <span>💼 {job.jobType}</span>
                                        <span>📊 {job.seniorityLevel}</span>
                                        {job.applicants && (
                                            <span>👥 {job.applicants.length} Applicants</span>
                                        )}
                                    </div>
                                    
                                    <p className="text-gray-700 text-sm line-clamp-2">
                                        {job.description}
                                    </p>
                                    
                                    <p className="text-xs text-gray-500 mt-2">
                                        Created: {new Date(job.createdAt).toLocaleDateString()}
                                        {job.publishedAt && ` • Published: ${new Date(job.publishedAt).toLocaleDateString()}`}
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-2 ml-4">
                                    {job.status === 'draft' && (
                                        <>
                                            <button
                                                onClick={() => handleEdit(job._id)}
                                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handlePublish(job._id)}
                                                className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                            >
                                                Publish
                                            </button>
                                            <button
                                                onClick={() => handleDelete(job._id)}
                                                className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}

                                    {job.status === 'published' && (
                                        <>
                                            <button
                                                onClick={() => navigate(`/recruiter/job/${job._id}/applicants`)}
                                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                            >
                                                View Applicants
                                            </button>
                                            <button
                                                onClick={() => handleClose(job._id)}
                                                className="px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                                            >
                                                Close Job
                                            </button>
                                        </>
                                    )}

                                    {job.status === 'closed' && (
                                        <button
                                            onClick={() => navigate(`/recruiter/job/${job._id}/applicants`)}
                                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                        >
                                            View Details
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageJobs;