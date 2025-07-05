
import React from "react";
import { Route } from "react-router-dom";
import { pages } from "@/config/routes";
import { HomeRoute } from "./HomeRoute";

export const PublicRoutes = () => (
  <>
    <Route path="/" element={<HomeRoute />} />
    <Route path="/login" element={<pages.Login />} />
    <Route path="/signup" element={<pages.Signup />} />
    <Route path="/forgot-password" element={<pages.ForgotPassword />} />
    <Route path="/privacy-policy" element={<pages.PrivacyPolicy />} />
    <Route path="/terms-of-service" element={<pages.TermsOfService />} />
  </>
);
