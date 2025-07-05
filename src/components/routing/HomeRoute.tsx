import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useSupabase } from "@/lib/supabase-provider";
import { pages } from "@/config/routes";
import { FullScreenLoader } from "@/components/ui/loading-state";

export const HomeRoute = () => {
  const { user, isLoading } = useSupabase();

  if (isLoading) {
    return <FullScreenLoader message="Loading..." />;
  }

  if (user) {
    return <Navigate to="/feed" replace />;
  }

  return <pages.Index />;
};