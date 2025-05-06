import { Link } from 'react-router-dom';
import { Bell, Home, Search, User, Music, LogOut } from 'lucide-react';
import Logo from './Logo';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useIsMobile } from '@/hooks/use-mobile';
import { MusicPlayer } from './MusicPlayer';
import { ThemeToggle } from './ThemeToggle';
import { motion } from "framer-motion";
import { useSupabase } from '@/lib/supabase-provider';
import { useToast } from '@/hooks/use-toast';

const Navbar = () => {
  const isMobile = useIsMobile();
  const { user, signOut } = useSupabase();
  const { toast } = useToast();
  const isAuthenticated = !!user;
  
  const logoVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0, 
      transition: { 
        delay: i * 0.1,
        duration: 0.3,
        ease: "easeOut"
      } 
    })
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <motion.div 
          className="flex items-center gap-2"
          variants={logoVariants}
          initial="hidden"
          animate="visible"
        >
          <Link to="/" className="flex items-center gap-2">
            <Logo variant={isMobile ? 'icon' : 'full'} />
          </Link>
        </motion.div>
        
        {isAuthenticated ? (
          <>
            <div className="hidden md:flex items-center gap-6">
              <nav className="flex items-center gap-6">
                {[
                  { icon: Home, path: '/feed', label: 'Home' },
                  { icon: Music, path: '/discover', label: 'Discover' },
                  { icon: Search, path: '/search', label: 'Search' },
                  { icon: Bell, path: '/notifications', label: 'Notifications' }
                ].map((item, i) => (
                  <motion.div
                    key={item.path}
                    custom={i}
                    variants={navItemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Link 
                      to={item.path} 
                      className="text-sm font-medium transition-colors hover:text-primary"
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="sr-only">{item.label}</span>
                    </Link>
                  </motion.div>
                ))}
                
                <motion.div
                  custom={4}
                  variants={navItemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Link to="/profile" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 avatar-ring">
                      <AvatarImage src={user?.user_metadata?.avatar_url || "https://randomuser.me/api/portraits/women/42.jpg"} alt="Profile" />
                      <AvatarFallback>{user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                  </Link>
                </motion.div>
                
                <motion.div
                  custom={5}
                  variants={navItemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <ThemeToggle />
                </motion.div>
                
                <motion.div
                  custom={6}
                  variants={navItemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleSignOut}
                    className="rounded-full ml-2"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="sr-only">Sign out</span>
                  </Button>
                </motion.div>
              </nav>
            </div>
            
            <div className="md:hidden flex items-center gap-4">
              <ThemeToggle />
              <Link to="/profile" className="flex items-center gap-2">
                <Avatar className="h-8 w-8 avatar-ring">
                  <AvatarImage src={user?.user_metadata?.avatar_url || "https://randomuser.me/api/portraits/women/42.jpg"} alt="Profile" />
                  <AvatarFallback>{user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U'}</AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="outline" className="hidden sm:flex">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button>Sign up</Button>
            </Link>
          </div>
        )}
      </div>
      
      {isAuthenticated && !isMobile && <MusicPlayer />}
    </header>
  );
};

export default Navbar;
