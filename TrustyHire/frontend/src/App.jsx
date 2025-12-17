import { SignedIn, SignedOut, SignIn, SignUp, UserButton } from "@clerk/clerk-react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProfileUpdate from './components/ProfileUpdate';
import JobSearch from './components/JobSearch';

function App() {
  return (
    <Router>
       <div className="min-h-screen bg-gray-100">
         {/* Navbar */}
         <div className="p-4 bg-white shadow flex justify-between items-center">
            <h1 className="text-xl font-bold text-blue-600">TrustyHire</h1>
            <SignedIn>
                <UserButton /> 
            </SignedIn>
         </div>

        <div className="p-10 flex justify-center">
          <Routes>
             {/* Public Routes: Clerk handles these now */}
             <Route path="/login/*" element={<SignIn routing="path" path="/login" />} />
             <Route path="/register/*" element={<SignUp routing="path" path="/register" />} />
             
             {/* Protected Route */}
             <Route path="/profile" element={
                <>
                  <SignedIn>
                    <ProfileUpdate />
                  </SignedIn>
                  <SignedOut>
                     <Navigate to="/login" />
                  </SignedOut>
                </>
             } />

             {/* ✅ NEW ROUTE ADDED HERE */}
             <Route path="/jobs" element={<JobSearch />} />

             {/* Default Redirect */}
             <Route path="/" element={<Navigate to="/profile" />} />
          </Routes>
        </div>
       </div>
    </Router>
  );
}
export default App;