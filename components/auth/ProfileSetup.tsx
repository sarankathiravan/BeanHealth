import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthService } from '../../services/authService';
import { UserRole } from '../../types';

const ProfileSetup: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [role, setRole] = useState<UserRole>('patient');
  const [name, setName] = useState(user?.user_metadata?.full_name || '');
  const [specialty, setSpecialty] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [condition, setCondition] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const profileData = {
        id: user.id,
        email: user.email!,
        name,
        role,
        specialty: role === 'doctor' ? specialty : undefined,
        dateOfBirth: role === 'patient' ? dateOfBirth : undefined,
        condition: role === 'patient' ? condition : undefined,
        avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      };
      
      console.log('Creating profile with data:', profileData);
      await AuthService.createOrUpdateProfile(profileData);
      
      // Refresh the profile in AuthContext
      console.log('Profile created successfully, refreshing auth state');
      await refreshProfile();
      
    } catch (error: any) {
      console.error('Error setting up profile:', error);
      
      // Show more specific error message
      let errorMessage = 'Failed to set up profile. Please try again.';
      if (error?.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-sky-300/20 dark:bg-sky-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-300/20 dark:bg-indigo-600/10 rounded-full blur-3xl animate-pulse"></div>
      
      <div className="relative z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 p-10 w-full max-w-lg animate-scale-in">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-slate-100 mb-3">
            Complete Your Profile
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Tell us a bit about yourself to personalize your experience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 text-slate-900 dark:text-slate-100"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              I am a...
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                role === 'patient' 
                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="patient"
                  checked={role === 'patient'}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="sr-only"
                />
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  role === 'patient'
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className={`text-sm font-semibold ${
                  role === 'patient'
                    ? 'text-sky-700 dark:text-sky-400'
                    : 'text-slate-700 dark:text-slate-300'
                }`}>Patient</span>
              </label>
              <label className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                role === 'doctor' 
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="doctor"
                  checked={role === 'doctor'}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="sr-only"
                />
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  role === 'doctor'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className={`text-sm font-semibold ${
                  role === 'doctor'
                    ? 'text-indigo-700 dark:text-indigo-400'
                    : 'text-slate-700 dark:text-slate-300'
                }`}>Doctor</span>
              </label>
            </div>
          </div>

          {role === 'doctor' && (
            <div className="animate-slide-up">
              <label htmlFor="specialty" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Specialty
              </label>
              <input
                id="specialty"
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                required
                placeholder="e.g., Cardiology, Pediatrics"
                className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 text-slate-900 dark:text-slate-100"
              />
            </div>
          )}

          {role === 'patient' && (
            <div className="space-y-6 animate-slide-up">
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Date of Birth
                </label>
                <input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                  className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label htmlFor="condition" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Primary Health Condition <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  id="condition"
                  type="text"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  placeholder="e.g., Diabetes, Hypertension"
                  className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full py-4 px-6 border-none rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:shadow-xl hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 overflow-hidden mt-8"
          >
            <span className="relative z-10 flex items-center justify-center">
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Setting up...
                </>
              ) : (
                'Complete Setup'
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;