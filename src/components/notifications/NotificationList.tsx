
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '@/lib/supabase-provider';
import { fetchNotifications, markNotificationAsRead, subscribeToNotifications } from '@/services/notifications';
import { Notification } from '@/types/post';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export const NotificationList: React.FC<{ onClose?: () => void }> = ({ 
  onClose 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSupabase();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadNotifications();
      
      // Subscribe to real-time notifications
      const unsubscribe = subscribeToNotifications(user.id, (newNotification) => {
        setNotifications(prev => [newNotification, ...prev]);
      });
      
      return unsubscribe;
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const fetchedNotifications = await fetchNotifications(user.id);
      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark notification as read
    if (!notification.is_read) {
      await markNotificationAsRead(notification.id);
      
      setNotifications(prevNotifications => 
        prevNotifications.map(n => 
          n.id === notification.id ? { ...n, is_read: true } : n
        )
      );
    }
    
    // Navigate based on notification type
    if (notification.type === 'follow') {
      navigate(`/profile/${notification.actor_id}`);
    } else if (notification.type === 'like' || notification.type === 'comment') {
      navigate(`/profile/${notification.actor_id}`);
    } else if (notification.type === 'message') {
      navigate(`/messages?user=${notification.actor_id}`);
    }
    
    if (onClose) onClose();
  };

  const getNotificationText = (notification: Notification): string => {
    const actorName = notification.actor?.full_name || notification.actor?.username || 'Someone';
    
    switch (notification.type) {
      case 'like':
        return `${actorName} liked your post`;
      case 'comment':
        return `${actorName} commented on your post`;
      case 'follow':
        return `${actorName} started following you`;
      case 'message':
        return `${actorName} sent you a message`;
      default:
        return 'You have a new notification';
    }
  };

  const formatDate = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now.getTime() - date.getTime();
    
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    }
    
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }
    
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days}d ago`;
    }
    
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="max-h-[400px] overflow-y-auto">
      <div className="p-2 border-b flex justify-between items-center">
        <h3 className="font-semibold">Notifications</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={loadNotifications}
          className="h-8 w-8 p-0"
        >
          <Loader2 className="h-4 w-4" />
          <span className="sr-only">Refresh</span>
        </Button>
      </div>
      
      {notifications.map(notification => (
        <div 
          key={notification.id} 
          className={`p-3 border-b flex items-center gap-3 cursor-pointer transition-colors hover:bg-muted ${
            !notification.is_read ? 'bg-muted/50' : ''
          }`}
          onClick={() => handleNotificationClick(notification)}
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={notification.actor?.avatar_url} />
            <AvatarFallback>
              {notification.actor?.full_name?.[0] || notification.actor?.username?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              {getNotificationText(notification)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(notification.created_at)}
            </p>
          </div>
          
          {!notification.is_read && (
            <div className="h-2 w-2 bg-resonance-green rounded-full shrink-0"></div>
          )}
        </div>
      ))}
    </div>
  );
};
