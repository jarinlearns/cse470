import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

const ApplicantsList = () => {
    const { jobId } = useParams();
    const { getToken } = useAuth();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [filteredApplicants, setFilteredApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        accepted: 0,
        rejected: 0
    });

    useEffect(() => {
        fetchApplicants();
    }, [jobId]);

    useEffect(() => {
        filterApplicants();
    }, [statusFilter, applicants]);

    const fetchApplicants = async () => {
        try {
            const token = await getToken();
            const response = await axios.get(`/api/jobs/${jobId}/applicants`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setJob(response.data.job);
                setApplicants(response.data.applicants);
                setFilteredApplicants(response.data.applicants);
                
                // Calculate stats
                const apps = response.data.applicants;
                setStats({
                    total: apps.length,
                    pending: apps.filter(a => a.status === 'Pending').length,
                    accepted: apps.filter(a => a.status === 'Accepted').length,
                    rejected: apps.filter(a => a.status === 'Rejected').length
                });
            }
        } catch (error) {
            setError('Failed to fetch applicants');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filterApplicants = () => {
        if (statusFilter === 'all') {
            setFilteredApplicants(applicants);
        } else {
            setFilteredApplicants(applicants.filter(app => app.status === statusFilter));
        }
    };

    const handleStatusChange = async (applicantId, newStatus) => {
        if (window.confirm(`Are you sure you want to ${newStatus.toLowerCase()} this applicant?`)) {
            try {
                const token = await getToken();
                await axios.patch(
                    `/api/jobs/${jobId}/applicants/${applicantId}/status`,
                    { status: newStatus },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                // Refresh applicants list
                fetchApplicants();
                alert(`Applicant status updated to ${newStatus}`);
            } catch (error) {
                alert('Failed to update status');
                console.error(error);
            }
        }
    };

    const viewProfile = (applicantId) => {
        navigate(`/recruiter/jobs/${jobId}/applicants/${applicantId}`);
    };

    const getStatusBadge = (status) => {
        const badges = {
            Pending: 'bg-yellow-100 text-yellow-800',
            Accepted: 'bg-green-100 text-green-800',
            Rejected: 'bg-red-100 text-red-800'
        };
        return badges[status] || badges.Pending;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl">Loading applicants...</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/recruiter/my-jobs')}
                    className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Jobs
                </button>
                
                {job && (
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                        <p className="text-gray-600">{job.companyName}</p>
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Total Applicants</p>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
                    All ({stats.total})
                </button>
                <button
                    onClick={() => setStatusFilter('Pending')}
                    className={`px-4 py-2 font-medium ${
                        statusFilter === 'Pending'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                    Pending ({stats.pending})
                </button>
                <button
                    onClick={() => setStatusFilter('Accepted')}
                    className={`px-4 py-2 font-medium ${
                        statusFilter === 'Accepted'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                    Accepted ({stats.accepted})
                </button>
                <button
                    onClick={() => setStatusFilter('Rejected')}
                    className={`px-4 py-2 font-medium ${
                        statusFilter === 'Rejected'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                    Rejected ({stats.rejected})
                </button>
            </div>

            {/* Applicants Table */}
            {filteredApplicants.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-lg">
                        {statusFilter === 'all' 
                            ? 'No applicants yet' 
                            : `No ${statusFilter.toLowerCase()} applicants`}
                    </p>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected Salary</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredApplicants.map((applicant) => (
                                <tr key={applicant._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {applicant.userDetails?.name || 'N/A'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {applicant.userDetails?.email || ''}
                                            </div>
                                            {applicant.userDetails?.phone && (
                                                <div className="text-sm text-gray-500">
                                                    {applicant.userDetails.phone}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(applicant.appliedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {applicant.expectedSalary || 'Not specified'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(applicant.status)}`}>
                                            {applicant.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => viewProfile(applicant._id)}
                                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                            >
                                                View Profile
                                            </button>
                                            {applicant.status === 'Pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusChange(applicant._id, 'Accepted')}
                                                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(applicant._id, 'Rejected')}
                                                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ApplicantsList;