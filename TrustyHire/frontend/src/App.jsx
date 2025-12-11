import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import ProfileUpdate from './components/ProfileUpdate';
import VerifyEmail from './components/VerifyEmail';
import MyApplications from './components/MyApplications';

function App() {
  return (
    <Router>
       <div className="min-h-screen bg-gray-100 p-10">
        <Routes>
           {/* Home shows both Register and Profile for testing */}
           <Route path="/" element={
              <div className="grid md:grid-cols-2 gap-10">
                 <Register />
                 <ProfileUpdate />
              </div>
           } />
           
           
           <Route path="/verify/:token" element={<VerifyEmail />} />
           <Route path="/my-applications" element={<MyApplications />} />
        </Routes>
       </div>
    </Router>
  );
}
export default App;