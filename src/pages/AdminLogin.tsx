
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@resonance.app');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Attempting admin login with Supabase Auth...');
      
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (authError) {
        console.error('Auth error:', authError);
        toast.error(`Login failed: ${authError.message}`);
        return;
      }

      if (!authData.user) {
        toast.error('Login failed: No user data returned');
        return;
      }

      console.log('Auth successful, checking admin access...');

      // Check if the user is an admin
      const { data: adminCheck, error: adminError } = await supabase.rpc('check_admin_access');

      if (adminError) {
        console.error('Admin check error:', adminError);
        // Sign out the user since they're not admin
        await supabase.auth.signOut();
        toast.error('Access denied: Admin privileges required');
        return;
      }

      // Type cast the Json response to access properties
      const adminResponse = adminCheck as { success?: boolean; is_admin?: boolean; email?: string; error?: string };

      if (!adminResponse?.success || !adminResponse?.is_admin) {
        console.log('User is not admin:', adminResponse);
        // Sign out the user since they're not admin
        await supabase.auth.signOut();
        toast.error('Access denied: Admin privileges required');
        return;
      }

      // Store admin session info
      const adminSession = {
        isAdmin: true,
        userId: authData.user.id,
        email: authData.user.email,
        timestamp: new Date().toISOString()
      };

      localStorage.setItem('adminSession', JSON.stringify(adminSession));
      toast.success(`Welcome, Admin!`);
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Admin Access</CardTitle>
          <CardDescription>
            Sign in to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>Use the admin account created in Supabase Auth</p>
            <p className="text-xs mt-1">Email: admin@resonance.app</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
