
import React from "react";
import { Route } from "react-router-dom";
import { pages, components } from "@/config/routes";
import { AuthenticatedLayout } from "@/components/layout/AppLayout";

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
  </>
);
