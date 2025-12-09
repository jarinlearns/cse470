// trustyhire-frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';

// Simple check for authentication (using localStorage)
const isAuthenticated = () => {
    return localStorage.getItem('jobSeekerToken') ? true : false;
};

// PrivateRoute component to protect pages
const PrivateRoute = ({ element: Element }) => {
    return isAuthenticated() ? Element : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
          {/* Feature 2: Profile is protected */}
          <Route path="/profile" element={<PrivateRoute element={<Profile />} />} /> 

          {/* CATCH-ALL ROUTE for the root path (/) */}
          {/* Redirects based on authentication status */}
          <Route path="*" element={<Navigate to={isAuthenticated() ? "/profile" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
