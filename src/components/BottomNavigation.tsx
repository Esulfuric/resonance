
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Plus, Music, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSupabase } from '@/lib/supabase-provider';

export const BottomNavigation = () => {
  const location = useLocation();
  const { user } = useSupabase();
  
  // Don't show bottom nav if not authenticated
  if (!user) return null;

  // Don't show on auth pages
  const authRoutes = ['/login', '/signup', '/forgot-password'];
  if (authRoutes.includes(location.pathname)) return null;

  const navItems = [
    { icon: Home, path: '/feed', label: 'Home' },
    { icon: Search, path: '/search', label: 'Search' },
    { path: '/create-post', label: 'Create', isMain: true },
    { icon: Music, path: '/music', label: 'Music' },
    { icon: User, path: '/profile', label: 'Profile' }
  ];

  const isActive = (path: string) => location.pathname === path;
  const isMusicPage = location.pathname === '/music';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 px-2 pb-safe">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {navItems.map((item, index) => (
          item.isMain ? (
            <Link key={item.path} to={item.path} className="relative -mt-6">
              <Button 
                className={cn(
                  "h-14 w-14 rounded-full shadow-lg",
                  isMusicPage 
                    ? "bg-resonance-orange hover:bg-resonance-orange/90" 
                    : "bg-resonance-green hover:bg-resonance-green/90"
                )}
                aria-label={item.label}
              >
                <Plus className="h-6 w-6 text-white" />
              </Button>
            </Link>
          ) : (
            <Link 
              key={item.path} 
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 transition-all duration-300",
                isActive(item.path) 
                  ? isMusicPage 
                    ? "text-resonance-orange scale-110" 
                    : "text-primary scale-110"
                  : "text-muted-foreground"
              )}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ 
                  scale: isActive(item.path) ? 1.1 : 0.8,
                  rotateY: isActive(item.path) && item.path === '/music' ? 360 : 0
                }}
                transition={{ 
                  duration: 0.3,
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }}
              >
                {item.icon && <item.icon className="h-6 w-6" />}
              </motion.div>
              <span className="text-xs mt-1">{item.label}</span>
              {isActive(item.path) && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  className={cn(
                    "h-0.5 rounded-full mt-1",
                    isMusicPage ? "bg-resonance-orange" : "bg-primary"
                  )}
                />
              )}
            </Link>
          )
        ))}
      </div>
    </div>
  );
};
