
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import Discover from "./pages/Discover";
import SearchPage from "./pages/Search";
import NotFound from "./pages/NotFound";
import { MobileNavigation } from "./components/MobileNavigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { SupabaseProvider } from "@/lib/supabase-provider";
import { toast } from "sonner";

const queryClient = new QueryClient();

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
      toast.error(
        "Supabase configuration missing", 
        { 
          description: "Please make sure you've connected your project to Supabase through the Lovable integration.",
          duration: 10000,
        }
      );
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
            className="min-h-screen"
          >
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <MobileNavigation />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/feed" element={<Feed />} />
                <Route path="/discover" element={<Discover />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/profile" element={<Profile />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </motion.div>
        </TooltipProvider>
      </QueryClientProvider>
    </SupabaseProvider>
  );
};

export default App;
