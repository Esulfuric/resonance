
import React, { useState } from 'react';
import { Home, Search, Music, User, ChevronRight, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from './ThemeToggle';

export const MobileNavigation: React.FC = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { title: 'Home', icon: Home, path: '/feed' },
    { title: 'Search', icon: Search, path: '/search' },
    { title: 'Discover', icon: Music, path: '/discover' },
    { title: 'Profile', icon: User, path: '/profile' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed right-4 top-20 z-40 rounded-full shadow-md border"
          aria-label="Open navigation"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] sm:w-[350px]">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between pb-6 pt-2">
            <h2 className="text-lg font-semibold">Navigation</h2>
            <ThemeToggle />
          </div>
          
          <nav className="space-y-2">
            {navItems.map((item) => (
              <div key={item.path}>
                <Link 
                  to={item.path} 
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isActive(item.path) 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-accent'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              </div>
            ))}
          </nav>

          <div className="mt-auto">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5 mr-2" />
              Close Menu
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
