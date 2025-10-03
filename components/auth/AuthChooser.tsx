import React from 'react';
import { DoctorIcon } from '../icons/DoctorIcon';
import { UserIcon } from '../icons/UserIcon';

interface AuthChooserProps {
    onNext: () => void;
}

const AuthChooser: React.FC<AuthChooserProps> = ({ onNext }) => {
    return (
        <div className="animate-fade-in">
            <div className="text-center mb-10">
                <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-slate-100 mb-3">
                    Welcome to <span className="bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">BeanHealth</span>
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                    Whether you're a patient or doctor, we'll get you set up in minutes
                </p>
            </div>
            
            <div className="space-y-4 mb-10">
                <div className="group relative flex items-center p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-sky-300 dark:hover:border-sky-600 hover:shadow-lg transition-all duration-300 cursor-default">
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 to-indigo-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative p-4 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl mr-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <UserIcon className="h-7 w-7 text-white" />
                    </div>
                    <div className="relative">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">For Patients</h3>
                        <p className="text-slate-600 dark:text-slate-400">Track your health, medications, and connect with doctors</p>
                    </div>
                </div>
                
                <div className="group relative flex items-center p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg transition-all duration-300 cursor-default">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl mr-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <DoctorIcon className="h-7 w-7 text-white" />
                    </div>
                    <div className="relative">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">For Doctors</h3>
                        <p className="text-slate-600 dark:text-slate-400">Manage your patient roster and provide better care</p>
                    </div>
                </div>
            </div>

            <button 
                onClick={onNext}
                className="w-full group relative py-4 px-6 border-none rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:shadow-xl hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all duration-200 overflow-hidden"
            >
                <span className="relative z-10">Continue to Sign In</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
        </div>
    );
};

export default AuthChooser;