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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100 mb-2">
          Complete Your Profile
        </h2>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-8">
          Tell us a bit about yourself to personalize your experience
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              I am a...
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="patient"
                  checked={role === 'patient'}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600"
                />
                <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">Patient</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="doctor"
                  checked={role === 'doctor'}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600"
                />
                <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">Doctor</span>
              </label>
            </div>
          </div>

          {role === 'doctor' && (
            <div>
              <label htmlFor="specialty" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Specialty
              </label>
              <input
                id="specialty"
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                required
                placeholder="e.g., Cardiology, Pediatrics"
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-slate-100"
              />
            </div>
          )}

          {role === 'patient' && (
            <>
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Date of Birth
                </label>
                <input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Primary Health Condition (Optional)
                </label>
                <input
                  id="condition"
                  type="text"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  placeholder="e.g., Diabetes, Hypertension"
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-slate-100"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Setting up...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;