
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Conversation, Message } from '@/types/post';
import { Send } from 'lucide-react';

interface ChatInterfaceProps {
  activeConversation: Conversation | null;
  messages: Message[];
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  user: any;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  activeConversation,
  messages,
  newMessage,
  setNewMessage,
  onSendMessage,
  isLoading,
  user,
}) => {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!activeConversation) {
    return (
      <Card className="md:col-span-2 h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
          <p className="text-muted-foreground">Or start a new one from the search page</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="md:col-span-2 h-[70vh] flex flex-col">
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
            onSendMessage();
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
    </Card>
  );
};
