import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { SupabaseProvider } from "@/lib/supabase-provider";
import { TranslationProvider } from "@/contexts/TranslationContext";
import { toast } from "sonner";

// Lazy load components for better performance
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Feed = lazy(() => import("./pages/Feed"));
const Profile = lazy(() => import("./pages/Profile"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Discover = lazy(() => import("./pages/Discover"));
const SearchPage = lazy(() => import("./pages/Search"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CreatePost = lazy(() => import("./pages/CreatePost"));
const Messages = lazy(() => import("./pages/Messages"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const SongDetails = lazy(() => import("@/pages/SongDetails"));
const ArtistDetails = lazy(() => import("@/pages/ArtistDetails"));
const AlbumDetails = lazy(() => import("@/pages/AlbumDetails"));
const Music = lazy(() => import("./pages/Music"));

// Lazy load other components - fix the import syntax for named exports
const BottomNavigation = lazy(() => import("./components/BottomNavigation").then(module => ({ default: module.BottomNavigation })));
const Navbar = lazy(() => import("./components/Navbar"));
const AuthenticatedRoute = lazy(() => import("./components/AuthenticatedRoute").then(module => ({ default: module.AuthenticatedRoute })));
const AdminProtectedRoute = lazy(() => import("./components/AdminProtectedRoute").then(module => ({ default: module.AdminProtectedRoute })));

// Create a Query Client with optimized config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
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
      <TranslationProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <div className="min-h-screen pb-20">
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                  <Routes>
                    {/* Admin routes - NO NAVBAR, NO BOTTOM NAV */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin/dashboard" element={
                      <AdminProtectedRoute>
                        <AdminDashboard />
                      </AdminProtectedRoute>
                    } />
                    
                    {/* Public routes without navbar */}
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms-of-service" element={<TermsOfService />} />
                    
                    {/* Protected routes with Navbar and Bottom Navigation */}
                    <Route path="/feed" element={
                      <AuthenticatedRoute>
                        <>
                          <Navbar />
                          <div className="pt-16 pb-16">
                            <Feed />
                          </div>
                          <BottomNavigation />
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
                          <BottomNavigation />
                        </>
                      </AuthenticatedRoute>
                    } />
                    <Route path="/music" element={
                      <AuthenticatedRoute>
                        <>
                          <Navbar />
                          <div className="pt-16 pb-16">
                            <Music />
                          </div>
                          <BottomNavigation />
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
                          <BottomNavigation />
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
                          <BottomNavigation />
                        </>
                      </AuthenticatedRoute>
                    } />
                    {/* REMOVED: <Route path="/profile/:userId" ... /> */}
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
                          <BottomNavigation />
                        </>
                      </AuthenticatedRoute>
                    } />

                    {/* Username-based profile routes ONLY */}
                    <Route path="/l/:username" element={
                      <AuthenticatedRoute>
                        <>
                          <Navbar />
                          <div className="pt-16 pb-16">
                            <UserProfile />
                          </div>
                          <BottomNavigation />
                        </>
                      </AuthenticatedRoute>
                    } />
                    <Route path="/m/:username" element={
                      <AuthenticatedRoute>
                        <>
                          <Navbar />
                          <div className="pt-16 pb-16">
                            <UserProfile />
                          </div>
                          <BottomNavigation />
                        </>
                      </AuthenticatedRoute>
                    } />

                    {/* Catch-all routes */}
                    <Route path="/song/:songTitle/:artist" element={<SongDetails />} />
                    <Route path="/artist/:artistName" element={<ArtistDetails />} />
                    <Route path="/album/:albumName/:artistName" element={<AlbumDetails />} />
                    <Route path="*" element={<NotFound />} />
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

export default App;
