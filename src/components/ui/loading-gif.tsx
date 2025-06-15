
import React from "react";

interface LoadingGifProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function LoadingGif({ size = "md", className = "" }: LoadingGifProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12", 
    lg: "h-16 w-16",
    xl: "h-24 w-24"
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        <img 
          src="/lovable-uploads/978aa419-c18a-44c6-9108-445c605acda0.png"
          alt="Loading..."
          className={`${sizeClasses[size]} animate-spin`}
          style={{
            animation: "spin 1s linear infinite"
          }}
        />
        {/* Pulse effect overlay */}
        <div 
          className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-resonance-green opacity-20 animate-pulse`}
        />
      </div>
    </div>
  );
}
