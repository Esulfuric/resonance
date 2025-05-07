
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSupabase } from '@/lib/supabase-provider';

export function useAuthGuard(redirectTo = '/login') {
  const { user, isLoading } = useSupabase();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Skip redirection for public routes
    const publicRoutes = ['/login', '/signup', '/forgot-password', '/'];
    const isPublicRoute = publicRoutes.includes(location.pathname);

    if (!isLoading && !user && !isPublicRoute) {
      // Store the intended path for redirect after login
      sessionStorage.setItem('redirectAfterLogin', location.pathname);
      navigate(redirectTo);
    }
  }, [user, isLoading, navigate, redirectTo, location]);

  return { user, isLoading };
}
