
import React, { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { BottomNavigation } from "@/components/BottomNavigation";
import { AuthenticatedRouteOptimized } from "@/components/AuthenticatedRouteOptimized";
import { FullScreenLoader } from "@/components/ui/loading-state";

interface AppLayoutProps {
  children: React.ReactNode;
  hasNavbar?: boolean;
  hasBottomNav?: boolean;
  requiresAuth?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  hasNavbar = true, 
  hasBottomNav = true,
  requiresAuth = true 
}) => {
  const content = (
    <Suspense fallback={<FullScreenLoader />}>
      {hasNavbar && <Navbar />}
      <div className={`${hasNavbar ? 'pt-16' : ''} ${hasBottomNav ? 'pb-16' : ''}`}>
        {children}
      </div>
      {hasBottomNav && <BottomNavigation />}
    </Suspense>
  );

  if (requiresAuth) {
    return (
      <AuthenticatedRouteOptimized>
        {content}
      </AuthenticatedRouteOptimized>
    );
  }

  return content;
};

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AppLayout hasNavbar={false} hasBottomNav={false} requiresAuth={false}>
    {children}
  </AppLayout>
);

export const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AppLayout hasNavbar={true} hasBottomNav={true} requiresAuth={true}>
    {children}
  </AppLayout>
);
