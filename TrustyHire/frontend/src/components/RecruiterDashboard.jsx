import React, { useState, useEffect } from 'react';
import { useAuth } from "@clerk/clerk-react";
import { Link, useNavigate } from 'react-router-dom'; // 1. Added useNavigate
import { Briefcase, Users, Eye } from 'lucide-react';
import axios from 'axios';

const RecruiterDashboard = () => {
    const { getToken } = useAuth();
    const navigate = useNavigate(); // 2. Initialize the hook
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const token = await getToken();
                // MAKE SURE PORT IS CORRECT (5000 or 8000)
                const res = await axios.get('http://localhost:5000/api/jobs/recruiter/my-jobs', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setJobs(res.data);
            } catch (error) {
                console.error("Error fetching jobs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, [getToken]);

    if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

    return (
        <div className="max-w-6xl mx-auto py-12 px-6">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-gray-900 italic tracking-tight">Recruiter Dashboard</h2>
                
                {/* 3. ADDED onClick HERE 👇 */}
                <button 
                    onClick={() => navigate('/post-job')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-blue-700 transition"
                >
                    + Post New Job
                </button>
            </div>

            <div className="grid gap-6">
                {jobs.map((job) => (
                    <div key={job._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center hover:shadow-md transition">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                            <div className="flex gap-4 mt-2 text-sm text-gray-500 font-medium">
                                <span className={`px-3 py-1 rounded-full text-xs ${
                                    job.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {job.status ? job.status.toUpperCase() : 'ACTIVE'}
                                </span>
                                <span className="flex items-center gap-1"><Eye size={16}/> {job.views || 0} Views</span>
                                <span className="flex items-center gap-1"><Users size={16}/> {job.applicants?.length || 0} Applicants</span>
                            </div>
                        </div>
                        
                        <div className="flex gap-3">
                            <Link 
                                to={`/recruiter/job/${job._id}`}
                                className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition flex items-center gap-2"
                            >
                                <Users size={16} /> Manage Applicants
                            </Link>
                        </div>
                    </div>
                ))}

                {jobs.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                        <Briefcase className="mx-auto text-gray-300 mb-4" size={48} />
                        <p className="text-gray-500 font-bold">You haven't posted any jobs yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecruiterDashboard;