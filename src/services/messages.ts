import { supabase } from '@/lib/supabase';
import { Conversation, Message } from '@/types/post';

// Fetch all conversations for a user with improved persistence
export const fetchConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Get unique user IDs to fetch profiles
    const userIds = new Set<string>();
    data?.forEach(message => {
      userIds.add(message.sender_id);
      userIds.add(message.recipient_id);
    });
    
    // Fetch all relevant profiles
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', Array.from(userIds));
    
    // Create a map for quick profile lookup
    const profilesMap = new Map();
    profilesData?.forEach(profile => {
      profilesMap.set(profile.id, profile);
    });
    
    // Group messages by conversation partner
    const conversationMap = new Map<string, any>();
    
    for (const message of data || []) {
      const otherUserId = message.sender_id === userId ? message.recipient_id : message.sender_id;
      const otherUserProfile = profilesMap.get(otherUserId);
      
      if (!conversationMap.has(otherUserId)) {
        // Count unread messages
        const unreadCount = data?.filter(m => 
          m.sender_id === otherUserId && 
          m.recipient_id === userId && 
          !m.is_read
        ).length || 0;
        
        conversationMap.set(otherUserId, {
          other_user: {
            id: otherUserId,
            full_name: otherUserProfile?.full_name || '',
            username: otherUserProfile?.username || '',
            avatar_url: otherUserProfile?.avatar_url || '',
          },
          last_message: message.content,
          created_at: message.created_at,
          unread_count: unreadCount,
        });
      }
    }
    
    return Array.from(conversationMap.values());
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};

// Get total unread message count for a user
export const getUnreadMessageCount = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('is_read', false);
    
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error fetching unread message count:', error);
    return 0;
  }
};

// Fetch ALL messages between two users (no limit)
export const fetchMessages = async (userId: string, otherUserId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    // Get profiles for both users
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', [userId, otherUserId]);
    
    const profilesMap = new Map();
    profilesData?.forEach(profile => {
      profilesMap.set(profile.id, profile);
    });
    
    // Mark messages as read
    await markMessagesAsRead(userId, otherUserId);
    
    // Transform messages with profile data
    const messagesWithProfiles = (data || []).map(message => ({
      ...message,
      sender: profilesMap.get(message.sender_id),
      recipient: profilesMap.get(message.recipient_id)
    }));
    
    return messagesWithProfiles as unknown as Message[];
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

// Mark messages as read
export const markMessagesAsRead = async (userId: string, senderId: string) => {
  try {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('recipient_id', userId)
      .eq('sender_id', senderId)
      .eq('is_read', false);
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};

// Send a new message with notification
export const sendMessage = async (senderId: string, recipientId: string, content: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        recipient_id: recipientId,
        content,
        is_read: false
      })
      .select('*')
      .single();
    
    if (error) throw error;
    
    // Get profiles for sender and recipient
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', [senderId, recipientId]);
    
    const profilesMap = new Map();
    profilesData?.forEach(profile => {
      profilesMap.set(profile.id, profile);
    });
    
    // Create a notification for the recipient
    await createMessageNotification(senderId, recipientId);
    
    // Return message with profile data
    return {
      ...data,
      sender: profilesMap.get(senderId),
      recipient: profilesMap.get(recipientId)
    };
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Create a notification for a new message
const createMessageNotification = async (senderId: string, recipientId: string) => {
  try {
    await supabase
      .from('notifications')
      .insert({
        user_id: recipientId,
        actor_id: senderId,
        type: 'message',
        is_read: false
      });
  } catch (error) {
    console.error('Error creating message notification:', error);
  }
};
