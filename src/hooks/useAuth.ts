// useAuth hook - Authentication management
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // DEV MODE: Check for dev bypass session (localhost only)
    if (window.location.hostname === 'localhost') {
      const devSession = localStorage.getItem('supabase.auth.token');
      if (devSession) {
        try {
          const parsed = JSON.parse(devSession);
          if (parsed.access_token === 'dev-bypass-token') {
            console.log('🔧 DEV MODE: Using bypass session');
            setUser(parsed.user as User);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          // Invalid dev session, continue with normal auth
        }
      }
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      console.error('Error signing in with Google:', error.message);
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    }
    setIsLoading(false);
  };

  const getUser = () => user;

  return {
    user,
    isLoading,
    signInWithGoogle,
    signOut,
    getUser,
  };
}

