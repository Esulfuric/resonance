
import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { useSupabase } from '@/lib/supabase-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link, useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { fetchNotifications, markAllNotificationsAsRead } from '@/services/postService';
import { Bell, MessageCircle } from 'lucide-react';
import { NotificationList } from './notifications/NotificationList';

const Navbar = () => {
  const { user, signOut } = useSupabase();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotificationCount();
      
      // Set up interval to check for new notifications
      const interval = setInterval(loadNotificationCount, 60000); // Check every minute
      
      return () => clearInterval(interval);
    }
  }, [user]);
  
  const loadNotificationCount = async () => {
    if (!user) return;
    
    try {
      const notifications = await fetchNotifications(user.id);
      const unread = notifications.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading notifications count:', error);
    }
  };
  
  const handleNotificationsOpen = (open: boolean) => {
    setNotificationsOpen(open);
    if (!open && user && unreadCount > 0) {
      // Mark all as read when closing the notifications panel
      markAllNotificationsAsRead(user.id)
        .then(() => setUnreadCount(0))
        .catch(error => console.error('Error marking notifications as read:', error));
    }
  };

  // Hide navbar on certain pages
  if (['/login', '/signup', '/forgot-password'].includes(location.pathname)) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-sm z-10 border-b">
      <div className="container h-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo />
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          {user && (
            <>
              <Link to="/messages" className="p-2 rounded-full hover:bg-muted">
                <MessageCircle className="h-5 w-5" />
              </Link>
              
              <Popover open={notificationsOpen} onOpenChange={handleNotificationsOpen}>
                <PopoverTrigger asChild>
                  <div className="relative">
                    <button className="p-2 rounded-full hover:bg-muted">
                      <Bell className="h-5 w-5" />
                    </button>
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </div>
                    )}
                  </div>
                </PopoverTrigger>
                <PopoverContent align="end" className="p-0 w-80">
                  <NotificationList onClose={() => setNotificationsOpen(false)} />
                </PopoverContent>
              </Popover>
            </>
          )}
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback>
                      {user.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Link to="/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    My Profile
                  </DropdownMenuItem>
                </Link>
                <Link to="/messages">
                  <DropdownMenuItem className="cursor-pointer">
                    Messages
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={signOut}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <button className="bg-resonance-green text-white px-4 py-2 rounded-full text-sm font-medium">
                Login
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
