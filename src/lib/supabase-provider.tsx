
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

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

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("SupabaseProvider initializing...");
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      // Check if user is banned before allowing session
      if (session?.user) {
        try {
          const { data: isBanned } = await supabase.rpc('is_user_banned', {
            user_id_param: session.user.id
          });
          
          if (isBanned) {
            console.log("User is banned, signing out");
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error("Error checking ban status:", error);
        }
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      // Store session in localStorage for persistence
      if (session) {
        localStorage.setItem('supabase.auth.token', JSON.stringify(session));
        
        // Create profile if it doesn't exist (for Google OAuth users)
        if (event === 'SIGNED_IN' && session.user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .single();
          
          if (error && error.code === 'PGRST116') {
            // Profile doesn't exist, create it
            const { error: insertError } = await supabase.from('profiles').insert({
              id: session.user.id,
              username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'user',
              full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
              bio: session.user.user_metadata?.bio || '',
              avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '',
              user_type: session.user.user_metadata?.user_type || 'listener',
              updated_at: new Date().toISOString(),
            });
            
            if (insertError) {
              console.error("Error creating profile:", insertError);
            }
          }
        }
      } else {
        localStorage.removeItem('supabase.auth.token');
      }
    });
    
    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Got initial session:", session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });
    
    // Try to restore session from localStorage if available
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
    
    // If successful signup and we have user data, create a profile
    if (response.data?.user && !response.error) {
      try {
        const { error } = await supabase.from('profiles').insert({
          id: response.data.user.id,
          username: metadata?.username || email.split('@')[0],
          full_name: metadata?.full_name || '',
          bio: metadata?.bio || '',
          avatar_url: metadata?.avatar_url || '',
          user_type: metadata?.user_type || 'listener',
          updated_at: new Date().toISOString(),
        });
        
        if (error) throw error;
      } catch (error) {
        console.error("Error creating profile:", error);
      }
    }
    
    return response;
  };

  const signIn = async (email: string, password: string) => {
    console.log("Signing in:", email);
    return supabase.auth.signInWithPassword({
      email,
      password
    });
  };

  const signInWithGoogle = async () => {
    console.log("Signing in with Google");
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'resonance://auth'
      }
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

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};
