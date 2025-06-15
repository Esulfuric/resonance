
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { UserProfileContent } from "./UserProfileContent";
import { useCanonicalProfileRedirect } from "@/hooks/useCanonicalProfileRedirect";

// This page is only responsible for layout, routing logic, and guards
const UserProfile = () => {
  useAuthGuard();
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect any legacy id-based paths to username-based
  useCanonicalProfileRedirect(params, location, navigate);

  // The content component does the main data loading
  return <UserProfileContent />;
};

export default UserProfile;
