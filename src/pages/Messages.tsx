
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { fetchConversations, fetchMessages, sendMessage } from '@/services/messages';
import { Message, Conversation } from '@/types/post';
import { Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const Messages = () => {
  const { user } = useAuthGuard();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load conversations when component mounts
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversation && user) {
      loadMessages(activeConversation.other_user.id);
    }
  }, [activeConversation, user]);

  // Subscribe to new messages
  useEffect(() => {
    if (!user) return;

    // Set up a subscription to listen for new messages
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
          
          // If this message belongs to the active conversation, add it to the messages state
          if (activeConversation && 
              (newMessage.sender_id === activeConversation.other_user.id || 
               newMessage.recipient_id === activeConversation.other_user.id)) {
            setMessages(prev => [...prev, newMessage]);
          }
          
          // Refresh conversations to update the last message and unread counts
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeConversation]);

  const loadConversations = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const conversationData = await fetchConversations(user.id);
      setConversations(conversationData);
      
      // Set active conversation to the first one if none is selected
      if (!activeConversation && conversationData.length > 0) {
        setActiveConversation(conversationData[0]);
      }
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
      
      // Mark messages as read when loaded
      markMessagesAsRead(otherUserId);
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

  const markMessagesAsRead = async (otherUserId: string) => {
    if (!user) return;
    
    try {
      // Update all unread messages from this sender to read
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .match({ sender_id: otherUserId, recipient_id: user.id, is_read: false });
      
      if (error) throw error;
      
      // Refresh conversations to update unread counts
      loadConversations();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !activeConversation || !newMessage.trim()) return;
    
    try {
      const result = await sendMessage(user.id, activeConversation.other_user.id, newMessage);
      
      // Optimistically add message to UI
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Redirecting...</div>;
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card className="p-4 h-[70vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Conversations</h2>
            
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No conversations yet</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => navigate('/search')}
                >
                  Find people to message
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <div 
                    key={conversation.other_user.id} 
                    className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${
                      activeConversation?.other_user.id === conversation.other_user.id 
                        ? 'bg-muted' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setActiveConversation(conversation)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conversation.other_user.avatar_url} />
                      <AvatarFallback>
                        {conversation.other_user.full_name?.[0] || conversation.other_user.username?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="font-medium truncate">
                          {conversation.other_user.full_name || conversation.other_user.username}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(conversation.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.last_message}
                      </p>
                    </div>
                    {conversation.unread_count > 0 && (
                      <div className="h-5 w-5 bg-resonance-green rounded-full flex items-center justify-center text-white text-xs">
                        {conversation.unread_count}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
          
          {/* Message Content */}
          <Card className="md:col-span-2 h-[70vh] flex flex-col">
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 p-4 border-b">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={activeConversation.other_user.avatar_url} />
                    <AvatarFallback>
                      {activeConversation.other_user.full_name?.[0] || activeConversation.other_user.username?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">
                      {activeConversation.other_user.full_name || activeConversation.other_user.username}
                    </h3>
                    <p 
                      className="text-sm text-muted-foreground cursor-pointer hover:underline"
                      onClick={() => navigate(`/profile/${activeConversation.other_user.id}`)}
                    >
                      @{activeConversation.other_user.username}
                    </p>
                  </div>
                </div>
                
                {/* Messages */}
                <div 
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                >
                  {isLoading ? (
                    <div className="text-center py-8">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwnMessage = message.sender_id === user.id;
                      
                      return (
                        <div 
                          key={message.id} 
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex gap-2 max-w-[80%] ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                            {!isOwnMessage && (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={message.sender?.avatar_url} />
                                <AvatarFallback>
                                  {message.sender?.full_name?.[0] || message.sender?.username?.[0] || 'U'}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div 
                              className={`p-3 rounded-lg ${
                                isOwnMessage 
                                  ? 'bg-resonance-green text-white rounded-tr-none'
                                  : 'bg-muted rounded-tl-none'
                              }`}
                            >
                              <p>{message.content}</p>
                              <div className={`text-xs mt-1 ${isOwnMessage ? 'text-white/70' : 'text-muted-foreground'}`}>
                                {formatMessageTime(message.created_at)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Message Input */}
                <div className="p-4 border-t">
                  <form 
                    className="flex gap-2" 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                  >
                    <Input 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      disabled={!newMessage.trim()}
                      className="bg-resonance-green hover:bg-resonance-green/90"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                  <p className="text-muted-foreground">Or start a new one from the search page</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Messages;
