import React from 'react';
import { DoctorIcon } from '../icons/DoctorIcon';
import { UserIcon } from '../icons/UserIcon';

interface AuthChooserProps {
    onNext: () => void;
}

const AuthChooser: React.FC<AuthChooserProps> = ({ onNext }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100 mb-2">Welcome to BeanHealth</h2>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-8">Whether you're a patient or doctor, we'll get you set up after you sign in with Google.</p>
            
            <div className="space-y-4 mb-8">
                <div className="flex items-center p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                    <div className="p-3 bg-white dark:bg-slate-700 rounded-lg mr-4">
                        <UserIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">For Patients</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Track your health, medications, and connect with doctors.</p>
                    </div>
                </div>
                
                <div className="flex items-center p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                    <div className="p-3 bg-white dark:bg-slate-700 rounded-lg mr-4">
                        <DoctorIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">For Doctors</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your patient roster and provide better care.</p>
                    </div>
                </div>
            </div>

            <button 
                onClick={onNext}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
                Continue to Sign In
            </button>
        </div>
    );
};

export default AuthChooser;