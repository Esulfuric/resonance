
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Conversation } from '@/types/post';
import { NotificationBadge } from '@/components/ui/notification-badge';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  onConversationSelect: (conversation: Conversation) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversation,
  onConversationSelect,
}) => {
  const navigate = useNavigate();

  return (
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
              className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors relative ${
                activeConversation?.other_user.id === conversation.other_user.id 
                  ? 'bg-muted' 
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => {
                onConversationSelect(conversation);
                navigate(`/messages?user=${conversation.other_user.id}`, { replace: true });
              }}
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
              <NotificationBadge count={conversation.unread_count} />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
