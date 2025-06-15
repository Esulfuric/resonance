
import { lazy } from "react";

// Lazy load all pages
export const pages = {
  Index: lazy(() => import("../pages/Index")),
  Login: lazy(() => import("../pages/Login")),
  Signup: lazy(() => import("../pages/Signup")),
  ForgotPassword: lazy(() => import("../pages/ForgotPassword")),
  Feed: lazy(() => import("../pages/Feed")),
  Profile: lazy(() => import("../pages/Profile")),
  UserProfile: lazy(() => import("../pages/UserProfile")),
  Discover: lazy(() => import("../pages/Discover")),
  SearchPage: lazy(() => import("../pages/Search")),
  NotFound: lazy(() => import("../pages/NotFound")),
  CreatePost: lazy(() => import("../pages/CreatePost")),
  Messages: lazy(() => import("../pages/Messages")),
  PrivacyPolicy: lazy(() => import("../pages/PrivacyPolicy")),
  TermsOfService: lazy(() => import("../pages/TermsOfService")),
  AdminLogin: lazy(() => import("../pages/AdminLogin")),
  AdminDashboard: lazy(() => import("../pages/AdminDashboard")),
  SongDetails: lazy(() => import("@/pages/SongDetails")),
  ArtistDetails: lazy(() => import("@/pages/ArtistDetails")),
  AlbumDetails: lazy(() => import("@/pages/AlbumDetails")),
  MusicOptimized: lazy(() => import("../pages/MusicOptimized")),
};

// Lazy load components
export const components = {
  BottomNavigation: lazy(() => import("../components/BottomNavigation").then(module => ({ default: module.BottomNavigation }))),
  Navbar: lazy(() => import("../components/Navbar")),
  AuthenticatedRouteOptimized: lazy(() => import("../components/AuthenticatedRouteOptimized").then(module => ({ default: module.AuthenticatedRouteOptimized }))),
  AdminProtectedRoute: lazy(() => import("../components/AdminProtectedRoute").then(module => ({ default: module.AdminProtectedRoute }))),
};
