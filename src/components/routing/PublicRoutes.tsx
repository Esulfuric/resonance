
import React from "react";
import { Route } from "react-router-dom";
import { pages } from "@/config/routes";

export const PublicRoutes = () => (
  <>
    <Route path="/" element={<pages.Index />} />
    <Route path="/login" element={<pages.Login />} />
    <Route path="/signup" element={<pages.Signup />} />
    <Route path="/forgot-password" element={<pages.ForgotPassword />} />
    <Route path="/privacy-policy" element={<pages.PrivacyPolicy />} />
    <Route path="/terms-of-service" element={<pages.TermsOfService />} />
  </>
);
