
import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, MoreHorizontal, Music } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface PostCardProps {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  timestamp: string;
  content: string;
  imageUrl?: string;
  songInfo?: {
    title: string;
    artist: string;
    albumCover: string;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
}

export function PostCard(props: PostCardProps) {
  const { id, user, timestamp, content, imageUrl, songInfo, stats } = props;
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();

  const handleLike = () => {
    setLiked(!liked);
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${id.split('-')[0]}`); // Using part of the post ID as user ID for demo
  };

  return (
    <Card className="overflow-hidden hover:bg-accent/50 transition-colors cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* User avatar */}
          <Avatar className="h-10 w-10 cursor-pointer" onClick={handleUserClick}>
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          
          {/* Post content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div onClick={handleUserClick} className="cursor-pointer">
                <span className="font-semibold">{user.name}</span>
                <span className="text-muted-foreground ml-1">@{user.username}</span>
                <span className="text-muted-foreground text-sm ml-2">{timestamp}</span>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </div>
            
            <div className="mt-2">
              <p className="text-sm whitespace-pre-wrap">{content}</p>
              
              {/* Song info */}
              {songInfo && (
                <div className="mt-3 flex items-center gap-3 rounded-md bg-muted p-2">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded">
                    <img 
                      src={songInfo.albumCover} 
                      alt={songInfo.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{songInfo.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{songInfo.artist}</p>
                  </div>
                  <Music className="ml-auto h-4 w-4 text-resonance-green" />
                </div>
              )}
              
              {/* Post image */}
              {imageUrl && (
                <div className="mt-3 rounded-md overflow-hidden">
                  <img 
                    src={imageUrl}
                    alt="Post attachment" 
                    className="w-full h-auto max-h-96 object-contain bg-muted"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-2 border-t">
        <div className="flex items-center gap-6 w-full">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1 text-muted-foreground hover:text-primary" 
            onClick={handleLike}
          >
            <Heart className={`h-4 w-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
            <span>{liked ? stats.likes + 1 : stats.likes}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-primary">
            <MessageCircle className="h-4 w-4" />
            <span>{stats.comments}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-primary">
            <Share2 className="h-4 w-4" />
            <span>{stats.shares}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
