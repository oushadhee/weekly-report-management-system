import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Team Member Pages
import TeamDashboard from './pages/team/TeamDashboard';
import CreateReport from './pages/CreateReport';
import MyReports from './pages/MyReports';
import ReportHistory from './pages/team/ReportHistory';
import Profile from './pages/shared/Profile';

// Manager Pages
import ManagerDashboard from './pages/manager/ManagerDashboard';
import AllReports from './pages/manager/AllReports';
import Projects from './pages/shared/Projects';
import Charts from './pages/manager/Charts';
import TeamMembers from './pages/manager/TeamMembers';
import AIAssistant from './pages/manager/AIAssistant';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const ManagerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isManager, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return isManager ? <>{children}</> : <Navigate to="/dashboard" />;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Team Member Routes */}
      <Route path="/dashboard" element={<PrivateRoute><TeamDashboard /></PrivateRoute>} />
      <Route path="/create-report" element={<PrivateRoute><CreateReport /></PrivateRoute>} />
      <Route path="/my-reports" element={<PrivateRoute><MyReports /></PrivateRoute>} />
      <Route path="/report-history" element={<PrivateRoute><ReportHistory /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

      {/* Manager Routes */}
      <Route path="/manager/dashboard" element={<ManagerRoute><ManagerDashboard /></ManagerRoute>} />
      <Route path="/manager/all-reports" element={<ManagerRoute><AllReports /></ManagerRoute>} />
      <Route path="/manager/projects" element={<ManagerRoute><Projects /></ManagerRoute>} />
      <Route path="/manager/charts" element={<ManagerRoute><Charts /></ManagerRoute>} />
      <Route path="/manager/team-members" element={<ManagerRoute><TeamMembers /></ManagerRoute>} />
      <Route path="/manager/ai-assistant" element={<ManagerRoute><AIAssistant /></ManagerRoute>} />

      {/* Default */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;