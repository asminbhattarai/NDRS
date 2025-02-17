import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './features/auth/components/Login';
import Register from './features/auth/components/Register';
import ForgotPassword from './features/auth/components/ForgotPassword';
import Profile from './features/auth/components/Profile';
import ReportIncident from './features/incidents/components/ReportIncident';
import EmergencyReport from './features/incidents/components/EmergencyReport';
import IncidentList from './features/incidents/components/IncidentList';
import { AuthProvider } from './features/auth/context/AuthContext';
import Navbar from './components/Navbar';
import Home from './features/home/components/Home';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/incidents" element={<IncidentList />} />
            <Route path="/report-incident" element={<ReportIncident />} />
            <Route path="/emergency-report" element={<EmergencyReport />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;