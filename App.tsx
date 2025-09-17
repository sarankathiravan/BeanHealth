import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import LandingPage from './components/LandingPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
          <LandingPage onGetStarted={() => console.log('Get started clicked')} />
        </div>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
