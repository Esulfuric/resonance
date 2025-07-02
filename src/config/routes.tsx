
import { lazy } from "react";

// Lazy load all pages with proper error boundaries
export const pages = {
  Index: lazy(() => import("../pages/Index").then(module => ({ default: module.default }))),
  Login: lazy(() => import("../pages/Login").then(module => ({ default: module.default }))),
  Signup: lazy(() => import("../pages/Signup").then(module => ({ default: module.default }))),
  ForgotPassword: lazy(() => import("../pages/ForgotPassword").then(module => ({ default: module.default }))),
  Feed: lazy(() => import("../pages/Feed").then(module => ({ default: module.default }))),
  Profile: lazy(() => import("../pages/Profile").then(module => ({ default: module.default }))),
  UserProfile: lazy(() => import("../pages/UserProfile").then(module => ({ default: module.default }))),
  Discover: lazy(() => import("../pages/Discover").then(module => ({ default: module.default }))),
  SearchPage: lazy(() => import("../pages/Search").then(module => ({ default: module.default }))),
  NotFound: lazy(() => import("../pages/NotFound").then(module => ({ default: module.default }))),
  CreatePost: lazy(() => import("../pages/CreatePost").then(module => ({ default: module.default }))),
  Messages: lazy(() => import("../pages/Messages").then(module => ({ default: module.default }))),
  PrivacyPolicy: lazy(() => import("../pages/PrivacyPolicy").then(module => ({ default: module.default }))),
  TermsOfService: lazy(() => import("../pages/TermsOfService").then(module => ({ default: module.default }))),
  AdminLogin: lazy(() => import("../pages/AdminLogin").then(module => ({ default: module.default }))),
  AdminDashboard: lazy(() => import("../pages/AdminDashboard").then(module => ({ default: module.default }))),
  SongDetails: lazy(() => import("@/pages/SongDetails").then(module => ({ default: module.default }))),
  ArtistDetails: lazy(() => import("@/pages/ArtistDetails").then(module => ({ default: module.default }))),
  AlbumDetails: lazy(() => import("@/pages/AlbumDetails").then(module => ({ default: module.default }))),
  MusicOptimized: lazy(() => import("../pages/MusicOptimized").then(module => ({ default: module.default }))),
};

// Lazy load components with proper error boundaries
export const components = {
  BottomNavigation: lazy(() => import("../components/BottomNavigation").then(module => ({ default: module.BottomNavigation }))),
  Navbar: lazy(() => import("../components/Navbar").then(module => ({ default: module.default }))),
  AuthenticatedRouteOptimized: lazy(() => import("../components/AuthenticatedRouteOptimized").then(module => ({ default: module.AuthenticatedRouteOptimized }))),
  AdminProtectedRoute: lazy(() => import("../components/AdminProtectedRoute").then(module => ({ default: module.AdminProtectedRoute }))),
};
