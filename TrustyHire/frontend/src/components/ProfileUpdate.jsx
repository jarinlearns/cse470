import { useState, useEffect, useCallback } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import axios from 'axios';

// 1. INSERT THE TOGGLE COMPONENT DEFINITION HERE
// This component is the visual switch
const ProfileVisibilityToggle = ({ isPublic, onToggle }) => {
    return (
        <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${isPublic ? 'text-gray-400' : 'text-gray-800'}`}>Private</span>
            
            <button
                onClick={onToggle}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    ${isPublic ? 'bg-indigo-600' : 'bg-gray-300'}`}
            >
                <span className="sr-only">Toggle Profile Visibility</span>
                <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ease-in-out duration-200 shadow 
                        ${isPublic ? 'translate-x-6' : 'translate-x-1'}`}
                ></span>
            </button>

            <span className={`text-sm font-medium ${isPublic ? 'text-indigo-600' : 'text-gray-400'}`}>Public</span>
        </div>
    );
};
// END OF TOGGLE COMPONENT DEFINITION

const ProfileUpdate = () => {
    const { user } = useUser();
    const { getToken } = useAuth();
    
    // The state for visibility is already here:
    const [isProfilePublic, setIsProfilePublic] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [status, setStatus] = useState('');
    const [dbUser, setDbUser] = useState(null);
    const [resume, setResume] = useState(null);

    // Initial Form State
    const [formData, setFormData] = useState({
        // ... (existing formData)
        name: '', gender: '', dob: '', phone: '', address: '',
        desiredJobTitle: '', preferredCategory: '', preferredLocation: '', jobType: 'Full-time', bio: '',
        education: [],
        experience: [],
        skills: '' 
    });

    // Helper: Add Empty Education
    const addEducation = () => {
        setFormData({...formData, education: [...formData.education, { degree: '', institution: '', subject: '', result: '', startDate: '', endDate: '' }] });
    };

    // Helper: Remove Education
    const removeEducation = (index) => {
        const newEdu = [...formData.education];
        newEdu.splice(index, 1);
        setFormData({ ...formData, education: newEdu });
    };

    // Helper: Add Empty Experience
    const addExperience = () => {
        setFormData({...formData, experience: [...formData.experience, { company: '', position: '', type: 'Full-time', responsibilities: '', startDate: '', endDate: '', isCurrent: false }] });
    };

    // Helper: Remove Experience
    const removeExperience = (index) => {
        const newExp = [...formData.experience];
        newExp.splice(index, 1);
        setFormData({ ...formData, experience: newExp });
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = await getToken();
                const { data } = await axios.get('http://localhost:5000/api/users/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDbUser(data);
                setIsProfilePublic(data.isPublic !== undefined ? data.isPublic : true);     
                setFormData({
                    ...data,
                    name: data.name || user?.fullName || '',
                    skills: data.skills ? data.skills.join(', ') : '', 
                    education: data.education.length ? data.education : [],
                    experience: data.experience.length ? data.experience : []
                });
            } catch (error) {
                console.log("New user");
                if(user) setFormData(prev => ({ ...prev, name: user.fullName }));
                setIsProfilePublic(true);
            }
        };
        if(user) fetchProfile();
    }, [user, getToken]);

    // 2. INSERT THE TOGGLE HANDLER HERE
    const handleToggleVisibility = useCallback(async () => {
        setStatus('Updating profile visibility...');
        try {
            const token = await getToken();
            
            // Call the backend endpoint
            const res = await axios.put('http://localhost:5000/api/users/profile/toggle-visibility', {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Update local state and dbUser with the new value from the backend
            const newState = res.data.isPublic;
            setIsProfilePublic(newState);
            setDbUser(prev => ({ ...prev, isPublic: newState }));

            setStatus(`Profile is now ${newState ? 'Public' : 'Private'} ✅`);
        } catch (error) {
            console.error("Failed to toggle visibility:", error);
            setStatus('Error: Failed to update profile visibility ❌');
        }
    }, [getToken]); // Dependency on getToken   
    // END OF TOGGLE HANDLER

    const handleSubmit = async (e) => {
        e.preventDefault();
        const submitData = new FormData();
        
        // ... (existing handleSubmit logic)
        Object.keys(formData).forEach(key => {
            if(key !== 'education' && key !== 'experience' && key !== 'skills') {
                submitData.append(key, formData[key]);
            }
        });

        submitData.append('education', JSON.stringify(formData.education));
        submitData.append('experience', JSON.stringify(formData.experience));
        
        const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s !== "");
        submitData.append('skills', JSON.stringify(skillsArray));

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
            console.error(error);
            setStatus('Error Saving Profile ❌');
        }
    };

    if (!user) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="w-full mt-10 px-6">
            {status && <div className="mb-6 p-4 bg-green-100 text-green-700 rounded text-center font-bold">{status}</div>}

            {!isEditing ? (
                /* --- VIEW MODE (FIXED PLACEMENT) --- */
                
                // 🌟 NEW RELATIVE WRAPPER for safe absolute positioning
                <div className="relative"> 
                    
                    {/* 🌟 The absolute positioned toggle button with z-50 for visibility */}
                    <div className="absolute top-0 right-0 z-50 p-4"> 
                        <ProfileVisibilityToggle
                            isPublic={isProfilePublic}
                            onToggle={handleToggleVisibility}
                        />
                    </div>
                    {/* END OF TOGGLE PLACEMENT */}
                
                    {/* The Grid structure for content (NOTE: Added pt-12 to push content down from toggle) */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-12"> 
                    
                        {/* LEFT COLUMN (3/12) */}
                        <div className="md:col-span-3 space-y-6">
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
                                
                                <div className="p-6 text-center flex-grow">
                                    <img src={user.imageUrl} className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow mb-4" />
                                    <h2 className="text-xl font-bold text-gray-800">{dbUser?.name}</h2>
                                    <p className="text-gray-500 text-sm">{dbUser?.desiredJobTitle || "No Title Set"}</p>
                                    <div className="mt-4 text-left text-sm space-y-2 border-t pt-4">
                                        <p><strong>📍 Loc:</strong> {dbUser?.address || "N/A"}</p>
                                        <p><strong>📞 Phone:</strong> {dbUser?.phone || "N/A"}</p>
                                        <p><strong>✉️ Email:</strong> {user.primaryEmailAddress.emailAddress}</p>
                                        
                                    </div>
                                    <div className="mt-4 pt-4 border-t">
                                        <h4 className="font-bold text-gray-700 text-sm mb-2">Skills</h4>
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            {dbUser?.skills?.map((skill, i) => (
                                                <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* MOVED: Edit Button to Bottom */}
                                <div className="bg-gray-50 p-4 border-t text-center mt-auto">
                                    <button onClick={() => setIsEditing(true)} className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-bold shadow text-sm">
                                        ✏️ Edit Profile
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow border border-gray-100 text-center">
                                <h3 className="font-bold mb-2">Resume</h3>
                                {dbUser?.resume?.url ? 
                                    <a href={dbUser.resume.url} target="_blank" className="text-blue-600 font-bold hover:underline">Download CV</a> 
                                    : <span className="text-gray-400 text-sm">Not Uploaded</span>}
                            </div>
                        </div>

                        {/* RIGHT SPACE (9/12) - EMPTY FOR ADS */}
                        <div className="md:col-span-9 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 min-h-[600px]">
                            Job Ads Space
                        </div>
                    </div>
                </div> /* Close the new relative wrapper */
            ) : (
                /* --- EDIT MODE (FORM) --- */
                // ... (rest of the form)
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-xl border border-gray-200">
                    <h2 className="text-2xl font-bold mb-6 border-b pb-4">Update Job Profile</h2>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        
                        {/* 1. PERSONAL INFO */}
                        <section>
                            <h3 className="text-lg font-bold text-blue-600 mb-4">1. Personal Information</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <input placeholder="Full Name" className="border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                <input placeholder="Phone Number" className="border p-2 rounded" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                <input placeholder="Date of Birth" type="date" className="border p-2 rounded" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                                <select className="border p-2 rounded" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                                <input placeholder="Address (City, Area)" className="border p-2 rounded md:col-span-2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                            </div>
                        </section>

                        {/* 2. CAREER INFO */}
                        <section>
                            <h3 className="text-lg font-bold text-blue-600 mb-4">2. Career Information</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <input placeholder="Desired Job Title" className="border p-2 rounded" value={formData.desiredJobTitle} onChange={e => setFormData({...formData, desiredJobTitle: e.target.value})} />
                                
                                <select className="border p-2 rounded" value={formData.jobType} onChange={e => setFormData({...formData, jobType: e.target.value})}>
                                    <option>Full-time</option><option>Part-time</option><option>Remote</option><option>Internship</option>
                                </select>
                                <input placeholder="Preferred Location" className="border p-2 rounded" value={formData.preferredLocation} onChange={e => setFormData({...formData, preferredLocation: e.target.value})} />
                                <textarea placeholder="Career Summary" className="border p-2 rounded md:col-span-2 h-20" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
                            </div>
                        </section>

                        {/* 3. EDUCATION */}
                        <section>
                            <h3 className="text-lg font-bold text-blue-600 mb-4 flex justify-between">
                                3. Education 
                                <button type="button" onClick={addEducation} className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded font-bold hover:bg-blue-200">+ Add Degree</button>
                            </h3>
                            {formData.education.map((edu, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded mb-4 border relative">
                                    <button type="button" onClick={() => removeEducation(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-sm">✕ Remove</button>
                                    <div className="grid md:grid-cols-2 gap-3 mt-4">
                                        <input placeholder="Degree (e.g. BSc)" className="border p-2 rounded" value={edu.degree} onChange={e => {
                                            const newEdu = [...formData.education]; newEdu[index].degree = e.target.value; setFormData({...formData, education: newEdu});
                                        }} />
                                        <input placeholder="Institute" className="border p-2 rounded" value={edu.institution} onChange={e => {
                                            const newEdu = [...formData.education]; newEdu[index].institution = e.target.value; setFormData({...formData, education: newEdu});
                                        }} />
                                        <input placeholder="Result (GPA)" className="border p-2 rounded" value={edu.result} onChange={e => {
                                            const newEdu = [...formData.education]; newEdu[index].result = e.target.value; setFormData({...formData, education: newEdu});
                                        }} />
                                        <input placeholder="End Year" className="border p-2 rounded" value={edu.endDate} onChange={e => {
                                            const newEdu = [...formData.education]; newEdu[index].endDate = e.target.value; setFormData({...formData, education: newEdu});
                                        }} />
                                    </div>
                                </div>
                            ))}
                        </section>
                        
                        {/* 4. WORK EXPERIENCE */}
                        <section>
                            <h3 className="text-lg font-bold text-blue-600 mb-4 flex justify-between">
                                4. Experience 
                                <button type="button" onClick={addExperience} className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded font-bold hover:bg-blue-200">+ Add Job</button>
                            </h3>
                             {formData.experience.map((exp, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded mb-4 border relative">
                                    <button type="button" onClick={() => removeExperience(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-sm">✕ Remove</button>
                                    <div className="grid md:grid-cols-2 gap-3 mt-4">
                                        <input placeholder="Company" className="border p-2 rounded" value={exp.company} onChange={e => {
                                            const newExp = [...formData.experience]; newExp[index].company = e.target.value; setFormData({...formData, experience: newExp});
                                        }} />
                                        <input placeholder="Position" className="border p-2 rounded" value={exp.position} onChange={e => {
                                            const newExp = [...formData.experience]; newExp[index].position = e.target.value; setFormData({...formData, experience: newExp});
                                        }} />
                                        
                                        {/* Job Type Select */}
                                        <select className="border p-2 rounded" value={exp.type} onChange={e => {
                                            const newExp = [...formData.experience]; newExp[index].type = e.target.value; setFormData({...formData, experience: newExp});
                                        }}>
                                            <option value="">Job Type</option><option>Full-time</option><option>Part-time</option><option>Contract</option>
                                        </select>
                                        
                                        {/* Currently Working Checkbox */}
                                        <div className="flex items-center gap-2 border p-2 rounded bg-white">
                                            <input type="checkbox" checked={exp.isCurrent} onChange={e => {
                                                const newExp = [...formData.experience]; newExp[index].isCurrent = e.target.checked; setFormData({...formData, experience: newExp});
                                            }} />
                                            <label className="text-sm text-gray-600">Currently Working</label>
                                        </div>

                                        <input placeholder="Start Date" type="date" className="border p-2 rounded" value={exp.startDate} onChange={e => {
                                            const newExp = [...formData.experience]; newExp[index].startDate = e.target.value; setFormData({...formData, experience: newExp});
                                        }} />
                                        <input placeholder="End Date" type="date" className="border p-2 rounded" value={exp.endDate} disabled={exp.isCurrent} onChange={e => {
                                            const newExp = [...formData.experience]; newExp[index].endDate = e.target.value; setFormData({...formData, experience: newExp});
                                        }} />
                                    </div>
                                    <textarea placeholder="Responsibilities" className="w-full border p-2 rounded h-20 mt-2" value={exp.responsibilities} onChange={e => {
                                            const newExp = [...formData.experience]; newExp[index].responsibilities = e.target.value; setFormData({...formData, experience: newExp});
                                    }} />
                                </div>
                            ))}
                        </section>

                        {/* 5. SKILLS & FILE */}
                        <section>
                             <h3 className="text-lg font-bold text-blue-600 mb-4">5. Skills & Resume</h3>
                             <input placeholder="Skills (comma separated)" className="w-full border p-2 rounded mb-4" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} />
                             <input type="file" onChange={e => setResume(e.target.files[0])} className="block w-full text-sm text-gray-500 file:bg-blue-50 file:text-blue-700 file:rounded-full file:px-4 file:py-2 file:border-0" />
                        </section>

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