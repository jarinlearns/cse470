import { useState, useEffect } from 'react';
import axios from 'axios';

const JobSearch = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filter States
    const [keyword, setKeyword] = useState('');
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState('');
    const [type, setType] = useState('');

    // Fetch Jobs Function
    const fetchJobs = async () => {
        setLoading(true);
        try {
            // We pass filters as "query parameters" to the backend
            const { data } = await axios.get('http://localhost:5000/api/jobs', {
                params: { keyword, location, category, type } 
            });
            setJobs(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch initially on load
    useEffect(() => {
        fetchJobs();
    }, []);

    // Handle Search Submit
    const handleSearch = (e) => {
        e.preventDefault();
        fetchJobs();
    };

    return (
        <div className="max-w-6xl mx-auto mt-10 p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Find Your Dream Job</h1>

            {/* --- SEARCH BAR & FILTERS --- */}
            <form onSubmit={handleSearch} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8">
                <div className="grid md:grid-cols-4 gap-4">
                    
                    {/* Keyword Input */}
                    <div className="md:col-span-4 lg:col-span-1">
                        <input 
                            type="text" 
                            placeholder="Job Title (e.g. Developer)" 
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>

                    {/* Filters */}
                    <select className="p-3 border rounded-lg bg-white" value={location} onChange={(e) => setLocation(e.target.value)}>
                        <option value="">All Locations</option>
                        <option value="Remote">Remote</option>
                        <option value="Dhaka">Dhaka</option>
                        <option value="New York">New York</option>
                    </select>

                    <select className="p-3 border rounded-lg bg-white" value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="">All Categories</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Design">Design</option>
                        <option value="Marketing">Marketing</option>
                    </select>

                    {/* Search Button */}
                    <button type="submit" className="bg-blue-600 text-white font-bold p-3 rounded-lg hover:bg-blue-700 transition">
                        🔍 Search
                    </button>
                </div>
            </form>

            {/* --- RESULTS LIST --- */}
            {loading ? (
                <p className="text-center text-gray-500">Loading jobs...</p>
            ) : (
                <div className="grid gap-4">
                    {jobs.length > 0 ? jobs.map((job) => (
                        <div key={job._id} className="bg-white p-6 rounded-lg shadow border border-gray-100 hover:shadow-md transition">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
                                    <p className="text-gray-600">{job.company}</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">{job.location}</span>
                                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">{job.type}</span>
                                        <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">{job.category}</span>
                                    </div>
                                </div>
                                <button className="bg-gray-100 text-blue-600 px-4 py-2 rounded font-bold text-sm hover:bg-blue-50">
                                    Apply Now
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed">
                            <p className="text-gray-500">No jobs found. Try different keywords!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default JobSearch;