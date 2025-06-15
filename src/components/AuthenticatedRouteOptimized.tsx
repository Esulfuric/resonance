
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSupabase } from "@/lib/supabase-provider";
import { FullScreenLoader } from "@/components/ui/loading-state";

type AuthenticatedRouteProps = {
  children: ReactNode;
}

export const AuthenticatedRouteOptimized = ({ children }: AuthenticatedRouteProps) => {
  const { user, isLoading } = useSupabase();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    if (!isLoading) {
      setIsChecking(false);
    }
  }, [isLoading]);

  if (isLoading || isChecking) {
    return <FullScreenLoader message="Authenticating..." />;
  }
  
  if (!user) {
    sessionStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
