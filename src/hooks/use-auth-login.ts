
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSupabase } from "@/lib/supabase-provider";

export const useAuthLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signInWithGoogle, user } = useSupabase();

  useEffect(() => {
    if (user) {
      const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/feed';
      sessionStorage.removeItem('redirectAfterLogin');
      navigate(redirectPath);
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) throw error;
      
      toast({
        title: "Login successful",
        description: "Welcome back to Resonance!",
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    
    try {
      const { error } = await signInWithGoogle();
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Google login failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
      setGoogleLoading(false);
    }
  };

  return {
    email,
    password,
    loading,
    googleLoading,
    setEmail,
    setPassword,
    handleSubmit,
    handleGoogleSignIn
  };
};
