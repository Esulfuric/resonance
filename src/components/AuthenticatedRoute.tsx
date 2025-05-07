
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSupabase } from "@/lib/supabase-provider";

type AuthenticatedRouteProps = {
  children: ReactNode;
}

export const AuthenticatedRoute = ({ children }: AuthenticatedRouteProps) => {
  const { user, isLoading } = useSupabase();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    // When we know the authentication state, we can stop checking
    if (!isLoading) {
      setIsChecking(false);
    }
  }, [isLoading]);

  // Show loading state while checking auth
  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!user) {
    // Store the current location to redirect back after login
    sessionStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the protected route
  return <>{children}</>;
};
