
import React, { useState } from 'react';
import Logo from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
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
import { markAllNotificationsAsRead } from '@/services/notifications';
import { Bell, MessageCircle } from 'lucide-react';
import { NotificationList } from './notifications/NotificationList';
import { NotificationBadge } from './ui/notification-badge';
import { useNotificationCount } from '@/hooks/useNotificationCount';
import { useMessageCount } from '@/hooks/useMessageCount';
import { useSystemTranslation } from '@/hooks/useSystemTranslation';

const Navbar = () => {
  const { user, signOut } = useSupabase();
  const location = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { unreadCount: notificationCount, refreshCount: refreshNotificationCount } = useNotificationCount();
  const { unreadCount: messageCount } = useMessageCount();

  // Translate system text
  const myProfileText = useSystemTranslation("My Profile");
  const messagesText = useSystemTranslation("Messages");
  const logoutText = useSystemTranslation("Logout");
  const loginText = useSystemTranslation("Login");

  const handleNotificationsOpen = (open: boolean) => {
    setNotificationsOpen(open);
    if (!open && user && notificationCount > 0) {
      // Mark all as read when closing the notifications panel
      markAllNotificationsAsRead(user.id)
        .then(() => refreshNotificationCount())
        .catch(error => console.error('Error marking notifications as read:', error));
    }
  };

  // Hide navbar on auth pages (but show on index page)
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
          <LanguageToggle />
          <ThemeToggle />
          
          {user && (
            <>
              <Link to="/messages" className="p-2 rounded-full hover:bg-muted relative">
                <MessageCircle className="h-5 w-5" />
                <NotificationBadge count={messageCount} />
              </Link>
              
              <Popover open={notificationsOpen} onOpenChange={handleNotificationsOpen}>
                <PopoverTrigger asChild>
                  <div className="relative">
                    <button className="p-2 rounded-full hover:bg-muted">
                      <Bell className="h-5 w-5" />
                    </button>
                    <NotificationBadge count={notificationCount} />
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
                    {myProfileText}
                  </DropdownMenuItem>
                </Link>
                <Link to="/messages">
                  <DropdownMenuItem className="cursor-pointer">
                    {messagesText}
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={signOut}>
                  {logoutText}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <button className="bg-resonance-green text-white px-4 py-2 rounded-full text-sm font-medium">
                {loginText}
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
