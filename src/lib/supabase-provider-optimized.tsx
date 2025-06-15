
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { createUserProfile } from '@/services/auth/profileService';

type UserMetadata = {
  full_name?: string;
  username?: string;
  bio?: string;
  user_type?: 'musician' | 'listener';
  avatar_url?: string;
}

type SupabaseContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, metadata?: UserMetadata) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<void>;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProviderOptimized({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("SupabaseProvider initializing...");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      if (session) {
        localStorage.setItem('supabase.auth.token', JSON.stringify(session));
        
        if (event === 'SIGNED_IN' && session.user) {
          await createUserProfile(session.user);
        }
      } else {
        localStorage.removeItem('supabase.auth.token');
      }
    });
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Got initial session:", session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });
    
    const savedSession = localStorage.getItem('supabase.auth.token');
    if (savedSession) {
      try {
        const parsedSession = JSON.parse(savedSession);
        if (parsedSession) {
          console.log("Restored session from localStorage");
          setSession(parsedSession);
          setUser(parsedSession.user);
        }
      } catch (error) {
        console.error("Error parsing saved session:", error);
        localStorage.removeItem('supabase.auth.token');
      }
    }
    
    return () => {
      console.log("Unsubscribing from auth state changes");
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, metadata?: UserMetadata) => {
    console.log("Signing up with metadata:", metadata);
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/`,
      }
    });
    
    if (response.data?.user && !response.error) {
      await createUserProfile(response.data.user);
    }
    
    return response;
  };

  const signIn = async (email: string, password: string) => {
    console.log("Signing in:", email);
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signInWithGoogle = async () => {
    console.log("Signing in with Google");
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` }
    });
  };

  const signOut = async () => {
    console.log("Signing out");
    await supabase.auth.signOut();
    localStorage.removeItem('supabase.auth.token');
  };

  const value = {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

export const useSupabaseOptimized = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabaseOptimized must be used within a SupabaseProviderOptimized');
  }
  return context;
};
