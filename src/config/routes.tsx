
import { lazy } from "react";

// Create a wrapper for lazy loading with better error handling
const createLazyComponent = (importFn: () => Promise<any>, fallback?: React.ComponentType) => {
  return lazy(async () => {
    try {
      const module = await importFn();
      // Ensure we have a valid default export
      if (!module.default) {
        throw new Error('Module does not have a default export');
      }
      return { default: module.default };
    } catch (error) {
      console.error('Error loading component:', error);
      // Return a fallback component if loading fails
      if (fallback) {
        return { default: fallback };
      }
      // Return a basic error component
      return { 
        default: () => (
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Loading Error</h2>
              <p className="text-muted-foreground">Failed to load component</p>
            </div>
          </div>
        )
      };
    }
  });
};

// Lazy load all pages with proper error boundaries
export const pages = {
  Index: createLazyComponent(() => import("../pages/Index")),
  Login: createLazyComponent(() => import("../pages/Login")),
  Signup: createLazyComponent(() => import("../pages/Signup")),
  ForgotPassword: createLazyComponent(() => import("../pages/ForgotPassword")),
  Feed: createLazyComponent(() => import("../pages/Feed")),
  Profile: createLazyComponent(() => import("../pages/Profile")),
  UserProfile: createLazyComponent(() => import("../pages/UserProfile")),
  Discover: createLazyComponent(() => import("../pages/Discover")),
  SearchPage: createLazyComponent(() => import("../pages/Search")),
  NotFound: createLazyComponent(() => import("../pages/NotFound")),
  CreatePost: createLazyComponent(() => import("../pages/CreatePost")),
  Messages: createLazyComponent(() => import("../pages/Messages")),
  PrivacyPolicy: createLazyComponent(() => import("../pages/PrivacyPolicy")),
  TermsOfService: createLazyComponent(() => import("../pages/TermsOfService")),
  AdminLogin: createLazyComponent(() => import("../pages/AdminLogin")),
  AdminDashboard: createLazyComponent(() => import("../pages/AdminDashboard")),
  SongDetails: createLazyComponent(() => import("@/pages/SongDetails")),
  ArtistDetails: createLazyComponent(() => import("@/pages/ArtistDetails")),
  AlbumDetails: createLazyComponent(() => import("@/pages/AlbumDetails")),
  MusicOptimized: createLazyComponent(() => import("../pages/MusicOptimized")),
};

// Lazy load components with proper error boundaries
export const components = {
  BottomNavigation: createLazyComponent(() => import("../components/BottomNavigation").then(module => ({ default: module.BottomNavigation }))),
  Navbar: createLazyComponent(() => import("../components/Navbar")),
  AuthenticatedRouteOptimized: createLazyComponent(() => import("../components/AuthenticatedRouteOptimized").then(module => ({ default: module.AuthenticatedRouteOptimized }))),
  AdminProtectedRoute: createLazyComponent(() => import("../components/AdminProtectedRoute").then(module => ({ default: module.AdminProtectedRoute }))),
};
