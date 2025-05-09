import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '@/lib/supabase-provider';
import { fetchNotifications, markNotificationAsRead } from '@/services/postService';
import { Notification } from '@/types/post';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

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
      
      // Update state to reflect the read status
      setNotifications(prevNotifications => 
        prevNotifications.map(n => 
          n.id === notification.id ? { ...n, is_read: true } : n
        )
      );
    }
    
    // Navigate based on notification type
    if (notification.type === 'follow') {
      // Navigate to user profile
      navigate(`/profile/${notification.actor_id}`);
    } else if (notification.type === 'like' || notification.type === 'comment') {
      // Navigate to post
      // Note: In a real app, you might want to navigate to the specific post
      navigate(`/profile/${notification.actor_id}`);
    }
    
    // Close the notification panel
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
      default:
        return 'You have a new notification';
    }
  };

  const formatDate = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now.getTime() - date.getTime();
    
    // Within last hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    }
    
    // Within last day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }
    
    // Within last week
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days}d ago`;
    }
    
    // Otherwise, return date
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        Loading notifications...
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="max-h-[400px] overflow-y-auto">
      <div className="p-2 border-b">
        <h3 className="font-semibold">Notifications</h3>
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
            <div className="h-2 w-2 bg-blue-500 rounded-full shrink-0"></div>
          )}
        </div>
      ))}
    </div>
  );
};
