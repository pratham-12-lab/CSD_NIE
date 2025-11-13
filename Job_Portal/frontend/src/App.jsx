import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';

// Auth components
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';

// Public components
import Home from './components/Home';
import Jobs from './components/Jobs';
import Browse from './components/Browse';
import Profile from './components/Profile';
import JobDescription from './components/JobDescription';
import EmailTest from './components/EmailTest';
import PendingVerification from './components/PendingVerification';
import SavedJobs from './components/SavedJobs'; 
import JobAlerts from './components/JobAlerts'; 

// Admin/Recruiter components
import Companies from './components/admin/Companies';
import CompanyCreate from './components/admin/CompanyCreate';
import CompanySetup from './components/admin/CompanySetup';
import AdminJobs from "./components/admin/AdminJobs";
import PostJob from './components/admin/PostJob';
import Applicants from './components/admin/Applicants';
import AdminDashboard from './components/admin/AdminDashboard';
import ProtectedRoute from './components/admin/ProtectedRoute';

import Chatbot from './components/Chatbot/Chatbot';

function App() {
  return (
    <NotificationProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/description/:id" element={<JobDescription />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/saved-jobs" element={<SavedJobs />} />
            <Route path="/job-alerts" element={<JobAlerts />} />
            <Route path="/test-email" element={<EmailTest />} />
            <Route path="/pending-verification" element={<PendingVerification />} />

            {/* Admin Dashboard */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Recruiter & Admin Routes */}
            <Route 
              path="/admin/companies" 
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <Companies />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/companies/create" 
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <CompanyCreate />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/companies/:id" 
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <CompanySetup />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/jobs" 
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <AdminJobs />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/jobs/create" 
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <PostJob />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/jobs/:id/applicants" 
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <Applicants />
                </ProtectedRoute>
              } 
            />
          </Routes>

          {/* ✅ Floating ChatBot available on all pages */}
          <Chatbot />
        </div>
      </Router>
    </NotificationProvider>
  );
}

export default App;
