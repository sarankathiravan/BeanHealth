import React, { useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const AuthCallback: React.FC = () => {
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error during auth callback:', error);
        }

        // Redirect to main app - AuthContext will handle the auth state
        window.location.href = '/';
      } catch (error) {
        console.error('Unexpected error during auth callback:', error);
        window.location.href = '/';
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;