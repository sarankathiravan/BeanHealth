import React, { useState } from 'react';
import { User, UserRole, AuthView } from '../../types';
import Login from './Login';
import { LogoIcon } from '../icons/LogoIcon';
import AuthChooser from './AuthChooser';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [view, setView] = useState<AuthView>('chooser');
  const [role, setRole] = useState<UserRole>('patient');

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setView(selectedRole === 'patient' ? 'patient-login' : 'doctor-login');
  }

  const renderView = () => {
    switch(view) {
        case 'patient-login':
        case 'doctor-login':
            return <Login 
                        role={role} 
                        onLogin={onLogin} 
                        onSwitchToChooser={() => setView('chooser')} 
                    />;
        case 'chooser':
        default:
            return <AuthChooser onRoleSelect={handleRoleSelect} />;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center items-center mb-6 space-x-3">
          <LogoIcon className="h-10 w-10 text-emerald-600"/>
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100">Beanhealth</h1>
        </div>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg transition-all duration-300">
          {renderView()}
        </div>
      </div>
    </div>
  );
};

export default Auth;
