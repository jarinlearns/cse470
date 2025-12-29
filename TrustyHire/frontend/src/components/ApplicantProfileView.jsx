import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

const ApplicantProfileView = () => {
    const { jobId, applicantId } = useParams();
    const { getToken } = useAuth();
    const navigate = useNavigate();

    const [applicant, setApplicant] = useState(null);
    const [profile, setProfile] = useState(null);
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusUpdating, setStatusUpdating] = useState(false);

    useEffect(() => {
        fetchApplicantProfile();
    }, [jobId, applicantId]);

    const fetchApplicantProfile = async () => {
        try {
            const token = await getToken();
            const response = await axios.get(
                `/api/jobs/${jobId}/applicants/${applicantId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setApplicant(response.data.applicant);
                setProfile(response.data.profile);
                setJob(response.data.job);
            }
        } catch (error) {
            setError('Failed to fetch applicant profile');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (window.confirm(`Are you sure you want to ${newStatus.toLowerCase()} this applicant?`)) {
            setStatusUpdating(true);
            try {
                const token = await getToken();
                await axios.patch(
                    `/api/jobs/${jobId}/applicants/${applicantId}/status`,
                    { status: newStatus },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                // Update local state
                setApplicant(prev => ({ ...prev, status: newStatus }));
                alert(`Applicant status updated to ${newStatus}`);
            } catch (error) {
                alert('Failed to update status');
                console.error(error);
            } finally {
                setStatusUpdating(false);
            }
        }
    };

    const openResume = () => {
        if (profile?.resume?.url) {
            window.open(profile.resume.url, '_blank');
        }
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
                <div className="text-xl">Loading profile...</div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error || 'Profile not found'}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate(`/recruiter/jobs/${jobId}/applicants`)}
                    className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Applicants
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Profile Summary & Actions */}
                <div className="lg:col-span-1">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-6">
                        {/* Profile Picture Placeholder */}
                        <div className="flex justify-center mb-4">
                            <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-4xl font-bold text-blue-600">
                                    {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-center mb-2">{profile.name}</h2>
                        
                        <div className="flex justify-center mb-4">
                            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusBadge(applicant.status)}`}>
                                {applicant.status}
                            </span>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-3 mb-6">
                            <div className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm text-gray-600 break-all">{profile.email}</span>
                            </div>
                            
                            {profile.phone && (
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span className="text-sm text-gray-600">{profile.phone}</span>
                                </div>
                            )}

                            {profile.address && (
                                <div className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="text-sm text-gray-600">{profile.address}</span>
                                </div>
                            )}
                        </div>

                        {/* Resume Button */}
                        {profile.resume?.url && (
                            <button
                                onClick={openResume}
                                className="w-full mb-4 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                View Resume
                            </button>
                        )}

                        {/* Action Buttons */}
                        {applicant.status === 'Pending' && (
                            <div className="space-y-2">
                                <button
                                    onClick={() => handleStatusChange('Accepted')}
                                    disabled={statusUpdating}
                                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                    Accept Applicant
                                </button>
                                <button
                                    onClick={() => handleStatusChange('Rejected')}
                                    disabled={statusUpdating}
                                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                    Reject Applicant
                                </button>
                            </div>
                        )}

                        {/* Application Info */}
                        <div className="mt-6 pt-6 border-t">
                            <h3 className="font-semibold mb-3">Application Details</h3>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="text-gray-600">Applied for:</span>
                                    <p className="font-medium">{job.title}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Applied on:</span>
                                    <p className="font-medium">{new Date(applicant.appliedAt).toLocaleDateString()}</p>
                                </div>
                                {applicant.expectedSalary && (
                                    <div>
                                        <span className="text-gray-600">Expected Salary:</span>
                                        <p className="font-medium">{applicant.expectedSalary}</p>
                                    </div>
                                )}
                                {applicant.expectedJoiningDate && (
                                    <div>
                                        <span className="text-gray-600">Expected Joining:</span>
                                        <p className="font-medium">{applicant.expectedJoiningDate}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Detailed Profile */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Cover Letter */}
                    {applicant.coverLetter && (
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="text-xl font-semibold mb-4">Cover Letter</h3>
                            <p className="text-gray-700 whitespace-pre-wrap">{applicant.coverLetter}</p>
                        </div>
                    )}

                    {/* Bio */}
                    {profile.bio && (
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="text-xl font-semibold mb-4">About</h3>
                            <p className="text-gray-700">{profile.bio}</p>
                        </div>
                    )}

                    {/* Career Information */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-xl font-semibold mb-4">Career Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {profile.desiredJobTitle && (
                                <div>
                                    <span className="text-sm text-gray-600">Desired Job Title</span>
                                    <p className="font-medium">{profile.desiredJobTitle}</p>
                                </div>
                            )}
                            {profile.preferredCategory && (
                                <div>
                                    <span className="text-sm text-gray-600">Preferred Category</span>
                                    <p className="font-medium">{profile.preferredCategory}</p>
                                </div>
                            )}
                            {profile.preferredLocation && (
                                <div>
                                    <span className="text-sm text-gray-600">Preferred Location</span>
                                    <p className="font-medium">{profile.preferredLocation}</p>
                                </div>
                            )}
                            {profile.jobType && (
                                <div>
                                    <span className="text-sm text-gray-600">Job Type</span>
                                    <p className="font-medium">{profile.jobType}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Skills */}
                    {profile.skills && profile.skills.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="text-xl font-semibold mb-4">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Experience */}
                    {profile.experience && profile.experience.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="text-xl font-semibold mb-4">Work Experience</h3>
                            <div className="space-y-6">
                                {profile.experience.map((exp, index) => (
                                    <div key={index} className="border-l-2 border-blue-500 pl-4">
                                        <h4 className="font-semibold text-lg">{exp.position}</h4>
                                        <p className="text-gray-700">{exp.company}</p>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                                            {exp.type && ` • ${exp.type}`}
                                        </p>
                                        {exp.responsibilities && (
                                            <p className="text-gray-700 text-sm">{exp.responsibilities}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {profile.education && profile.education.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="text-xl font-semibold mb-4">Education</h3>
                            <div className="space-y-4">
                                {profile.education.map((edu, index) => (
                                    <div key={index} className="border-l-2 border-green-500 pl-4">
                                        <h4 className="font-semibold">{edu.degree}</h4>
                                        <p className="text-gray-700">{edu.institution}</p>
                                        {edu.subject && (
                                            <p className="text-sm text-gray-600">Subject: {edu.subject}</p>
                                        )}
                                        <p className="text-sm text-gray-600">
                                            {edu.startDate} - {edu.endDate}
                                            {edu.result && ` • ${edu.result}`}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApplicantProfileView;