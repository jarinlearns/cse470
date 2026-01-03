import { useState, useEffect, useCallback } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { Briefcase, MapPin, Building2, Upload, Plus, Trash2 } from 'lucide-react';

// --- 1. CLEAN TEXT-ONLY APPLICATIONS TABLE (UNCHANGED) ---
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

// --- 2. PROFILE TOGGLE (UNCHANGED) ---
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

// --- 3. MAIN COMPONENT ---
const ProfileUpdate = () => {
    const { user } = useUser();
    const { getToken } = useAuth();

    const [isProfilePublic, setIsProfilePublic] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [status, setStatus] = useState('');
    const [dbUser, setDbUser] = useState(null);
    const [resume, setResume] = useState(null);
    const [photo, setPhoto] = useState(null); // New state for photo upload

    // MOCK DATA (UNCHANGED)
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

    // --- UPDATED STATE STRUCTURE ---
    const [formData, setFormData] = useState({
        // 1. Essentials
        fullName: '',
        email: '',
        phone: '',
        location: '', // City, State
        
        // 2. Work & Education (Arrays)
        workExperience: [{ title: "", company: "", startDate: "", endDate: "", achievements: "" }],
        education: [{ degree: "", institution: "", gradYear: "" }],

        // 3. Visibility Boosters
        headline: '', // Professional Headline
        skills: '',   // Comma separated
        aboutMe: '',  // Summary

        // 4. Value Add
        links: { linkedin: '', github: '', portfolio: '' }, // Nested object for links
        certifications: '', // Comma separated or text
        languages: '',      // e.g. "English (Native)"

        // 5. Critical Settings
        jobTitlesTarget: '',
        workType: 'On-site',
        salaryExpectation: '',
        visibilityStatus: 'Actively Looking'
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
            
            // Map backend data to new form structure
            setFormData({
                fullName: data.name || user?.fullName || '',
                email: data.email || user?.primaryEmailAddress?.emailAddress || '',
                phone: data.phone || '',
                location: data.address || '', 
                
                workExperience: data.experience && data.experience.length > 0 ? data.experience : [{ title: "", company: "", startDate: "", endDate: "", achievements: "" }],
                education: data.education && data.education.length > 0 ? data.education : [{ degree: "", institution: "", gradYear: "" }],
                
                headline: data.headline || data.desiredJobTitle || '', 
                skills: data.skills ? data.skills.join(', ') : '',
                aboutMe: data.bio || '',
                
                links: data.links || { linkedin: '', github: '', portfolio: '' },
                certifications: data.certifications ? data.certifications.join(', ') : '',
                languages: data.languages ? data.languages.join(', ') : '',

                jobTitlesTarget: data.desiredJobTitle || '',
                workType: data.jobType || 'On-site',
                salaryExpectation: data.expectedSalary || '',
                visibilityStatus: data.visibilityStatus || 'Actively Looking'
            });

            if (applicationsRes.data.success && applicationsRes.data.applications.length > 0) {
                setAppliedJobs(applicationsRes.data.applications);
            }
        } catch (error) {
            console.log("Error fetching profile or applications");
        }
    }, [user, getToken]);

    useEffect(() => {
        if (user) fetchProfileData();
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

    // --- FORM HANDLERS ---

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Handle nested links object
        if (name.startsWith('link_')) {
            const linkType = name.split('_')[1];
            setFormData(prev => ({
                ...prev,
                links: { ...prev.links, [linkType]: value }
            }));
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // Handler for Dynamic Arrays (Work/Education)
    const handleArrayChange = (index, field, value, type) => {
        const updatedArray = [...formData[type]];
        updatedArray[index][field] = value;
        setFormData({ ...formData, [type]: updatedArray });
    };

    const addArrayItem = (type) => {
        const emptyItem = type === 'workExperience' 
            ? { title: "", company: "", startDate: "", endDate: "", achievements: "" }
            : { degree: "", institution: "", gradYear: "" };
        setFormData({ ...formData, [type]: [...formData[type], emptyItem] });
    };

    const removeArrayItem = (index, type) => {
        const updatedArray = formData[type].filter((_, i) => i !== index);
        setFormData({ ...formData, [type]: updatedArray });
    };

    const handleFileChange = (e) => {
        if (e.target.name === 'resume') setResume(e.target.files[0]);
        if (e.target.name === 'photo') setPhoto(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const submitData = new FormData();

        // Append simple fields
        submitData.append('name', formData.fullName);
        submitData.append('email', formData.email);
        submitData.append('phone', formData.phone);
        submitData.append('address', formData.location); // Map location to address
        
        submitData.append('headline', formData.headline);
        submitData.append('bio', formData.aboutMe);
        submitData.append('desiredJobTitle', formData.jobTitlesTarget);
        submitData.append('jobType', formData.workType);
        submitData.append('expectedSalary', formData.salaryExpectation);
        submitData.append('visibilityStatus', formData.visibilityStatus);

        // Serialize complex objects/arrays
        submitData.append('education', JSON.stringify(formData.education));
        submitData.append('experience', JSON.stringify(formData.workExperience));
        submitData.append('links', JSON.stringify(formData.links));

        // Handle Comma Separated Strings -> Arrays
        submitData.append('skills', JSON.stringify(formData.skills.split(',').map(s => s.trim()).filter(s => s !== "")));
        submitData.append('certifications', JSON.stringify(formData.certifications.split(',').map(s => s.trim())));
        submitData.append('languages', JSON.stringify(formData.languages.split(',').map(s => s.trim())));

        // Files
        if (resume) submitData.append('resume', resume);
        if (photo) submitData.append('photo', photo);

        try {
            const token = await getToken();
            const { data } = await axios.put('http://localhost:5000/api/users/profile', submitData, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
            });
            setDbUser(data);
            setIsEditing(false);
            setStatus('Profile Saved Successfully ✅');
        } catch (error) {
            console.error(error);
            setStatus('Error Saving Profile ❌');
        }
    };

    if (!user) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="w-full mt-10 px-6 max-w-7xl mx-auto">
            {status && <div className="mb-6 p-4 bg-green-100 text-green-700 rounded text-center font-bold">{status}</div>}

            {!isEditing ? (
                // --- VIEW MODE (UNCHANGED) ---
                <div className="relative">
                    <div className="absolute top-0 right-0 z-50 p-4">
                        <ProfileVisibilityToggle isPublic={isProfilePublic} onToggle={handleToggleVisibility} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-12">
                        <div className="md:col-span-4 space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-8 text-center">
                                    <img src={dbUser?.photoUrl || user.imageUrl} className="w-28 h-28 rounded-full mx-auto border-4 border-white shadow-md mb-4" alt="Profile" />
                                    <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-tight">{dbUser?.name}</h2>
                                    <p className="text-indigo-600 font-bold text-sm mb-1">{dbUser?.headline || "No Headline"}</p>
                                    <p className="text-gray-500 font-medium text-xs">{dbUser?.desiredJobTitle || "No Target Title"}</p>

                                    <div className="mt-6 text-left space-y-3 border-t pt-6 text-sm text-gray-600">
                                        <div className="flex items-center"><MapPin size={16} className="mr-2 text-blue-500" /> {dbUser?.address || "Loc: N/A"}</div>
                                        <div className="flex items-center">📞 {dbUser?.phone || "N/A"}</div>
                                        <div className="flex items-center">✉️ {dbUser?.email || user.primaryEmailAddress.emailAddress}</div>
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
                // --- EDIT MODE (COMPLETELY REFACTORED) ---
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-xl border border-gray-200">
                    <h2 className="text-2xl font-bold mb-6 border-b pb-4">Update Profile</h2>
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* SECTION 1: THE "MUST-HAVE" ESSENTIALS */}
                        <div>
                            <h3 className="text-lg font-black text-gray-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-blue-600 rounded-full"></span> 1. Essentials (Required)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 font-bold mb-2 text-sm">Full Name</label>
                                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50" required placeholder="Professional Name" />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-bold mb-2 text-sm">Professional Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50" required />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-bold mb-2 text-sm">Phone Number</label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50" required placeholder="+1 (555) 000-0000" />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-bold mb-2 text-sm">Location (City, State)</label>
                                    <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50" required placeholder="New York, NY" />
                                </div>
                            </div>
                            
                            {/* Work Experience Array */}
                            <div className="mt-6">
                                <label className="block text-gray-700 font-bold mb-2 text-sm">Work Experience</label>
                                {formData.workExperience.map((exp, index) => (
                                    <div key={index} className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-200 relative">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                            <input type="text" placeholder="Job Title" value={exp.title} onChange={(e) => handleArrayChange(index, 'title', e.target.value, 'workExperience')} className="p-2 border rounded" required />
                                            <input type="text" placeholder="Company" value={exp.company} onChange={(e) => handleArrayChange(index, 'company', e.target.value, 'workExperience')} className="p-2 border rounded" required />
                                            <input type="text" placeholder="Start Date (MM/YY)" value={exp.startDate} onChange={(e) => handleArrayChange(index, 'startDate', e.target.value, 'workExperience')} className="p-2 border rounded" required />
                                            <input type="text" placeholder="End Date (or Present)" value={exp.endDate} onChange={(e) => handleArrayChange(index, 'endDate', e.target.value, 'workExperience')} className="p-2 border rounded" required />
                                        </div>
                                        <textarea placeholder="Key Achievements (Bullet points)..." value={exp.achievements} onChange={(e) => handleArrayChange(index, 'achievements', e.target.value, 'workExperience')} className="w-full p-2 border rounded" rows="2"></textarea>
                                        
                                        {formData.workExperience.length > 1 && (
                                            <button type="button" onClick={() => removeArrayItem(index, 'workExperience')} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                                        )}
                                    </div>
                                ))}
                                <button type="button" onClick={() => addArrayItem('workExperience')} className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline"><Plus size={16}/> Add Role</button>
                            </div>

                             {/* Education Array */}
                             <div className="mt-4">
                                <label className="block text-gray-700 font-bold mb-2 text-sm">Education</label>
                                {formData.education.map((edu, index) => (
                                    <div key={index} className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-200 relative">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <input type="text" placeholder="Degree / Certificate" value={edu.degree} onChange={(e) => handleArrayChange(index, 'degree', e.target.value, 'education')} className="p-2 border rounded" required />
                                            <input type="text" placeholder="Institution" value={edu.institution} onChange={(e) => handleArrayChange(index, 'institution', e.target.value, 'education')} className="p-2 border rounded" required />
                                            <input type="text" placeholder="Grad Year" value={edu.gradYear} onChange={(e) => handleArrayChange(index, 'gradYear', e.target.value, 'education')} className="p-2 border rounded" required />
                                        </div>
                                        {formData.education.length > 1 && (
                                            <button type="button" onClick={() => removeArrayItem(index, 'education')} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                                        )}
                                    </div>
                                ))}
                                <button type="button" onClick={() => addArrayItem('education')} className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline"><Plus size={16}/> Add Education</button>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* SECTION 2: VISIBILITY BOOSTERS */}
                        <div>
                             <h3 className="text-lg font-black text-gray-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-indigo-500 rounded-full"></span> 2. Visibility Boosters
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 font-bold mb-1 text-sm">Professional Headline</label>
                                    <input type="text" name="headline" value={formData.headline} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Marketing Assistant | SEO & Social Media Specialist" />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-bold mb-1 text-sm">Skills (Comma Separated, 10-15 recommended)</label>
                                    <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Python, React, Project Management, SEO..." />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-bold mb-1 text-sm">Profile Summary / About Me</label>
                                    <textarea name="aboutMe" value={formData.aboutMe} onChange={handleChange} rows="3" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Current Role + Years of Exp + Key Achievement + Goal..."></textarea>
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* SECTION 3: THE VALUE ADD */}
                        <div>
                            <h3 className="text-lg font-black text-gray-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-purple-500 rounded-full"></span> 3. Value Add
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 font-bold mb-2 text-sm">Upload Photo (Headshot)</label>
                                    <input type="file" name="photo" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"/>
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-bold mb-2 text-sm">Upload Resume (PDF)</label>
                                    <input type="file" name="resume" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <div>
                                    <label className="block text-gray-700 font-bold mb-1 text-xs uppercase">LinkedIn URL</label>
                                    <input type="url" name="link_linkedin" value={formData.links.linkedin} onChange={handleChange} className="w-full p-2 border rounded text-sm" placeholder="linkedin.com/in/..." />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-bold mb-1 text-xs uppercase">GitHub / Behance</label>
                                    <input type="url" name="link_github" value={formData.links.github} onChange={handleChange} className="w-full p-2 border rounded text-sm" placeholder="github.com/..." />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-bold mb-1 text-xs uppercase">Portfolio Website</label>
                                    <input type="url" name="link_portfolio" value={formData.links.portfolio} onChange={handleChange} className="w-full p-2 border rounded text-sm" placeholder="mywebsite.com" />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-gray-700 font-bold mb-1 text-sm">Certifications</label>
                                    <input type="text" name="certifications" value={formData.certifications} onChange={handleChange} className="w-full p-2 border rounded" placeholder="PMP, AWS Certified..." />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-bold mb-1 text-sm">Languages</label>
                                    <input type="text" name="languages" value={formData.languages} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Spanish (Conversational)..." />
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* SECTION 4: CRITICAL SETTINGS */}
                        <div className="bg-gray-50 p-6 rounded-xl">
                            <h3 className="text-lg font-black text-gray-800 uppercase tracking-wide mb-4">4. Critical Settings</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 font-bold mb-2 text-sm">Target Job Titles</label>
                                    <input type="text" name="jobTitlesTarget" value={formData.jobTitlesTarget} onChange={handleChange} className="w-full p-3 border rounded-lg bg-white" placeholder="Sales Manager, Account Executive" />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-bold mb-2 text-sm">Work Type</label>
                                    <select name="workType" value={formData.workType} onChange={handleChange} className="w-full p-3 border rounded-lg bg-white">
                                        <option value="On-site">On-site</option>
                                        <option value="Remote">Remote</option>
                                        <option value="Hybrid">Hybrid</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-bold mb-2 text-sm">Salary Expectation</label>
                                    <input type="text" name="salaryExpectation" value={formData.salaryExpectation} onChange={handleChange} className="w-full p-3 border rounded-lg bg-white" placeholder="e.g. $60,000/year" />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-bold mb-2 text-sm">Visibility Status</label>
                                    <select name="visibilityStatus" value={formData.visibilityStatus} onChange={handleChange} className="w-full p-3 border rounded-lg bg-white">
                                        <option value="Actively Looking">Actively Looking</option>
                                        <option value="Open to Work">Open to Work (Casual)</option>
                                        <option value="Not Looking">Not Looking</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex gap-4 pt-4 sticky bottom-0 bg-white p-4 border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                            <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-lg transform active:scale-95">Save Profile</button>
                            <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300 transition">Cancel</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ProfileUpdate;