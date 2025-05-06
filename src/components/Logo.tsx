
import React from "react";

interface LogoProps {
  variant?: 'full' | 'icon';
  className?: string;
}

const Logo = ({ variant = 'full', className = '' }: LogoProps) => {
  const logoPath = variant === 'full' 
    ? "/lovable-uploads/f88943c3-2040-4b4d-ba24-7ebdf825541b.png" 
    : "/lovable-uploads/e28a1c2c-395b-4ed6-93ca-2860228c51c4.png";

  return (
    <img 
      src={logoPath} 
      alt="Resonance Logo" 
      className={`resonance-logo ${className}`}
    />
  );
};

export default Logo;
