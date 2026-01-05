import React from 'react';

const AppliedJobsTable = () => {
    const appliedJobs = [
        { id: 1, company: "Amazon", logo: "https://logo.clearbit.com/amazon.com", title: "Full Stack Developer", location: "Bangalore", date: "Aug 22, 2024", status: "Pending" },
        { id: 2, company: "Meta", logo: "https://logo.clearbit.com/meta.com", title: "Data Scientist", location: "San Francisco", date: "Aug 22, 2024", status: "Rejected" },
        { id: 3, company: "Google", logo: "https://logo.clearbit.com/google.com", title: "Marketing Manager", location: "London", date: "Sep 25, 2024", status: "Accepted" },
        { id: 4, company: "Qualcomm", logo: "https://logo.clearbit.com/qualcomm.com", title: "UI/UX Designer", location: "Dubai", date: "Oct 15, 2024", status: "Pending" },
        { id: 5, company: "Microsoft", logo: "https://logo.clearbit.com/microsoft.com", title: "Full Stack Developer", location: "Hyderabad", date: "Sep 25, 2024", status: "Accepted" },
    ];

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Accepted': return 'bg-green-100 text-green-600 border-green-200';
            case 'Rejected': return 'bg-red-100 text-red-600 border-red-200';
            default: return 'bg-blue-100 text-blue-600 border-blue-200';
        }
    }

    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">Jobs Applied</h2>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-gray-400 font-bold text-sm uppercase tracking-wider">
                            <th className="px-6 py-4">Company</th>
                            <th className="px-6 py-4">Job Title</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {appliedJobs.map((job) => (
                            <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <img src={job.logo} alt={job.company} className="w-8 h-8 rounded-lg object-contain border border-gray-100 p-1" />
                                    <span className="font-semibold text-gray-700">{job.company}</span>
                                </td>
                                <td className="px-6 py-4 text-gray-600 font-medium">{job.title}</td>
                                <td className="px-6 py-4 text-gray-500">{job.location}</td>
                                <td className="px-6 py-4 text-gray-500">{job.date}</td>
                                <td className="px-6 py-4 text-right">
                                    <span className={`px-4 py-1.5 rounded-lg text-xs font-bold border ${getStatusStyle(job.status)}`}>
                                        {job.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AppliedJobsTable;