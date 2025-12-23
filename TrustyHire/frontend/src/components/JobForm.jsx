import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

const JobForm = ({ mode = 'create' }) => {
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        responsibilities: '',
        requirements: '',
        category: '',
        jobType: '',
        location: '',
        salary: '',
        seniorityLevel: 'Intermediate',
        companyName: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isEditMode, setIsEditMode] = useState(mode === 'edit');

    // Fetch job data if editing
    useEffect(() => {
        if (isEditMode && id) {
            fetchJobData();
        }
    }, [id, isEditMode]);

    const fetchJobData = async () => {
        try {
            const token = await getToken();
            const response = await axios.get(`/api/jobs/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success) {
                setFormData(response.data.job);
            }
        } catch (error) {
            setError('Failed to fetch job data');
            console.error(error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e, saveType = 'draft') => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = await getToken();
            let response;

            if (isEditMode) {
                // Update existing draft
                response = await axios.put(`/api/jobs/${id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                // Create new draft
                response = await axios.post('/api/jobs/draft', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            if (response.data.success) {
                // If publishing, make additional API call
                if (saveType === 'publish') {
                    const jobId = isEditMode ? id : response.data.job._id;
                    await axios.patch(`/api/jobs/${jobId}/publish`, {}, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    alert('Job published successfully!');
                } else {
                    alert(isEditMode ? 'Draft updated successfully!' : 'Draft saved successfully!');
                }
                
                navigate('/recruiter/my-jobs');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to save job post');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (isEditMode && window.confirm('Are you sure you want to cancel and delete this draft?')) {
            try {
                const token = await getToken();
                await axios.delete(`/api/jobs/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Draft deleted successfully!');
                navigate('/recruiter/my-jobs');
            } catch (error) {
                setError('Failed to delete draft');
                console.error(error);
            }
        } else {
            navigate('/recruiter/my-jobs');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">
                {isEditMode ? 'Edit Job Post' : 'Create New Job Post'}
            </h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={(e) => handleSubmit(e, 'draft')}>
                {/* Company Name */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                        Company Name *
                    </label>
                    <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter company name"
                    />
                </div>

                {/* Job Title */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                        Job Title *
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Senior Software Engineer"
                    />
                </div>

                {/* Description */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                        Job Description *
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Describe the role and what you're looking for..."
                    />
                </div>

                {/* Responsibilities */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                        Responsibilities
                    </label>
                    <textarea
                        name="responsibilities"
                        value={formData.responsibilities}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="List key responsibilities..."
                    />
                </div>

                {/* Requirements */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                        Requirements
                    </label>
                    <textarea
                        name="requirements"
                        value={formData.requirements}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="List qualifications and skills required..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Category */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            Category *
                        </label>
                        <input
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., IT, Marketing, Sales"
                        />
                    </div>

                    {/* Job Type */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            Job Type *
                        </label>
                        <select
                            name="jobType"
                            value={formData.jobType}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select job type</option>
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                            <option value="Internship">Internship</option>
                            <option value="Freelance">Freelance</option>
                        </select>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            Location *
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., New York, Remote"
                        />
                    </div>

                    {/* Salary */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            Salary Range
                        </label>
                        <input
                            type="text"
                            name="salary"
                            value={formData.salary}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., $80,000 - $120,000"
                        />
                    </div>

                    {/* Seniority Level */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            Seniority Level *
                        </label>
                        <select
                            name="seniorityLevel"
                            value={formData.seniorityLevel}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Expert">Expert</option>
                        </select>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Saving...' : 'Save as Draft'}
                    </button>

                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e, 'publish')}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Publishing...' : 'Publish Job'}
                    </button>

                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={loading}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default JobForm;