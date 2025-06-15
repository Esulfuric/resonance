
import React, { useState, useEffect } from "react";
import { Heart, MessageCircle, Share, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { toggleLikePost, checkPostLiked } from "@/services/post/postInteractions";
import { deletePost } from "@/services/post/postActions";

interface PostCardProps {
  id: string;
  user_id?: string;
  user: {
    id?: string;
    name: string;
    username: string;
    avatar: string;
    user_type?: 'musician' | 'listener';
  };
  timestamp: string;
  content: string;
  isEdited?: boolean;
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
  likes_count?: number;
  comments_count?: number;
  is_removed?: boolean;
  removal_reason?: string;
  currentUserId?: string;
  onDeletePost?: (postId: string) => void;
  onRefreshFeed?: () => void;
}

export const PostCard = ({
  id,
  user_id,
  user,
  timestamp,
  content,
  isEdited,
  imageUrl,
  songInfo,
  stats,
  likes_count,
  comments_count,
  is_removed,
  removal_reason,
  currentUserId,
  onDeletePost,
  onRefreshFeed
}: PostCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(likes_count || stats.likes);
  const [isLiking, setIsLiking] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (currentUserId) {
      checkPostLiked(id, currentUserId).then(setIsLiked);
    }
  }, [id, currentUserId]);

  const handleLike = async () => {
    if (!currentUserId || isLiking) return;
    
    setIsLiking(true);
    const result = await toggleLikePost(id, currentUserId);
    
    if (result.success) {
      setIsLiked(result.isLiked);
      setLikesCount(prev => result.isLiked ? prev + 1 : prev - 1);
    } else {
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    }
    setIsLiking(false);
  };

  const handleDelete = async () => {
    if (!onDeletePost) return;
    
    const confirmed = window.confirm("Are you sure you want to delete this post?");
    if (!confirmed) return;

    const result = await deletePost(id);
    if (result.success) {
      onDeletePost(id);
      onRefreshFeed?.();
      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const isOwnPost = currentUserId === (user_id || user.id);

  // Show removed post message
  if (is_removed) {
    return (
      <Card className="border-l-4 border-l-red-500">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600 font-medium">
              This post has been removed because it doesn't follow the content policies
            </p>
            {isOwnPost && removal_reason && (
              <p className="text-sm text-gray-600 mt-2">
                Reason: {removal_reason}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center space-y-0 pb-3">
        <div className="flex items-center space-x-3 flex-1">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
              {user.user_type === 'musician' && (
                <Badge variant="secondary" className="text-xs bg-resonance-orange/10 text-resonance-orange">
                  Musician
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{timestamp}</p>
          </div>
        </div>
        
        {isOwnPost && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      
      <CardContent className="pb-3">
        <p className="text-sm mb-3">{content}</p>
        
        {songInfo && (
          <div className="mb-3 p-3 bg-muted rounded-lg flex items-center space-x-3">
            <img 
              src={songInfo.albumCover} 
              alt="Album cover" 
              className="w-12 h-12 rounded object-cover"
            />
            <div>
              <p className="text-sm font-medium">{songInfo.title}</p>
              <p className="text-xs text-muted-foreground">{songInfo.artist}</p>
            </div>
          </div>
        )}
        
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt="Post image" 
            className="w-full rounded-lg object-cover max-h-96 mb-3"
          />
        )}
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className={`text-muted-foreground hover:text-red-500 ${isLiked ? 'text-red-500' : ''}`}
              onClick={handleLike}
              disabled={isLiking}
            >
              <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs">{likesCount}</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-blue-500">
              <MessageCircle className="h-4 w-4 mr-1" />
              <span className="text-xs">{comments_count || stats.comments}</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-green-500">
              <Share className="h-4 w-4 mr-1" />
              <span className="text-xs">{stats.shares}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
