
import { supabase } from '@/lib/supabase';
import { Conversation, Message } from '@/types/post';

// Fetch all conversations for a user with improved persistence
export const fetchConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id(id, full_name, username, avatar_url),
        recipient:profiles!recipient_id(id, full_name, username, avatar_url)
      `)
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Group messages by conversation partner
    const conversationMap = new Map<string, any>();
    
    for (const message of data || []) {
      const otherUserId = message.sender_id === userId ? message.recipient_id : message.sender_id;
      const otherUser = message.sender_id === userId ? message.recipient : message.sender;
      
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
            full_name: otherUser?.full_name || '',
            username: otherUser?.username || '',
            avatar_url: otherUser?.avatar_url || '',
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

// Fetch ALL messages between two users (no limit)
export const fetchMessages = async (userId: string, otherUserId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id(id, full_name, username, avatar_url),
        recipient:profiles!recipient_id(id, full_name, username, avatar_url)
      `)
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    // Mark messages as read
    await markMessagesAsRead(userId, otherUserId);
    
    return (data || []) as unknown as Message[];
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
      .select(`
        *,
        sender:profiles!sender_id(id, full_name, username, avatar_url),
        recipient:profiles!recipient_id(id, full_name, username, avatar_url)
      `)
      .single();
    
    if (error) throw error;
    
    // Create a notification for the recipient
    await createMessageNotification(senderId, recipientId);
    
    return data;
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
