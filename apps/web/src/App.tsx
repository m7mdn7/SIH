import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Login } from './pages/Login';
import { LandingPage } from './pages/LandingPage';

// Shared Pages
import { ReportProblem } from './pages/ReportProblem';
import { ChallengeDetail } from './pages/ChallengeDetail';
import { ChallengesList } from './pages/ChallengesList';
import { ProjectsList } from './pages/ProjectsList';
import { ProjectTracking } from './pages/ProjectTracking';
import { GovMap } from './pages/dashboards/GovMap';
import { Settings } from './pages/Settings';

// Role-Specific Dashboards
import { CitizenDashboard } from './pages/dashboards/CitizenDashboard';
import { GovDashboard } from './pages/dashboards/GovDashboard';
import { UniversityDashboard } from './pages/dashboards/UniversityDashboard';
import { IndustryDashboard } from './pages/dashboards/IndustryDashboard';

// A dynamic dashboard component that renders the correct dashboard based on role
const RoleBasedDashboard = () => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  switch (user.role) {
    case 'Citizen': return <CitizenDashboard />;
    case 'Government': return <GovDashboard />;
    case 'University': return <UniversityDashboard />;
    case 'Industry': return <IndustryDashboard />;
    default: return <Navigate to="/login" replace />;
  }
};

const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
             // If user is already logged in, they shouldn't see landing page, they should go to dashboard
             // but for simplicity, we can just let LandingPage render, or wrap in a check
             <PublicOnlyRoute><LandingPage /></PublicOnlyRoute>
          } />
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          
          {/* Protected Routes inside AppLayout */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<AppLayout />}>
              <Route index element={<RoleBasedDashboard />} />
              
              <Route path="challenges" element={<ChallengesList role="Government" />} />
              <Route path="challenges/:id" element={<ChallengeDetail role="Government" />} />
              <Route path="report" element={<ReportProblem />} />
              <Route path="reports" element={<ChallengesList role="Citizen" />} />
              <Route path="projects" element={<ProjectsList />} />
              <Route path="projects/:id" element={<ProjectTracking />} />
              <Route path="map" element={<GovMap />} />
              <Route path="settings" element={<Settings />} />
              
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
          
          {/* Fallback for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
