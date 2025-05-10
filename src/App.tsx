
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Discover from "./pages/Discover";
import SearchPage from "./pages/Search";
import NotFound from "./pages/NotFound";
import CreatePost from "./pages/CreatePost";
import Messages from "./pages/Messages";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import { BottomNavigation } from "./components/BottomNavigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { SupabaseProvider } from "@/lib/supabase-provider";
import { toast } from "sonner";
import Navbar from "./components/Navbar";
import { AuthenticatedRoute } from "./components/AuthenticatedRoute";

// Create a Query Client with proper config for better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
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

const App = () => {
  // Check for saved theme preference or use system preference
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

    // Check if Supabase environment variables are missing
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Supabase configuration missing in environment variables");
    }
  }, []);

  return (
    <SupabaseProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen pb-20" 
          >
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                
                {/* Protected routes with Navbar */}
                <Route path="/feed" element={
                  <AuthenticatedRoute>
                    <>
                      <Navbar />
                      <div className="pt-16 pb-16">
                        <Feed />
                      </div>
                    </>
                  </AuthenticatedRoute>
                } />
                <Route path="/discover" element={
                  <AuthenticatedRoute>
                    <>
                      <Navbar />
                      <div className="pt-16 pb-16">
                        <Discover />
                      </div>
                    </>
                  </AuthenticatedRoute>
                } />
                <Route path="/search" element={
                  <AuthenticatedRoute>
                    <>
                      <Navbar />
                      <div className="pt-16 pb-16">
                        <SearchPage />
                      </div>
                    </>
                  </AuthenticatedRoute>
                } />
                <Route path="/profile" element={
                  <AuthenticatedRoute>
                    <>
                      <Navbar />
                      <div className="pt-16 pb-16">
                        <Profile />
                      </div>
                    </>
                  </AuthenticatedRoute>
                } />
                <Route path="/profile/:userId" element={
                  <AuthenticatedRoute>
                    <>
                      <Navbar />
                      <div className="pt-16 pb-16">
                        <UserProfile />
                      </div>
                    </>
                  </AuthenticatedRoute>
                } />
                <Route path="/create-post" element={
                  <AuthenticatedRoute>
                    <CreatePost />
                  </AuthenticatedRoute>
                } />
                <Route path="/messages" element={
                  <AuthenticatedRoute>
                    <>
                      <Navbar />
                      <div className="pt-16 pb-16">
                        <Messages />
                      </div>
                    </>
                  </AuthenticatedRoute>
                } />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <BottomNavigation />
            </BrowserRouter>
          </motion.div>
        </TooltipProvider>
      </QueryClientProvider>
    </SupabaseProvider>
  );
};

export default App;
