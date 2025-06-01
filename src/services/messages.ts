import { supabase } from '@/lib/supabase';
import { Conversation, Message } from '@/types/post';

// Fetch all conversations for a user
export const fetchConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    // Using a DB function to get conversations with last message and unread count
    const { data, error } = await supabase.rpc('get_user_conversations', {
      user_id_param: userId
    });
    
    if (error) throw error;
    
    // Format the data to match our Conversation type
    const conversations: Conversation[] = [];
    
    // Group messages by user to create conversations
    for (const item of data) {
      const otherId = item.sender_id === userId ? item.recipient_id : item.sender_id;
      
      // Get user details for the other person in the conversation
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', otherId)
        .single();
      
      if (userError) {
        console.error('Error fetching user data:', userError);
        continue;
      }
      
      conversations.push({
        other_user: {
          id: otherId,
          full_name: userData.full_name || '',
          username: userData.username || '',
          avatar_url: userData.avatar_url || '',
        },
        last_message: item.content,
        created_at: item.created_at,
        unread_count: Number(item.unread_count) || 0,
      });
    }
    
    return conversations;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

// Fetch messages between two users
export const fetchMessages = async (userId: string, otherUserId: string): Promise<Message[]> => {
  try {
    // Get messages between these two users in either direction
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id(id, full_name, username, avatar_url),
        recipient:profiles!recipient_id(id, full_name, username, avatar_url)
      `)
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .or(`sender_id.eq.${otherUserId},recipient_id.eq.${otherUserId}`)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    // Filter to only include messages between these two specific users
    const filteredMessages = data.filter(msg => 
      (msg.sender_id === userId && msg.recipient_id === otherUserId) ||
      (msg.sender_id === otherUserId && msg.recipient_id === userId)
    );
    
    // Use type assertion to handle the type mismatch
    return filteredMessages as unknown as Message[];
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// Send a new message
export const sendMessage = async (senderId: string, recipientId: string, content: string) => {
  try {
    // Insert the message
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        recipient_id: recipientId,
        content,
        is_read: false
      })
      .select()
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
    // Don't throw - we don't want to fail the message send if notification fails
  }
};
