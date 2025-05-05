
import { Link } from 'react-router-dom';
import { Bell, Home, Search, User, Music } from 'lucide-react';
import Logo from './Logo';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useIsMobile } from '@/hooks/use-mobile';
import { MusicPlayer } from './MusicPlayer';

interface NavbarProps {
  isAuthenticated?: boolean;
}

const Navbar = ({ isAuthenticated = false }: NavbarProps) => {
  const isMobile = useIsMobile();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <Logo variant={isMobile ? 'icon' : 'full'} />
          </Link>
        </div>
        
        {isAuthenticated ? (
          <>
            <div className="hidden md:flex items-center gap-6">
              <nav className="flex items-center gap-6">
                <Link to="/feed" className="text-sm font-medium transition-colors hover:text-primary">
                  <Home className="h-5 w-5" />
                  <span className="sr-only">Home</span>
                </Link>
                <Link to="/discover" className="text-sm font-medium transition-colors hover:text-primary">
                  <Music className="h-5 w-5" />
                  <span className="sr-only">Discover</span>
                </Link>
                <Link to="/search" className="text-sm font-medium transition-colors hover:text-primary">
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Search</span>
                </Link>
                <Link to="/notifications" className="text-sm font-medium transition-colors hover:text-primary">
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Notifications</span>
                </Link>
                <Link to="/profile" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 avatar-ring">
                    <AvatarImage src="https://randomuser.me/api/portraits/women/42.jpg" alt="Profile" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Link>
              </nav>
            </div>
            
            <div className="md:hidden flex items-center gap-4">
              <Link to="/profile" className="flex items-center gap-2">
                <Avatar className="h-8 w-8 avatar-ring">
                  <AvatarImage src="https://randomuser.me/api/portraits/women/42.jpg" alt="Profile" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-4">
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
      
      {isAuthenticated && isMobile && (
        <nav className="fixed bottom-0 left-0 z-40 w-full border-t bg-background">
          <div className="flex h-16 items-center justify-around">
            <Link to="/feed" className="flex flex-1 flex-col items-center justify-center">
              <Home className="h-5 w-5" />
              <span className="text-xs">Home</span>
            </Link>
            <Link to="/discover" className="flex flex-1 flex-col items-center justify-center">
              <Music className="h-5 w-5" />
              <span className="text-xs">Discover</span>
            </Link>
            <Link to="/search" className="flex flex-1 flex-col items-center justify-center">
              <Search className="h-5 w-5" />
              <span className="text-xs">Search</span>
            </Link>
            <Link to="/profile" className="flex flex-1 flex-col items-center justify-center">
              <User className="h-5 w-5" />
              <span className="text-xs">Profile</span>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
