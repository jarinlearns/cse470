import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';

const JobApplication = ({ job }) => {
    const { getToken } = useAuth();
    const [alreadyApplied, setAlreadyApplied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        coverLetter: '',
        expectedJoiningDate: '',
        expectedSalary: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        checkStatus();
    }, [job._id]);

    const checkStatus = async () => {
        try {
            const token = await getToken();
            const response = await axios.get(
                `http://localhost:5000/api/applications/status/${job._id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAlreadyApplied(response.data.alreadyApplied);
        } catch (err) {
            console.error('Status check error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        if (!formData.coverLetter.trim()) {
            setError('Cover letter is required');
            return;
        }

        setSubmitting(true);

        try {
            const token = await getToken();
            await axios.post(
                'http://localhost:5000/api/applications/apply',
                {
                    jobId: job._id,
                    ...formData
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccess('Application submitted successfully!');
            setAlreadyApplied(true);
            setShowForm(false);
            setFormData({ coverLetter: '', expectedJoiningDate: '', expectedSalary: '' });

        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit application');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <button className="px-6 py-2 bg-gray-300 text-gray-600 rounded" disabled>Loading...</button>;
    }

    return (
        <div>
            {!alreadyApplied ? (
                <>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Apply Now
                    </button>

                    {showForm && (
                        <div className="mt-4 p-4 border rounded bg-gray-50">
                            <h3 className="text-lg font-semibold mb-3">Application Form</h3>
                            
                            {error && <div className="mb-3 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
                            {success && <div className="mb-3 p-2 bg-green-100 text-green-700 rounded">{success}</div>}

                            <form onSubmit={handleSubmit} className="space-y-3">
                                <div>
                                    <label className="block font-medium mb-1">Cover Letter *</label>
                                    <textarea
                                        value={formData.coverLetter}
                                        onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                                        className="w-full p-2 border rounded"
                                        rows="5"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-medium mb-1">Expected Joining Date</label>
                                    <input
                                        type="date"
                                        value={formData.expectedJoiningDate}
                                        onChange={(e) => setFormData({ ...formData, expectedJoiningDate: e.target.value })}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>

                                <div>
                                    <label className="block font-medium mb-1">Expected Salary</label>
                                    <input
                                        type="text"
                                        value={formData.expectedSalary}
                                        onChange={(e) => setFormData({ ...formData, expectedSalary: e.target.value })}
                                        className="w-full p-2 border rounded"
                                        placeholder="e.g., $60,000"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Application'}
                                </button>
                            </form>
                        </div>
                    )}
                </>
            ) : (
                <button className="px-6 py-2 bg-gray-400 text-white rounded cursor-not-allowed" disabled>
                    Already Applied
                </button>
            )}
        </div>
    );
};

export default JobApplication;