
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginFormProps {
  email: string;
  password: string;
  loading: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  email,
  password,
  loading,
  onEmailChange,
  onPasswordChange,
  onSubmit
}) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        placeholder="example@email.com"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        required
      />
    </div>
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="password">Password</Label>
        <Link to="/forgot-password" className="text-xs text-resonance-green hover:underline">
          Forgot password?
        </Link>
      </div>
      <Input
        id="password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        required
      />
    </div>
    <Button
      type="submit"
      className="w-full bg-resonance-green hover:bg-resonance-green/90"
      disabled={loading}
    >
      {loading ? "Signing in..." : "Sign In"}
    </Button>
  </form>
);
