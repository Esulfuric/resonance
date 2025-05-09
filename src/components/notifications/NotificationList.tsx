
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Heart, MessageCircle, UserPlus } from "lucide-react";
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/services/postService";
import { Notification } from "@/types/post";
import { useSupabase } from "@/lib/supabase-provider";

interface NotificationListProps {
  onClose?: () => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({ onClose }) => {
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
    
    setIsLoading(true);
    try {
      const notificationData = await fetchNotifications(user.id);
      setNotifications(notificationData);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadNotification = async (notification: Notification) => {
    // Mark notification as read
    await markNotificationAsRead(notification.id);
    
    // Update local state
    setNotifications(prev => prev.map(n => 
      n.id === notification.id ? { ...n, is_read: true } : n
    ));
    
    // Navigate based on notification type
    if (onClose) onClose();
    
    if (notification.type === 'follow') {
      navigate(`/profile/${notification.actor_id}`);
    } else if (notification.type === 'like' || notification.type === 'comment') {
      // Navigate to the post
      if (notification.post_id) {
        // Ideally we'd navigate to a specific post view
        // For now, navigate to the actor's profile
        navigate(`/profile/${notification.actor_id}`);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    
    await markAllNotificationsAsRead(user.id);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const renderNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'follow':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getNotificationText = (notification: Notification) => {
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

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diff = now.getTime() - notifTime.getTime();
    
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    
    return notifTime.toLocaleDateString();
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading notifications...</div>;
  }

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <Bell className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
        <h3 className="mt-4 text-lg font-medium">No notifications</h3>
        <p className="text-sm text-muted-foreground">When someone interacts with your posts or profile, you'll see it here.</p>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-medium">Notifications</h3>
        {unreadCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleMarkAllAsRead}
            className="text-xs"
          >
            Mark all as read
          </Button>
        )}
      </div>
      
      <ScrollArea className="h-[70vh] md:h-[50vh]">
        <div className="p-4 space-y-4">
          {notifications.map(notification => (
            <div 
              key={notification.id}
              className={`flex gap-3 p-3 rounded-md cursor-pointer transition-colors ${
                notification.is_read ? 'bg-background' : 'bg-muted'
              }`}
              onClick={() => handleReadNotification(notification)}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage 
                  src={notification.actor?.avatar_url} 
                  alt={notification.actor?.full_name || ''} 
                />
                <AvatarFallback>
                  {notification.actor?.full_name?.[0] || notification.actor?.username?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium line-clamp-2">
                    {getNotificationText(notification)}
                  </p>
                  <div className="flex items-center gap-2">
                    {renderNotificationIcon(notification.type)}
                    <span className="text-xs text-muted-foreground">
                      {getTimeAgo(notification.created_at)}
                    </span>
                  </div>
                </div>
                {!notification.is_read && (
                  <div className="h-2 w-2 bg-blue-500 rounded-full absolute top-1 right-1" />
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default NotificationList;
