import React from 'react';
import { UserRole } from '../../types';
import { DoctorIcon } from '../icons/DoctorIcon';
import { UserIcon } from '../icons/UserIcon';

interface AuthChooserProps {
    onRoleSelect: (role: UserRole) => void;
}

const AuthChooser: React.FC<AuthChooserProps> = ({ onRoleSelect }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100 mb-2">Welcome to Beanhealth</h2>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-8">Please select your role to sign in.</p>
            <div className="space-y-4">
                <button 
                    onClick={() => onRoleSelect('patient')}
                    className="w-full flex items-center text-left p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-700/50 transition-all duration-200"
                >
                    <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg mr-4">
                        <UserIcon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">I'm a Patient</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Access your health dashboard.</p>
                    </div>
                </button>
                <button 
                    onClick={() => onRoleSelect('doctor')}
                    className="w-full flex items-center text-left p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-700/50 transition-all duration-200"
                >
                    <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg mr-4">
                        <DoctorIcon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">I'm a Doctor</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">View your patient roster.</p>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default AuthChooser;