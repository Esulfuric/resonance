
import React from "react";
import { Separator } from "@/components/ui/separator";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuthLogin } from "@/hooks/use-auth-login";

const LoginOptimized = () => {
  const {
    email,
    password,
    loading,
    googleLoading,
    setEmail,
    setPassword,
    handleSubmit,
    handleGoogleSignIn
  } = useAuthLogin();

  return (
    <AuthLayout
      title="Sign In"
      description="Enter your email and password to access your account"
      footerText="Don't have an account?"
      footerLinkText="Sign up"
      footerLinkTo="/signup"
    >
      <GoogleSignInButton 
        onClick={handleGoogleSignIn} 
        loading={googleLoading} 
      />
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      
      <LoginForm
        email={email}
        password={password}
        loading={loading}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleSubmit}
      />
    </AuthLayout>
  );
};

export default LoginOptimized;
