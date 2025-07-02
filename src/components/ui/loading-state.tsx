
import React from "react";
import { LoadingGif } from "./loading-gif";

interface LoadingStateProps {
  size?: "sm" | "md" | "lg" | "xl";
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  size = "md", 
  message = "Loading...", 
  className = "" 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 py-8 ${className}`}>
      <LoadingGif size={size} />
      <p className="text-muted-foreground animate-pulse">{message}</p>
    </div>
  );
};

export const FullScreenLoader: React.FC<LoadingStateProps> = ({ 
  size = "lg", 
  message = "Loading...", 
  className = "" 
}) => {
  return (
    <div className={`flex items-center justify-center h-screen bg-background ${className}`}>
      <div className="text-center">
        <LoadingState size={size} message={message} />
      </div>
    </div>
  );
};
