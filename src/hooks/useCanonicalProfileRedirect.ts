
import { useEffect } from "react";

// Typed to be used inside a React component
export function useCanonicalProfileRedirect(
  params: { [key: string]: string | undefined }, 
  location: { pathname: string; search: string }, 
  navigate: (to: string, opts?: { replace?: boolean }) => void
) {
  useEffect(() => {
    // Only redirect if loaded with a /profile/:userId route (legacy)
    if (location.pathname.startsWith("/profile/") && params.userId) {
      // Defer to dynamic import so supabase lib is not loaded on every render
      import("@/lib/supabase").then(({ supabase }) => {
        supabase
          .from('profiles')
          .select('username, user_type')
          .eq('id', params.userId)
          .maybeSingle()
          .then(({ data, error }) => {
            if (data && data.username) {
              const prefix = data.user_type === 'musician' ? 'm' : 'l';
              navigate(`/${prefix}/${data.username}${location.search}`, { replace: true });
            }
            // If not found, let downstream error handle
          });
      });
    }
  }, [params.userId, location.pathname, location.search, navigate]);
}
