import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, useEffect } from "react";
import { SupabaseProvider } from "@/lib/supabase-provider";
import { TranslationProvider } from "@/contexts/TranslationContext";
import { toast } from "sonner";
import { FullScreenLoader } from "@/components/ui/loading-state";
import { PublicRoutes } from "@/components/routing/PublicRoutes";
import { AdminRoutes } from "@/components/routing/AdminRoutes";
import { DetailRoutes } from "@/components/routing/DetailRoutes";
import { pages, components } from "@/config/routes";
import { AuthenticatedLayout } from "@/components/layout/AppLayout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
    mutations: {
      onError: (error: any) => {
        toast.error("Action Failed", {
          description: error.message || "There was a problem with your request",
        });
      }
    }
  }
});

const AppOptimized = () => {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Supabase configuration missing in environment variables");
    }
  }, []);

  return (
    <SupabaseProvider>
      <TranslationProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <div className="min-h-screen pb-20">
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Suspense fallback={<FullScreenLoader message="Loading page..." />}>
                  <Routes>
                    <AdminRoutes />
                    
                    {/* Simplified protected routes */}
                    <Route path="/feed" element={<AuthenticatedLayout><pages.Feed /></AuthenticatedLayout>} />
                    <Route path="/discover" element={<AuthenticatedLayout><pages.Discover /></AuthenticatedLayout>} />
                    <Route path="/music" element={<AuthenticatedLayout><pages.MusicOptimized /></AuthenticatedLayout>} />
                    <Route path="/search" element={<AuthenticatedLayout><pages.SearchPage /></AuthenticatedLayout>} />
                    <Route path="/profile" element={<AuthenticatedLayout><pages.Profile /></AuthenticatedLayout>} />
                    <Route path="/l/:username" element={<AuthenticatedLayout><pages.UserProfile /></AuthenticatedLayout>} />
                    <Route path="/m/:username" element={<AuthenticatedLayout><pages.UserProfile /></AuthenticatedLayout>} />
                    <Route path="/messages" element={<AuthenticatedLayout><pages.Messages /></AuthenticatedLayout>} />
                    <Route path="/create-post" element={<components.AuthenticatedRouteOptimized><pages.CreatePost /></components.AuthenticatedRouteOptimized>} />

                    <PublicRoutes />
                    <DetailRoutes />
                    <Route path="*" element={<pages.NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </div>
          </TooltipProvider>
        </QueryClientProvider>
      </TranslationProvider>
    </SupabaseProvider>
  );
};

export default AppOptimized;
