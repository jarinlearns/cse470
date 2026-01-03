import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { Bookmark, Send, Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react'; // Modern icons
import JobCard from './JobCard';

const JobSeekerDashboard = () => {
    const { getToken } = useAuth();
    const navigate = useNavigate();

    const [data, setData] = useState({
        savedJobs: [],
        savedJobIds: [],
        recentJobs: [],
        appliedJobs: [],
        stats: { totalSaved: 0, totalApplied: 0, pending: 0, accepted: 0, rejected: 0 }
    });
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        try {
            const token = await getToken();
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Fetch all data in parallel for speed
            const [savedRes, recentRes, appliedRes] = await Promise.all([
                axios.get('/api/saved-jobs', config),
                axios.get('/api/jobs/published?limit=4', config),
                axios.get('/api/applications/my-applications', config)
            ]);

            const applications = appliedRes.data.applications || [];
            
            setData({
                savedJobs: savedRes.data.savedJobs?.slice(0, 4) || [],
                savedJobIds: savedRes.data.savedJobs?.map(s => s.jobId._id) || [],
                recentJobs: recentRes.data.jobs || [],
                appliedJobs: applications.slice(0, 5),
                stats: {
                    totalSaved: savedRes.data.savedJobs?.length || 0,
                    totalApplied: applications.length,
                    pending: applications.filter(a => a.status === 'Pending').length,
                    accepted: applications.filter(a => a.status === 'Accepted').length,
                    rejected: applications.filter(a => a.status === 'Rejected').length
                }
            });
        } catch (error) {
            console.error('Dashboard Fetch Error:', error);
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const statConfig = [
        { label: 'Saved', value: data.stats.totalSaved, color: 'blue', icon: Bookmark },
        { label: 'Applied', value: data.stats.totalApplied, color: 'purple', icon: Send },
        { label: 'Pending', value: data.stats.pending, color: 'yellow', icon: Clock },
        { label: 'Accepted', value: data.stats.accepted, color: 'green', icon: CheckCircle },
        { label: 'Rejected', value: data.stats.rejected, color: 'red', icon: XCircle },
    ];

    if (loading) return <DashboardSkeleton />;

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-10">
            {/* Header */}
            <header>
                <h1 className="text-3xl font-bold text-slate-900">Welcome back!</h1>
                <p className="text-slate-500">Here's your job search overview for today.</p>
            </header>

            {/* Stats Cards - Refactored for DRYness */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {statConfig.map((stat) => (
                    <div key={stat.label} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
                                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                            </div>
                            <div className={`bg-${stat.color}-50 p-2 rounded-lg`}>
                                <stat.icon size={20} className={`text-${stat.color}-600`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Grid Layout for Jobs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Saved Jobs */}
                <Section 
                    title="Saved Jobs" 
                    onViewAll={() => navigate('/saved-jobs')}
                    isEmpty={data.savedJobs.length === 0}
                >
                    <div className="grid gap-4">
                        {data.savedJobs.map(sj => (
                            <JobCard key={sj._id} job={sj.jobId} savedJobIds={data.savedJobIds} onSaveToggle={fetchDashboardData} />
                        ))}
                    </div>
                </Section>

                {/* Recent Postings */}
                <Section 
                    title="Latest Postings" 
                    onViewAll={() => navigate('/jobs')}
                    isEmpty={data.recentJobs.length === 0}
                >
                    <div className="grid gap-4">
                        {data.recentJobs.map(job => (
                            <JobCard key={job._id} job={job} savedJobIds={data.savedJobIds} onSaveToggle={fetchDashboardData} />
                        ))}
                    </div>
                </Section>
            </div>

            {/* Application Table */}
            <Section title="Recent Applications" onViewAll={() => navigate('/my-applications')} isEmpty={data.appliedJobs.length === 0}>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Role</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.appliedJobs.map((app) => (
                                <tr key={app._id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                                    <td className="px-6 py-4 text-sm">
                                        <div className="font-semibold text-slate-800">{app.jobId?.title}</div>
                                        <div className="text-slate-500">{app.jobId?.companyName}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={app.status} />
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 text-right">
                                        {new Date(app.appliedAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Section>
        </div>
    );
};

// Reusable UI Components to keep the main dashboard clean
const Section = ({ title, children, onViewAll, isEmpty }) => (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
            <button onClick={onViewAll} className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold flex items-center gap-1">
                View All <ChevronRight size={14} />
            </button>
        </div>
        {isEmpty ? <div className="p-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-500">Nothing to show yet.</div> : children}
    </div>
);

const StatusBadge = ({ status }) => {
    const styles = {
        Pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        Accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        Rejected: 'bg-rose-50 text-rose-700 border-rose-200'
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${styles[status] || styles.Pending}`}>
            {status}
        </span>
    );
};

const DashboardSkeleton = () => (
    <div className="max-w-7xl mx-auto p-6 animate-pulse space-y-8">
        <div className="h-10 bg-slate-200 rounded w-1/4"></div>
        <div className="grid grid-cols-5 gap-4">
            {[1,2,3,4,5].map(i => <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>)}
        </div>
        <div className="grid grid-cols-2 gap-8">
            <div className="h-64 bg-slate-200 rounded-xl"></div>
            <div className="h-64 bg-slate-200 rounded-xl"></div>
        </div>
    </div>
);

export default JobSeekerDashboard;