
import React from "react";
import { Route } from "react-router-dom";
import { pages } from "@/config/routes";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";

export const AdminRoutes = () => (
  <>
    <Route path="/admin/login" element={<pages.AdminLogin />} />
    <Route path="/admin/dashboard" element={
      <AdminProtectedRoute>
        <pages.AdminDashboard />
      </AdminProtectedRoute>
    } />
  </>
);
