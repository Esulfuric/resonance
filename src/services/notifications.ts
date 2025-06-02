
import { supabase } from '@/lib/supabase';
import { Notification } from '@/types/post';

// Fetch all notifications for a user with proper error handling
export const fetchNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    console.log('Fetching notifications for user:', userId);
    
    // First fetch notifications
    const { data: notificationsData, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
    
    if (!notificationsData || notificationsData.length === 0) {
      console.log('No notifications found');
      return [];
    }
    
    console.log('Fetched notifications:', notificationsData);
    
    // Get unique actor IDs
    const actorIds = [...new Set(notificationsData.map(n => n.actor_id))];
    
    // Fetch profiles for all actors
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', actorIds);
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    }
    
    console.log('Fetched profiles:', profilesData);
    
    // Map profiles to notifications
    const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
    
    const notificationsWithActors = notificationsData.map(notification => ({
      ...notification,
      actor: profilesMap.get(notification.actor_id) || null
    }));
    
    console.log('Final notifications with actors:', notificationsWithActors);
    
    return notificationsWithActors as unknown as Notification[];
  } catch (error) {
    console.error('Error in fetchNotifications:', error);
    return [];
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    
    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error);
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    
    if (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in markAllNotificationsAsRead:', error);
  }
};

// Subscribe to real-time notifications
export const subscribeToNotifications = (userId: string, callback: (notification: Notification) => void) => {
  const channel = supabase
    .channel(`notifications-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      async (payload) => {
        console.log('New notification received:', payload);
        
        // Fetch the complete notification with actor data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url')
          .eq('id', payload.new.actor_id)
          .single();
        
        const notificationWithActor = {
          ...payload.new,
          actor: profileData
        };
        
        console.log('Notification with actor:', notificationWithActor);
        
        if (notificationWithActor) {
          callback(notificationWithActor as unknown as Notification);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
