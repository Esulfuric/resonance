
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { fetchConversations, fetchMessages, sendMessage } from '@/services/messages';
import { Message, Conversation } from '@/types/post';
import { supabase } from '@/lib/supabase';
import { ConversationList } from '@/components/messages/ConversationList';
import { ChatInterface } from '@/components/messages/ChatInterface';

const Messages = () => {
  const { user } = useAuthGuard();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const location = useLocation();

  // Load conversations when component mounts
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Handle URL parameter for opening specific conversation
  useEffect(() => {
    if (user && conversations.length > 0) {
      const params = new URLSearchParams(location.search);
      const userId = params.get('user');
      
      if (userId) {
        const existingConversation = conversations.find(
          conv => conv.other_user.id === userId
        );
        
        if (existingConversation) {
          setActiveConversation(existingConversation);
        } else {
          // Create temp conversation and fetch user profile
          fetchUserProfile(userId);
        }
      } else if (!activeConversation) {
        setActiveConversation(conversations[0]);
      }
    }
  }, [user, conversations, location.search]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversation && user) {
      loadMessages(activeConversation.other_user.id);
    }
  }, [activeConversation, user]);

  // Subscribe to new messages for real-time updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          
          // If this message belongs to the active conversation, add it
          if (activeConversation && 
              (newMessage.sender_id === activeConversation.other_user.id || 
               newMessage.recipient_id === activeConversation.other_user.id)) {
            setMessages(prev => [...prev, newMessage]);
          }
          
          // Refresh conversations only when a new message arrives
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeConversation]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: userData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      if (userData) {
        const tempConversation: Conversation = {
          other_user: {
            id: userData.id,
            full_name: userData.full_name || '',
            username: userData.username || '',
            avatar_url: userData.avatar_url || '',
          },
          last_message: '',
          created_at: new Date().toISOString(),
          unread_count: 0,
        };
        
        setActiveConversation(tempConversation);
        loadMessages(userId);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: 'Error',
        description: 'Could not load the conversation with this user',
        variant: 'destructive',
      });
    }
  };

  const loadConversations = async () => {
    if (!user) return;
    
    try {
      const conversationData = await fetchConversations(user.id);
      setConversations(conversationData);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: 'Error',
        description: 'Could not load conversations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (otherUserId: string) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const messagesData = await fetchMessages(user.id, otherUserId);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: 'Error',
        description: 'Could not load messages',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !activeConversation || !newMessage.trim()) return;
    
    try {
      const result = await sendMessage(user.id, activeConversation.other_user.id, newMessage);
      
      // Add message to UI immediately
      const newMsg: Message = {
        id: result.id || Date.now().toString(),
        sender_id: user.id,
        recipient_id: activeConversation.other_user.id,
        content: newMessage,
        created_at: new Date().toISOString(),
        is_read: false,
        sender: {
          id: user.id,
          full_name: user.user_metadata?.full_name,
          username: user.user_metadata?.username,
          avatar_url: user.user_metadata?.avatar_url,
        },
        recipient: {
          id: activeConversation.other_user.id,
          full_name: activeConversation.other_user.full_name,
          username: activeConversation.other_user.username,
          avatar_url: activeConversation.other_user.avatar_url,
        }
      };
      
      setMessages([...messages, newMsg]);
      setNewMessage('');
      
      // Refresh conversations to update last message
      loadConversations();
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Could not send message',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Redirecting...</div>;
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ConversationList 
            conversations={conversations}
            activeConversation={activeConversation}
            onConversationSelect={setActiveConversation}
          />
          
          <ChatInterface 
            activeConversation={activeConversation}
            messages={messages}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            user={user}
          />
        </div>
      </div>
    </div>
  );
};

export default Messages;
