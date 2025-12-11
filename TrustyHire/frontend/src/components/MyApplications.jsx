import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';

const MyApplications = () => {
    const { getToken } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const token = await getToken();
            const response = await axios.get(
                'http://localhost:5000/api/applications/my-applications',
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setApplications(response.data.applications);
        } catch (err) {
            setError('Failed to load applications');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            submitted: 'bg-blue-100 text-blue-800',
            under_review: 'bg-yellow-100 text-yellow-800',
            shortlisted: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            accepted: 'bg-purple-100 text-purple-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return <div className="text-center py-10">Loading applications...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-600">{error}</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">My Applications</h1>
            
            {applications.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    You haven't applied to any jobs yet.
                </div>
            ) : (
                <div className="space-y-4">
                    {applications.map((app) => (
                        <div key={app.applicationId} className="bg-white p-6 rounded-lg shadow border">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h2 className="text-xl font-semibold text-blue-600">{app.jobTitle}</h2>
                                    <p className="text-gray-600">{app.company}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                                    {app.status.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                                <div>
                                    <span className="font-medium">Location:</span> {app.location}
                                </div>
                                <div>
                                    <span className="font-medium">Job Type:</span> {app.jobType}
                                </div>
                                <div>
                                    <span className="font-medium">Applied On:</span> {new Date(app.appliedAt).toLocaleDateString()}
                                </div>
                                <div>
                                    <span className="font-medium">Salary:</span> {app.salary}
                                </div>
                            </div>

                            {app.expectedJoiningDate && (
                                <div className="text-sm mb-2">
                                    <span className="font-medium">Expected Joining:</span> {new Date(app.expectedJoiningDate).toLocaleDateString()}
                                </div>
                            )}

                            {app.expectedSalary && (
                                <div className="text-sm mb-2">
                                    <span className="font-medium">Expected Salary:</span> {app.expectedSalary}
                                </div>
                            )}

                            <details className="mt-3">
                                <summary className="cursor-pointer text-blue-600 font-medium">View Cover Letter</summary>
                                <p className="mt-2 p-3 bg-gray-50 rounded text-sm">{app.coverLetter}</p>
                            </details>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyApplications;