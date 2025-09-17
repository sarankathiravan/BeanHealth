import React, { useState } from 'react';
import { User, UserRole } from '../../types';

interface LoginProps {
  onLogin: (user: User) => void;
  onSwitchToChooser: () => void;
  role: UserRole;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToChooser, role }) => {
  const [email, setEmail] = useState(role === 'doctor' ? 'dr.smith@clinic.com' : 'jane@example.com');
  const [password, setPassword] = useState('password123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This mock logic finds a user based on the selected role and entered email.
    // A real app would validate credentials against a backend.
    const isDoctor = role === 'doctor';
    const mockUser: User = {
      id: isDoctor ? 'DOC-001' : 'BH-0723',
      name: isDoctor ? 'Dr. Smith' : 'Jane Doe',
      email: email,
      role: role,
    };
    onLogin(mockUser);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100 mb-1">
        {role === 'patient' ? 'Patient Sign In' : 'Doctor Sign In'}
      </h2>
      <p className="text-center text-slate-500 dark:text-slate-400 mb-6">Enter your credentials to continue.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-slate-100"
            placeholder={role === 'patient' ? 'patient@example.com' : 'doctor@example.com'}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-slate-100"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Sign In
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Not a {role}?{' '}
        <button onClick={onSwitchToChooser} className="font-medium text-indigo-600 hover:text-indigo-500">
          Go Back
        </button>
      </p>
    </div>
  );
};

export default Login;