
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes } from "react-router-dom";
import { Suspense, useEffect } from "react";
import { SupabaseProvider } from "@/lib/supabase-provider";
import { TranslationProvider } from "@/contexts/TranslationContext";
import { toast } from "sonner";
import { FullScreenLoader } from "@/components/ui/loading-state";
import { PublicRoutes } from "@/components/routing/PublicRoutes";
import { AdminRoutes } from "@/components/routing/AdminRoutes";
import { ProtectedRoutes } from "@/components/routing/ProtectedRoutes";
import { DetailRoutes } from "@/components/routing/DetailRoutes";

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
                <Suspense fallback={<FullScreenLoader message="Loading..." />}>
                  <Routes>
                    <AdminRoutes />
                    <PublicRoutes />
                    <ProtectedRoutes />
                    <DetailRoutes />
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
