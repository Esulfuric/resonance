
import React from "react";
import { Route } from "react-router-dom";
import { pages, components } from "@/config/routes";
import { AuthenticatedLayout } from "@/components/layout/AppLayout";

// Ensure these routes come BEFORE any catch-all route ("*")
export const ProtectedRoutes = () => (
  <>
    <Route path="/feed" element={
      <AuthenticatedLayout>
        <pages.Feed />
      </AuthenticatedLayout>
    } />
    <Route path="/discover" element={
      <AuthenticatedLayout>
        <pages.Discover />
      </AuthenticatedLayout>
    } />
    <Route path="/music" element={
      <AuthenticatedLayout>
        <pages.MusicOptimized />
      </AuthenticatedLayout>
    } />
    <Route path="/search" element={
      <AuthenticatedLayout>
        <pages.SearchPage />
      </AuthenticatedLayout>
    } />
    <Route path="/profile" element={
      <AuthenticatedLayout>
        <pages.Profile />
      </AuthenticatedLayout>
    } />
    <Route path="/profile/:userId" element={
      <AuthenticatedLayout>
        <pages.UserProfile />
      </AuthenticatedLayout>
    } />
    {/* Username-based routes -- these must come BEFORE any catch-all route */}
    <Route path="/l/:username" element={
      <AuthenticatedLayout>
        <pages.UserProfile />
      </AuthenticatedLayout>
    } />
    <Route path="/m/:username" element={
      <AuthenticatedLayout>
        <pages.UserProfile />
      </AuthenticatedLayout>
    } />
    <Route path="/messages" element={
      <AuthenticatedLayout>
        <pages.Messages />
      </AuthenticatedLayout>
    } />
    <Route path="/create-post" element={
      <components.AuthenticatedRouteOptimized>
        <pages.CreatePost />
      </components.AuthenticatedRouteOptimized>
    } />
    {/* NOTE: Do NOT add a catch-all * route here! It should only go in your top-level router! */}
  </>
);
