
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateAdminSession = () => {
      const adminSession = localStorage.getItem('adminSession');
      
      if (!adminSession) {
        navigate('/admin/login');
        return;
      }

      try {
        const session = JSON.parse(adminSession);
        if (!session.isAdmin) {
          navigate('/admin/login');
          return;
        }
        
        setIsValidating(false);
      } catch (error) {
        console.error('Invalid admin session:', error);
        localStorage.removeItem('adminSession');
        navigate('/admin/login');
      }
    };

    validateAdminSession();
  }, [navigate]);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 animate-pulse text-muted-foreground" />
          <p>Validating admin access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
