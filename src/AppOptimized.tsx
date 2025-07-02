
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, useEffect, useState } from "react";
import { SupabaseProvider } from "@/lib/supabase-provider";
import { TranslationProvider } from "@/contexts/TranslationContext";
import { toast } from "sonner";
import { FullScreenLoader } from "@/components/ui/loading-state";
import { PublicRoutes } from "@/components/routing/PublicRoutes";
import { AdminRoutes } from "@/components/routing/AdminRoutes";
import { DetailRoutes } from "@/components/routing/DetailRoutes";
import { pages, components } from "@/config/routes";
import { AuthenticatedLayout } from "@/components/layout/AppLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
    mutations: {
      onError: (error: any) => {
        console.error('Mutation error:', error);
        toast.error("Action Failed", {
          description: error.message || "There was a problem with your request",
        });
      }
    }
  }
});

const AppOptimized = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Theme initialization
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        }

        // Environment validation
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseAnonKey) {
          console.warn("Supabase configuration missing in environment variables");
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('App initialization error:', error);
        setIsInitialized(true); // Still set to true to allow app to render
      }
    };

    initializeApp();
  }, []);

  if (!isInitialized) {
    return <FullScreenLoader message="Initializing app..." />;
  }

  return (
    <ErrorBoundary onError={(error, errorInfo) => {
      console.error('App-level error:', { error, errorInfo });
      // Could add error reporting service here
    }}>
      <SupabaseProvider>
        <TranslationProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <div className="min-h-screen pb-20">
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <ErrorBoundary>
                    <Suspense fallback={<FullScreenLoader message="Loading page..." />}>
                      <Routes>
                        <AdminRoutes />
                        
                        {/* Simplified protected routes with individual error boundaries */}
                        <Route path="/feed" element={
                          <ErrorBoundary>
                            <AuthenticatedLayout>
                              <pages.Feed />
                            </AuthenticatedLayout>
                          </ErrorBoundary>
                        } />
                        <Route path="/discover" element={
                          <ErrorBoundary>
                            <AuthenticatedLayout>
                              <pages.Discover />
                            </AuthenticatedLayout>
                          </ErrorBoundary>
                        } />
                        <Route path="/music" element={
                          <ErrorBoundary>
                            <AuthenticatedLayout>
                              <pages.MusicOptimized />
                            </AuthenticatedLayout>
                          </ErrorBoundary>
                        } />
                        <Route path="/search" element={
                          <ErrorBoundary>
                            <AuthenticatedLayout>
                              <pages.SearchPage />
                            </AuthenticatedLayout>
                          </ErrorBoundary>
                        } />
                        <Route path="/profile" element={
                          <ErrorBoundary>
                            <AuthenticatedLayout>
                              <pages.Profile />
                            </AuthenticatedLayout>
                          </ErrorBoundary>
                        } />
                        <Route path="/l/:username" element={
                          <ErrorBoundary>
                            <AuthenticatedLayout>
                              <pages.UserProfile />
                            </AuthenticatedLayout>
                          </ErrorBoundary>
                        } />
                        <Route path="/m/:username" element={
                          <ErrorBoundary>
                            <AuthenticatedLayout>
                              <pages.UserProfile />
                            </AuthenticatedLayout>
                          </ErrorBoundary>
                        } />
                        <Route path="/messages" element={
                          <ErrorBoundary>
                            <AuthenticatedLayout>
                              <pages.Messages />
                            </AuthenticatedLayout>
                          </ErrorBoundary>
                        } />
                        <Route path="/create-post" element={
                          <ErrorBoundary>
                            <components.AuthenticatedRouteOptimized>
                              <pages.CreatePost />
                            </components.AuthenticatedRouteOptimized>
                          </ErrorBoundary>
                        } />

                        <PublicRoutes />
                        <DetailRoutes />
                        <Route path="*" element={
                          <ErrorBoundary>
                            <pages.NotFound />
                          </ErrorBoundary>
                        } />
                      </Routes>
                    </Suspense>
                  </ErrorBoundary>
                </BrowserRouter>
              </div>
            </TooltipProvider>
          </QueryClientProvider>
        </TranslationProvider>
      </SupabaseProvider>
    </ErrorBoundary>
  );
};

export default AppOptimized;
