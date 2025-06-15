
import React from "react";
import { Route } from "react-router-dom";
import { pages, components } from "@/config/routes";

export const AdminRoutes = () => (
  <>
    <Route path="/admin/login" element={<pages.AdminLogin />} />
    <Route path="/admin/dashboard" element={
      <components.AdminProtectedRoute>
        <pages.AdminDashboard />
      </components.AdminProtectedRoute>
    } />
  </>
);
