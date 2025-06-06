
import React from "react";
import { useLocation } from "react-router-dom";

interface LogoProps {
  variant?: 'full' | 'icon';
  className?: string;
  size?: 'normal' | 'large';
}

const Logo = ({ variant = 'full', className = '', size = 'normal' }: LogoProps) => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const isMusicPage = location.pathname === '/music';
  
  // Use large size on landing page
  const effectiveSize = isLandingPage ? 'large' : size;
  
  // Use music logo on music page, otherwise use regular logo
  const logoPath = isMusicPage 
    ? "/lovable-uploads/07306d03-87f8-43dc-910e-9ad22a16ef49.png"
    : variant === 'full' 
      ? "/lovable-uploads/f88943c3-2040-4b4d-ba24-7ebdf825541b.png" 
      : "/lovable-uploads/e28a1c2c-395b-4ed6-93ca-2860228c51c4.png";

  // Apply different size classes based on effectiveSize
  const sizeClass = effectiveSize === 'large' 
    ? "h-20 md:h-28" // Increased from h-16 md:h-20 for a larger logo
    : "h-8 md:h-10"; // Normal size logo

  return (
    <img 
      src={logoPath} 
      alt="Resonance Logo" 
      className={`resonance-logo ${sizeClass} ${className}`}
    />
  );
};

export default Logo;
