const ApplicationsTable = ({ applications }) => {
    // 1. Keep the nice status pill colors
    const getStatusStyle = (status) => {
        const styles = {
            Pending: 'bg-blue-50 text-blue-600 border border-blue-100',
            Accepted: 'bg-green-50 text-green-600 border border-green-100',
            Rejected: 'bg-red-50 text-red-600 border border-red-100'
        };
        return styles[status] || styles.Pending;
    };

    if (applications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/30">
                <Briefcase className="text-gray-200 mb-4" size={40} />
                <p className="text-gray-400 font-bold italic">No applications to show yet</p>
            </div>
        );
    }

    return (
        <div className="w-full bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-50">
                        <th className="px-10 py-7 text-xs font-black text-gray-400 uppercase tracking-widest">Company</th>
                        <th className="px-10 py-7 text-xs font-black text-gray-400 uppercase tracking-widest">Job Title</th>
                        <th className="px-10 py-7 text-xs font-black text-gray-400 uppercase tracking-widest">Location</th>
                        <th className="px-10 py-7 text-xs font-black text-gray-400 uppercase tracking-widest">Date</th>
                        <th className="px-10 py-7 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {applications.map((app) => (
                        <tr key={app._id} className="hover:bg-gray-50/50 transition-all group">
                            {/* --- COMPANY NAME: TEXT ONLY --- */}
                            <td className="px-10 py-6">
                                <span className="font-extrabold text-gray-900 text-lg tracking-tight">
                                    {app.jobId?.companyName || 'N/A'}
                                </span>
                            </td>

                            <td className="px-10 py-6">
                                <span className="font-bold text-gray-700 text-base">
                                    {app.jobId?.title || 'N/A'}
                                </span>
                            </td>

                            <td className="px-10 py-6">
                                <div className="flex items-center text-gray-400 font-bold text-sm">
                                    <MapPin size={14} className="mr-1.5" />
                                    {app.jobId?.location || 'Remote'}
                                </div>
                            </td>

                            <td className="px-10 py-6 text-gray-400 font-bold text-sm">
                                {new Date(app.appliedAt).toLocaleDateString('en-US', { 
                                    month: 'short', day: 'numeric', year: 'numeric' 
                                })}
                            </td>

                            <td className="px-10 py-6">
                                <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter ${getStatusStyle(app.status)}`}>
                                    {app.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}; 