import { useState, useEffect, useCallback } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { Briefcase, MapPin, Building2 } from 'lucide-react'; 

// --- 1. CLEAN TEXT-ONLY APPLICATIONS TABLE ---
const ApplicationsTable = ({ applications }) => {
    const getStatusStyle = (status) => {
        const styles = {
            Pending: 'bg-blue-100/60 text-blue-600',
            Accepted: 'bg-green-100/60 text-green-600',
            Rejected: 'bg-red-100/60 text-red-600'
        };
        return styles[status] || styles.Pending;
    };

    if (applications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-100 rounded-3xl bg-white/50">
                <Briefcase className="text-gray-300 mb-4" size={32} />
                <p className="text-gray-400 font-semibold text-lg">No applications found</p>
            </div>
        );
    }

    return (
        <div className="w-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-gray-50">
                        <th className="px-8 py-6 text-sm font-bold text-gray-900 uppercase tracking-wider">Company</th>
                        <th className="px-8 py-6 text-sm font-bold text-gray-900 uppercase tracking-wider">Job Title</th>
                        <th className="px-8 py-6 text-sm font-bold text-gray-900 uppercase tracking-wider">Location</th>
                        <th className="px-8 py-6 text-sm font-bold text-gray-900 uppercase tracking-wider">Date</th>
                        <th className="px-8 py-6 text-sm font-bold text-gray-900 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {applications.map((app) => (
                        <tr key={app._id} className="hover:bg-gray-50/80 transition-all group">
                            {/* COMPANY NAME: Removed all logo/icon logic */}
                            <td className="px-8 py-6">
                                <span className="font-extrabold text-gray-900 text-lg tracking-tight">
                                    {app.jobId?.companyName || 'N/A'}
                                </span>
                            </td>
                            <td className="px-8 py-6">
                                <p className="text-gray-700 font-bold">{app.jobId?.title || 'N/A'}</p>
                            </td>
                            <td className="px-8 py-6">
                                <div className="flex items-center text-gray-500 font-semibold text-sm">
                                    <MapPin size={16} className="mr-1.5 text-gray-400" />
                                    {app.jobId?.location || 'Remote'}
                                </div>
                            </td>
                            <td className="px-8 py-6 text-gray-500 font-medium text-sm">
                                {new Date(app.appliedAt).toLocaleDateString('en-US', { 
                                    month: 'short', day: 'numeric', year: 'numeric' 
                                })}
                            </td>
                            <td className="px-8 py-6">
                                <span className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${getStatusStyle(app.status)}`}>
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

const ProfileVisibilityToggle = ({ isPublic, onToggle }) => {
    return (
        <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${isPublic ? 'text-gray-400' : 'text-gray-800'}`}>Private</span>
            <button
                onClick={onToggle}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isPublic ? 'bg-indigo-600' : 'bg-gray-300'}`}
            >
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ease-in-out duration-200 shadow ${isPublic ? 'translate-x-6' : 'translate-x-1'}`}></span>
            </button>
            <span className={`text-sm font-medium ${isPublic ? 'text-indigo-600' : 'text-gray-400'}`}>Public</span>
        </div>
    );
};

const ProfileUpdate = () => {
    const { user } = useUser();
    const { getToken } = useAuth();
    
    const [isProfilePublic, setIsProfilePublic] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [status, setStatus] = useState('');
    const [dbUser, setDbUser] = useState(null);
    const [resume, setResume] = useState(null);

    // --- 2. CLEAN MOCK DATA (Removed 'logo' fields) ---
    const [appliedJobs, setAppliedJobs] = useState([
        {
            _id: '1',
            appliedAt: new Date(),
            status: 'Accepted',
            jobId: { companyName: 'Amazon', title: 'Senior Developer', location: 'Seattle, WA' }
        },
        {
            _id: '2',
            appliedAt: new Date(),
            status: 'Pending',
            jobId: { companyName: 'Meta', title: 'Product Designer', location: 'Remote' }
        },
        {
            _id: '3',
            appliedAt: new Date(),
            status: 'Rejected',
            jobId: { companyName: 'Google', title: 'Data Scientist', location: 'Mountain View' }
        }
    ]); 

    const [formData, setFormData] = useState({
        name: '', gender: '', dob: '', phone: '', address: '',
        desiredJobTitle: '', preferredCategory: '', preferredLocation: '', jobType: 'Full-time', bio: '',
        education: [], experience: [], skills: '' 
    });

    const fetchProfileData = useCallback(async () => {
        try {
            const token = await getToken();
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            const [profileRes, applicationsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/users/profile', config),
                axios.get('http://localhost:5000/api/applications/my-applications', config)
            ]);

            const data = profileRes.data;
            setDbUser(data);
            setIsProfilePublic(data.isPublic !== undefined ? data.isPublic : true);     
            setFormData({
                ...data,
                name: data.name || user?.fullName || '',
                skills: data.skills ? data.skills.join(', ') : '', 
                education: data.education.length ? data.education : [],
                experience: data.experience.length ? data.experience : []
            });

            if (applicationsRes.data.success && applicationsRes.data.applications.length > 0) {
                setAppliedJobs(applicationsRes.data.applications);
            }
        } catch (error) {
            console.log("Error fetching profile or applications");
        }
    }, [user, getToken]);

    useEffect(() => {
        if(user) fetchProfileData();
    }, [user, fetchProfileData]);

    const handleToggleVisibility = useCallback(async () => {
        setStatus('Updating profile visibility...');
        try {
            const token = await getToken();
            const res = await axios.put('http://localhost:5000/api/users/profile/toggle-visibility', {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const newState = res.data.isPublic;
            setIsProfilePublic(newState);
            setDbUser(prev => ({ ...prev, isPublic: newState }));
            setStatus(`Profile is now ${newState ? 'Public' : 'Private'} ✅`);
        } catch (error) {
            setStatus('Error updating visibility ❌');
        }
    }, [getToken]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
            if(!['education', 'experience', 'skills'].includes(key)) {
                submitData.append(key, formData[key]);
            }
        });
        submitData.append('education', JSON.stringify(formData.education));
        submitData.append('experience', JSON.stringify(formData.experience));
        submitData.append('skills', JSON.stringify(formData.skills.split(',').map(s => s.trim()).filter(s => s !== "")));
        if (resume) submitData.append('resume', resume);

        try {
            const token = await getToken();
            const { data } = await axios.put('http://localhost:5000/api/users/profile', submitData, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
            });
            setDbUser(data);
            setIsEditing(false);
            setStatus('Profile Saved Successfully ✅');
        } catch (error) {
            setStatus('Error Saving Profile ❌');
        }
    };

    if (!user) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="w-full mt-10 px-6 max-w-7xl mx-auto">
            {status && <div className="mb-6 p-4 bg-green-100 text-green-700 rounded text-center font-bold">{status}</div>}

            {!isEditing ? (
                <div className="relative"> 
                    <div className="absolute top-0 right-0 z-50 p-4"> 
                        <ProfileVisibilityToggle isPublic={isProfilePublic} onToggle={handleToggleVisibility} />
                    </div>
                
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-12"> 
                        {/* LEFT COLUMN */}
                        <div className="md:col-span-4 space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-8 text-center">
                                    <img src={user.imageUrl} className="w-28 h-28 rounded-full mx-auto border-4 border-white shadow-md mb-4" alt="Profile" />
                                    <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-tight">{dbUser?.name}</h2>
                                    <p className="text-gray-500 font-medium">{dbUser?.desiredJobTitle || "No Title Set"}</p>
                                    
                                    <div className="mt-6 text-left space-y-3 border-t pt-6 text-sm text-gray-600">
                                        <div className="flex items-center"><MapPin size={16} className="mr-2 text-blue-500" /> {dbUser?.address || "Loc: N/A"}</div>
                                        <div className="flex items-center">📞 {dbUser?.phone || "N/A"}</div>
                                        <div className="flex items-center">✉️ {user.primaryEmailAddress.emailAddress}</div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t text-left">
                                        <h4 className="font-bold text-gray-700 text-xs uppercase mb-3 tracking-widest">Skills</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {dbUser?.skills?.map((skill, i) => (
                                                <span key={i} className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-tighter border border-blue-100">{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 border-t">
                                    <button onClick={() => setIsEditing(true)} className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-bold shadow-md flex items-center justify-center gap-2">
                                        ✏️ Edit Profile
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-800 mb-2">Resume</h3>
                                {dbUser?.resume?.url ? 
                                    <a href={dbUser.resume.url} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline flex items-center gap-2">📄 Download CV</a> 
                                    : <span className="text-gray-400 text-sm">Not Uploaded</span>}
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="md:col-span-8 space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight italic">Jobs Applied</h2>
                                <span className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full text-xs font-bold">
                                    {appliedJobs.length} Applications
                                </span>
                            </div>
                            <ApplicationsTable applications={appliedJobs} />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-xl border border-gray-200">
                    <h2 className="text-2xl font-bold mb-6 border-b pb-4">Update Job Profile</h2>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <p className="text-gray-500 text-center italic">Form editing section active...</p>
                        <div className="flex gap-4">
                            <button type="submit" className="flex-1 bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700">Save Changes</button>
                            <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-gray-500 text-white font-bold py-3 rounded hover:bg-gray-600">Cancel</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ProfileUpdate; 