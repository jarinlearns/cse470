import { SignedIn, SignedOut, SignIn, SignUp, UserButton } from "@clerk/clerk-react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import ProfileUpdate from './components/ProfileUpdate';
import TrustedBy from './components/TrustedBy';
import JobSeekerDashboard from './components/JobSeekerDashboard'; 
import { Search, MapPin, Briefcase } from 'lucide-react'; // Added for icons

// --- SUB-COMPONENT: FilterSidebar ---
const FilterSidebar = () => {
    const categories = ["Programming", "Data Science", "Designing", "Networking", "Management", "Marketing", "Cybersecurity"];
    const locations = ["Bangladesh", "Washington", "Remote", "Seattle", "New York", "Dubai"];

    const FilterSection = ({ title, items, icon: Icon }) => (
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm mb-6">
            <h3 className="text-lg font-black text-gray-900 mb-5 italic tracking-tight flex items-center gap-2">
                <Icon size={18} className="text-blue-600" /> {title}
            </h3>
            <div className="space-y-3">
                {items.map((item) => (
                    <label key={item} className="flex items-center group cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                        <span className="ml-3 text-gray-600 font-bold text-sm group-hover:text-blue-600 transition-colors">
                            {item}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );

    return (
        <aside className="w-full">
            <FilterSection title="Search by Categories" items={categories} icon={Briefcase} />
            <FilterSection title="Search by Locations" items={locations} icon={MapPin} />
        </aside>
    );
};

function App() {
  return (
    <Router>
       <div className="min-h-screen bg-gray-50/50">
         {/* Navbar */}
         <div className="p-4 bg-white shadow-sm border-b flex justify-between items-center px-8 sticky top-0 z-50">
            <Link to="/" className="text-2xl font-black text-blue-600 tracking-tighter italic">TrustyHire</Link>
            
            <div className="flex items-center gap-4">
                <SignedIn>
                    <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 px-3 font-bold text-sm uppercase tracking-widest">Dashboard</Link>
                    <Link to="/profile" className="text-gray-600 hover:text-blue-600 px-3 font-bold text-sm uppercase tracking-widest">Profile</Link>
                    <UserButton /> 
                </SignedIn>
                <SignedOut>
                    <Link to="/login" className="text-gray-600 hover:text-blue-600 px-3 font-bold text-sm uppercase tracking-widest">Login</Link>
                </SignedOut>
            </div>
         </div>

        {/* Content Area */}
        <div className="max-w-7xl mx-auto px-6">
          <Routes>
             {/* HOME ROUTE RESTRUCTURED */}
             <Route path="/" element={
                <div className="py-12 space-y-12">
                    {/* Top: Trusted Section */}
                    <TrustedBy />

                    {/* Bottom: Sidebar + Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        {/* LEFT: Filters */}
                        <div className="md:col-span-3">
                            <FilterSidebar />
                        </div>

                        {/* RIGHT: Main Feed Placeholder */}
                        <div className="md:col-span-9">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-3xl font-black text-gray-900 italic tracking-tight">Latest Jobs</h2>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input placeholder="Search job title..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:ring-2 ring-blue-500 outline-none w-64" />
                                </div>
                            </div>
                            
                            {/* Placeholder for Job List */}
                            <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
                                <div className="bg-blue-50 p-4 rounded-full mb-4">
                                    <Briefcase className="text-blue-600" size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Ready to find your next role?</h3>
                                <p className="text-gray-400 mt-2">Filter by category or location on the left to get started.</p>
                            </div>
                        </div>
                    </div>
                </div>
             } />

             <Route path="/dashboard" element={<SignedIn><JobSeekerDashboard /></SignedIn>} />
             <Route path="/login/*" element={<div className="p-10 flex justify-center"><SignIn routing="path" path="/login" /></div>} />
             <Route path="/register/*" element={<div className="p-10 flex justify-center"><SignUp routing="path" path="/register" /></div>} />
             
             <Route path="/profile" element={
                <div className="p-10 flex justify-center">
                  <SignedIn><ProfileUpdate /></SignedIn>
                  <SignedOut><Navigate to="/login" /></SignedOut>
                </div>
             } />
          </Routes>
        </div>
       </div>
    </Router>
  );
}

export default App;