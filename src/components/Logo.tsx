
import React from "react";

interface LogoProps {
  variant?: 'full' | 'icon';
  className?: string;
}

const Logo = ({ variant = 'full', className = '' }: LogoProps) => {
  const logoPath = variant === 'full' 
    ? "/lovable-uploads/156dcdac-5195-4555-92fe-fa51d205ed87.png" 
    : "/lovable-uploads/83865e71-5a08-4fb4-82c5-772c54a66bc5.png";

  return (
    <img 
      src={logoPath} 
      alt="Resonance Logo" 
      className={`resonance-logo ${className}`}
    />
  );
};

export default Logo;
