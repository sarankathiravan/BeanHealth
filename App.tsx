import React from 'react';
import { useAuth } from './contexts/AuthContext';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Auth from './components/auth/Auth';
import ProfileSetup from './components/auth/ProfileSetup';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboardContainer from './components/DoctorDashboardContainer';

const AppContent: React.FC = () => {
  const { user, profile, loading, needsProfileSetup } = useAuth();
  const [loadingTimeout, setLoadingTimeout] = React.useState(false);

  // Add a timeout to prevent infinite loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.warn('Loading timeout reached, forcing app to continue');
        setLoadingTimeout(true);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timer);
  }, [loading]);

  // Debug logging
  React.useEffect(() => {
    console.log('=== APP STATE ===');
    console.log('User:', user ? { id: user.id, email: user.email } : 'null');
    console.log('Profile:', profile ? { id: profile.id, role: profile.role, name: profile.name } : 'null');
    console.log('Loading:', loading);
    console.log('Needs Profile Setup:', needsProfileSetup);
    console.log('Loading Timeout:', loadingTimeout);
    console.log('==================');
  }, [user, profile, loading, needsProfileSetup, loadingTimeout]);

  if (loading && !loadingTimeout) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If loading timed out, treat as not authenticated
  if (loadingTimeout) {
    console.log('Loading timeout reached, showing Auth');
    return <Auth />;
  }

  // Not authenticated - show auth flow
  if (!user) {
    console.log('No user found, showing Auth');
    return <Auth />;
  }

  // Authenticated but needs profile setup
  if (needsProfileSetup) {
    console.log('User needs profile setup');
    return <ProfileSetup />;
  }

  // Authenticated and profile complete - show dashboard
  console.log('User authenticated with profile, showing dashboard for role:', profile?.role);
  
  // Extra validation to ensure profile is complete
  if (profile?.role === 'doctor') {
    console.log('Rendering DoctorDashboardContainer');
    return <DoctorDashboardContainer />;
  } else if (profile?.role === 'patient') {
    console.log('Rendering PatientDashboard');
    return <PatientDashboard />;
  } else {
    console.log('Profile exists but no valid role, showing ProfileSetup');
    return <ProfileSetup />;
  }
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <DataProvider>
          <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <AppContent />
          </div>
        </DataProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
