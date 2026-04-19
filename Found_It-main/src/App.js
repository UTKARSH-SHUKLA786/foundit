import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';
import LoginSignup from './LoginSignup';
import FormPage from './FormPage';
import LostItems from './LostItems';   // You will create this file
import FoundItems from './FoundItems'; // You will create this file

// --- Guards ---
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return !token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <div className="relative min-h-screen w-full bg-black overflow-hidden selection:bg-cyan-500/30">
        
        {/* Background Layer */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#111_0%,_#000_100%)]"></div>
          {[...Array(15)].map((_, i) => (
            <div key={i} className="bubble bg-white/5 blur-[1px]" style={{ 
                left: `${Math.random() * 100}%`, 
                width: `${Math.random() * 60 + 20}px`,
                height: `${Math.random() * 60 + 20}px`,
                animationDuration: `${Math.random() * 10 + 10}s` 
            }} />
          ))}
        </div>

        {/* Content Layer */}
        <div className="relative z-10 w-full h-full">
          <Routes>
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/login" element={<PublicRoute><LoginSignup /></PublicRoute>} />
            
            {/* Form Routes */}
            <Route path="/report-found" element={<PrivateRoute><FormPage type="found" /></PrivateRoute>} />
            <Route path="/report-lost" element={<PrivateRoute><FormPage type="lost" /></PrivateRoute>} />

            {/* View Feed Routes */}
            <Route path="/view-lost" element={<PrivateRoute><LostItems /></PrivateRoute>} />
            <Route path="/view-found" element={<PrivateRoute><FoundItems /></PrivateRoute>} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
