import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from "@clerk/clerk-react";
import { ArrowLeft, Check, X, Download, Mail } from 'lucide-react';
import axios from 'axios';

const JobApplicants = () => {
    const { jobId } = useParams();
    const { getToken } = useAuth();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch Job & Applicants
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await getToken();
                // Ensure port matches your backend (5000)
                const res = await axios.get(`http://localhost:5000/api/jobs/recruiter/${jobId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setJob(res.data);
            } catch (error) {
                console.error("Error fetching applicants:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [jobId, getToken]);

    // Handle Accept/Reject
    const handleStatusUpdate = async (applicantId, newStatus) => {
        try {
            const token = await getToken();
            await axios.patch(`http://localhost:5000/api/jobs/recruiter/${jobId}/applicants/${applicantId}`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update UI locally to reflect change instantly
            setJob(prev => ({
                ...prev,
                applicants: prev.applicants.map(app => 
                    app.userId._id === applicantId ? { ...app, status: newStatus } : app
                )
            }));
        } catch (error) {
            alert("Failed to update status");
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Applicants...</div>;
    if (!job) return <div className="p-10 text-center text-red-500">Job not found</div>;

    return (
        <div className="max-w-6xl mx-auto py-12 px-6">
            <Link to="/recruiter" className="text-gray-500 hover:text-gray-900 font-bold text-sm flex items-center gap-2 mb-6">
                <ArrowLeft size={16} /> Back to Dashboard
            </Link>

            <div className="mb-10">
                <h1 className="text-3xl font-black text-gray-900 italic tracking-tight">{job.title}</h1>
                <p className="text-gray-500 font-medium mt-2">Managing {job.applicants.length} Candidates</p>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-6 text-xs font-black uppercase text-gray-500 tracking-widest">Candidate</th>
                            <th className="p-6 text-xs font-black uppercase text-gray-500 tracking-widest">Applied Date</th>
                            <th className="p-6 text-xs font-black uppercase text-gray-500 tracking-widest">Resume</th>
                            <th className="p-6 text-xs font-black uppercase text-gray-500 tracking-widest">Status</th>
                            <th className="p-6 text-xs font-black uppercase text-gray-500 tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {job.applicants.map((app) => (
                            <tr key={app._id} className="hover:bg-blue-50/30 transition">
                                <td className="p-6">
                                    <div className="font-bold text-gray-900">{app.userId?.name || "Unknown User"}</div>
                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                        <Mail size={12}/> {app.userId?.email}
                                    </div>
                                </td>
                                <td className="p-6 text-sm text-gray-600 font-medium">
                                    {new Date(app.appliedAt).toLocaleDateString()}
                                </td>
                                <td className="p-6">
                                    {app.userId?.resume ? (
                                        <a href={app.userId.resume} target="_blank" rel="noreferrer" className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:underline">
                                            <Download size={14}/> PDF
                                        </a>
                                    ) : <span className="text-gray-400 text-sm">No Resume</span>}
                                </td>
                                <td className="p-6">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        app.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                                        app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100 text-gray-600'
                                    }`}>
                                        {app.status}
                                    </span>
                                </td>
                                <td className="p-6 flex gap-2">
                                    <button 
                                        onClick={() => handleStatusUpdate(app.userId._id, 'Accepted')}
                                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition"
                                        title="Accept"
                                    >
                                        <Check size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleStatusUpdate(app.userId._id, 'Rejected')}
                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                                        title="Reject"
                                    >
                                        <X size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {job.applicants.length === 0 && (
                    <div className="p-10 text-center text-gray-400 font-bold text-sm">No applicants yet.</div>
                )}
            </div>
        </div>
    );
};

export default JobApplicants;