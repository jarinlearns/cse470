import React, { useState } from 'react'; 
import { SignedIn, SignedOut, SignIn, SignUp, UserButton, useUser } from "@clerk/clerk-react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import ProfileUpdate from './components/ProfileUpdate';
import TrustedBy from './components/TrustedBy';
import JobSeekerDashboard from './components/JobSeekerDashboard'; 
import JobCard from './components/JobCard'; 
import ApplicationModal from './components/ApplicationModal';
import { jobs } from './data/jobs'; 
import { Search, MapPin, Briefcase, Bell } from 'lucide-react';

const FilterSidebar = ({ selectedCategories, setSelectedCategories, selectedLocations, setSelectedLocations }) => {
    const categories = ["Programming", "Data Science", "Designing", "Networking", "Management", "Marketing", "Cybersecurity"];
    const locations = ["Bangladesh", "Washington", "Remote", "Seattle", "New York", "Dubai"];

    const handleToggle = (item, selectedList, setList) => {
        if (selectedList.includes(item)) {
            setList(selectedList.filter(i => i !== item));
        } else {
            setList([...selectedList, item]);
        }
    };

    const FilterSection = ({ title, items, icon: Icon, selectedList, setList }) => (
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm mb-6">
            <h3 className="text-lg font-black text-gray-900 mb-5 italic tracking-tight flex items-center gap-2">
                <Icon size={18} className="text-blue-600" /> {title}
            </h3>
            <div className="space-y-3">
                {items.map((item) => (
                    <label key={item} className="flex items-center group cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={selectedList.includes(item)}
                            onChange={() => handleToggle(item, selectedList, setList)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                        />
                        <span className="ml-3 text-gray-600 font-bold text-sm group-hover:text-blue-600 transition-colors">
                            {item}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );

    return (
        <aside className="w-full sticky top-24">
            <FilterSection title="Search by Categories" items={categories} icon={Briefcase} selectedList={selectedCategories} setList={setSelectedCategories} />
            <FilterSection title="Search by Locations" items={locations} icon={MapPin} selectedList={selectedLocations} setList={setSelectedLocations} />
        </aside>
    );
};

function MainContent() {
  const { isSignedIn } = useUser(); // Checks if logged in
  const navigate = useNavigate();   // Moves user to Login page
  
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New job posted: UI Designer at Amazon", time: "2h ago" },
    { id: 2, message: "Congratulations! You have been accepted for the Software Tester role.", time: "5h ago" },
  ]);

  const addNotification = (message) => {
    const newNotif = { id: Date.now(), message, time: "Just now" };
    setNotifications([newNotif, ...notifications]);
  };


  const handleApply = (job) => {
    if (!isSignedIn) {
 
      navigate('/login');
    } else {
  
      setSelectedJob(job);
      setIsModalOpen(true);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(job.category);
    const locationMatch = selectedLocations.length === 0 || selectedLocations.includes(job.location);
    const searchMatch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && locationMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50/50">
         <div className="p-4 bg-white shadow-sm border-b flex justify-between items-center px-8 sticky top-0 z-50">
            <Link to="/" className="text-2xl font-black text-blue-600 tracking-tighter italic">TrustyHire</Link>
            
            <div className="flex items-center gap-6">
                <SignedIn>
                    <div className="relative">
                        <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 text-gray-500 hover:text-blue-600 transition-colors">
                            <Bell size={22} />
                            {notifications.length > 0 && <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>}
                        </button>
                        {showNotifications && (
                            <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 shadow-2xl rounded-[1.5rem] overflow-hidden z-50">
                                <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
                                    <span className="font-black text-[10px] uppercase tracking-widest text-gray-900">Notifications</span>
                                    <button onClick={() => setNotifications([])} className="text-[10px] font-bold text-red-500 hover:underline">Clear all</button>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.length > 0 ? notifications.map(n => (
                                        <div key={n.id} className="p-4 border-b border-gray-50 hover:bg-blue-50/30 transition-colors cursor-pointer group">
                                            <p className="text-xs font-bold text-gray-800 leading-snug group-hover:text-blue-700">{n.message}</p>
                                            <span className="text-[10px] text-gray-400 mt-1 block font-medium">{n.time}</span>
                                        </div>
                                    )) : <div className="p-8 text-center text-gray-400 text-xs font-bold">No new notifications</div>}
                                </div>
                            </div>
                        )}
                    </div>
                    <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 font-bold text-xs uppercase tracking-widest">Dashboard</Link>
                    <Link to="/profile" className="text-gray-600 hover:text-blue-600 font-bold text-xs uppercase tracking-widest">Profile</Link>
                    <UserButton /> 
                </SignedIn>
                <SignedOut>
                    <Link to="/login" className="text-gray-600 hover:text-blue-600 font-bold text-xs uppercase tracking-widest">Login</Link>
                </SignedOut>
            </div>
         </div>

        <div className="max-w-7xl mx-auto px-6">
          <Routes>
             <Route path="/" element={
                <div className="py-12 space-y-12">
                    <TrustedBy />
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        <div className="md:col-span-3">
                            <FilterSidebar selectedCategories={selectedCategories} setSelectedCategories={setSelectedCategories} selectedLocations={selectedLocations} setSelectedLocations={setSelectedLocations} />
                        </div>
                        <div className="md:col-span-9">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-3xl font-black text-gray-900 italic tracking-tight">Latest Jobs ({filteredJobs.length})</h2>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search job title..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:ring-2 ring-blue-500 outline-none w-64 shadow-sm" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredJobs.map(job => (
                                    <JobCard key={job.id} job={job} onApply={() => handleApply(job)} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
             } />
             <Route path="/dashboard" element={<SignedIn><JobSeekerDashboard /></SignedIn>} />
             <Route path="/login/*" element={<div className="p-10 flex justify-center"><SignIn routing="path" path="/login" /></div>} />
             <Route path="/register/*" element={<div className="p-10 flex justify-center"><SignUp routing="path" path="/register" /></div>} />
             <Route path="/profile" element={<div className="p-10 flex justify-center"><SignedIn><ProfileUpdate /></SignedIn></div>} />
          </Routes>
        </div>

        <ApplicationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} jobTitle={selectedJob?.title} onSuccess={addNotification} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <MainContent />
    </Router>
  );
}

export default App;



