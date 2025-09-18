import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { AuthService } from '../services/authService'
import { User as AppUser } from '../types'

interface AuthContextType {
  user: User | null
  profile: AppUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signUp: (email: string, password: string, userData: {
    name: string
    role: 'patient' | 'doctor'
    specialty?: string
    dateOfBirth?: string
    condition?: string
  }) => Promise<void>
  signOut: () => Promise<void>
  needsProfileSetup: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false)

  useEffect(() => {
    let mounted = true;
    let initializationComplete = false;

    // Handle OAuth callback if present
    const handleOAuthCallback = async () => {
      // Check if this is an OAuth callback (URL contains #access_token or ?code)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const searchParams = new URLSearchParams(window.location.search);
      
      if (hashParams.get('access_token') || searchParams.get('code')) {
        console.log('OAuth callback detected, processing...');
        try {
          // Let Supabase handle the callback
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            console.error('OAuth callback error:', error);
          } else {
            console.log('OAuth callback successful');
            // Clear the URL hash/search params
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (error) {
          console.error('Error processing OAuth callback:', error);
        }
      }
    };

    // Get initial session with better error handling
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        
        // Wait for OAuth callback handling to complete
        await handleOAuthCallback();
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }
        
        if (!mounted) return;
        
        setUser(session?.user ?? null)
        
        if (session?.user) {
          console.log('User found, fetching profile...');
          try {
            const userProfile = await AuthService.getCurrentUser()
            if (!mounted) return;
            
            setProfile(userProfile)
            setNeedsProfileSetup(!userProfile || !userProfile.role)
            console.log('Profile loaded:', { userProfile, needsSetup: !userProfile || !userProfile.role });
          } catch (profileError) {
            console.error('Error fetching user profile:', profileError);
            if (!mounted) return;
            // Don't clear the user, just indicate profile setup is needed
            setProfile(null)
            setNeedsProfileSetup(true)
          }
        } else {
          console.log('No user session found');
          if (!mounted) return;
          setProfile(null)
          setNeedsProfileSetup(false)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
        if (!mounted) return;
        // Only clear state if there's a real auth error, not a network issue
        if (error?.message?.includes('Invalid JWT') || error?.message?.includes('expired')) {
          setUser(null)
          setProfile(null)
          setNeedsProfileSetup(false)
        }
      } finally {
        if (mounted) {
          initializationComplete = true;
          console.log('Initial session loading complete');
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('Auth state change:', event, session?.user?.id)
      
      // Don't process auth state changes until initial session is loaded
      // This prevents race conditions during app startup
      if (!initializationComplete && event !== 'SIGNED_OUT') {
        console.log('Skipping auth state change - initialization not complete');
        return;
      }
      
      setUser(session?.user ?? null)
      
      if (session?.user) {
        try {
          const userProfile = await AuthService.getCurrentUser()
          if (!mounted) return;
          setProfile(userProfile)
          setNeedsProfileSetup(!userProfile || !userProfile.role)
        } catch (error) {
          console.error('Error fetching user profile:', error)
          if (!mounted) return;
          // Don't clear the user session, just indicate profile setup is needed
          setProfile(null)
          setNeedsProfileSetup(true)
        }
      } else {
        if (!mounted) return;
        setProfile(null)
        setNeedsProfileSetup(false)
      }
      
      if (mounted && initializationComplete) {
        setLoading(false)
      }
    })

    return () => {
      mounted = false;
      subscription.unsubscribe();
    }
  }, [])

  const signInWithGoogle = async () => {
    setLoading(true)
    try {
      await AuthService.signInWithGoogle()
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      await AuthService.signIn(email, password)
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signUp = async (email: string, password: string, userData: {
    name: string
    role: 'patient' | 'doctor'
    specialty?: string
    dateOfBirth?: string
    condition?: string
  }) => {
    setLoading(true)
    try {
      await AuthService.signUp(email, password, userData)
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await AuthService.signOut()
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      console.log('Refreshing profile for user:', user.id);
      const userProfile = await AuthService.getCurrentUser();
      setProfile(userProfile);
      setNeedsProfileSetup(!userProfile || !userProfile.role);
      console.log('Profile refreshed:', { userProfile, needsSetup: !userProfile || !userProfile.role });
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    needsProfileSetup,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}