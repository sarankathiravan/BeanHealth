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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center items-center mb-6 space-x-3">
          <LogoIcon className="h-10 w-10 text-emerald-600"/>
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100">BeanHealth</h1>
        </div>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg transition-all duration-300">
          {renderView()}
        </div>
      </div>
    </div>
  );
};

export default Auth;
