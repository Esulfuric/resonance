
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Logo from "@/components/Logo";

interface AuthLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footerText?: string;
  footerLinkText?: string;
  footerLinkTo?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  description,
  children,
  footerText,
  footerLinkText,
  footerLinkTo
}) => (
  <div className="min-h-screen flex flex-col items-center justify-center resonance-hero p-4 md:p-0">
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <Link to="/">
          <Logo className="h-12 mx-auto mb-4" />
        </Link>
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-gray-500">Sign in to continue to Resonance</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {children}
        </CardContent>
        {footerText && footerLinkText && footerLinkTo && (
          <CardFooter className="flex flex-col">
            <div className="text-center text-sm">
              {footerText}{" "}
              <Link to={footerLinkTo} className="text-resonance-green hover:underline">
                {footerLinkText}
              </Link>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  </div>
);
