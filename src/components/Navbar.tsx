
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useIsMobile } from '@/hooks/use-mobile';
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
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {!isMobile && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleSignOut}
                className="rounded-full ml-2"
              >
                <span className="sr-only">Sign out</span>
                Logout
              </Button>
            )}
          </div>
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
    </header>
  );
};

export default Navbar;
