import React from 'react';
import { LogoutIcon } from './icons/LogoutIcon';
import ThemeToggle from './ThemeToggle';

interface SimpleHeaderProps {
  userName: string;
  userRole: string;
  onSignOut: () => void;
}

const SimpleHeader: React.FC<SimpleHeaderProps> = ({ userName, userRole, onSignOut }) => {
  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            BeanHealth
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {userRole === 'doctor' ? 'Doctor Portal' : 'Patient Dashboard'}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {userName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                {userRole}
              </p>
            </div>
            
            <div className="h-8 w-8 bg-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {userName && userName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          
          <button
            onClick={onSignOut}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            title="Sign Out"
          >
            <LogoutIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default SimpleHeader;