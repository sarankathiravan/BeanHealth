import React, { useState } from 'react';
import Login from './Login';
import { LogoIcon } from '../icons/LogoIcon';
import AuthChooser from './AuthChooser';

const Auth: React.FC = () => {
  const [view, setView] = useState<'chooser' | 'login'>('chooser');

  const renderView = () => {
    switch(view) {
        case 'login':
            return <Login onSwitchToChooser={() => setView('chooser')} />;
        case 'chooser':
        default:
            return <AuthChooser onNext={() => setView('login')} />;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-sky-300/20 dark:bg-sky-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-300/20 dark:bg-indigo-600/10 rounded-full blur-3xl animate-pulse"></div>
      
      <div className="relative z-10 w-full max-w-xl">
        {/* Logo Header */}
        <div className="flex justify-center items-center mb-10 space-x-3 animate-fade-in">
          <div className="bg-gradient-to-br from-sky-500 to-indigo-600 p-3 rounded-2xl shadow-xl">
            <LogoIcon className="h-10 w-10 text-white"/>
          </div>
          <h1 className="text-5xl font-display font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
            BeanHealth
          </h1>
        </div>
        
        {/* Auth Card */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 animate-scale-in">
          {renderView()}
        </div>
        
        {/* Footer Text */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8 animate-fade-in">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Auth;
