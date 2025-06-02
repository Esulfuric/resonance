
import { useState, useEffect } from 'react';
import { useSupabase } from '@/lib/supabase-provider';
import { getUnreadMessageCount } from '@/services/messages';
import { supabase } from '@/lib/supabase';

export const useMessageCount = () => {
  const { user } = useSupabase();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    loadUnreadCount();

    // Subscribe to new messages
    const channel = supabase
      .channel(`message-count-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          loadUnreadCount();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          loadUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadUnreadCount = async () => {
    if (!user) return;
    
    try {
      const count = await getUnreadMessageCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  return { unreadCount, refreshCount: loadUnreadCount };
};
