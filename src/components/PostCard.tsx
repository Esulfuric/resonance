import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, Music } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PostCardProps } from "@/types/post";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toggleLikePost, checkPostLiked } from "@/services/post/postInteractions";
import { useSupabase } from "@/lib/supabase-provider";
import { useToast } from "@/hooks/use-toast";

export const PostCard: React.FC<PostCardProps> = ({
  id,
  user_id,
  user,
  timestamp,
  content,
  isEdited,
  imageUrl,
  songInfo,
  stats,
  isOwner,
  onDelete,
  onRefreshFeed
}) => {
  const { user: currentUser } = useSupabase();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(stats.likes);

  // Generate username-based URL for user profile - ENSURE IT IS ALWAYS USED!
  const getUserProfileUrl = () => {
    const username = user.username || "user";
    const prefix = user.user_type === "musician" ? "m" : "l";
    return `/${prefix}/${username}`;
  };

  useEffect(() => {
    if (currentUser && id) {
      checkPostLiked(id, currentUser.id).then(setIsLiked);
    }
  }, [id, currentUser]);

  const handleLike = async () => {
    if (!currentUser) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to like posts.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await toggleLikePost(id, currentUser.id);
      
      if (result.success) {
        setIsLiked(result.isLiked);
        setLikesCount(prev => result.isLiked ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like status.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      if (onRefreshFeed) {
        onRefreshFeed();
      }
    }
  };

  // Check if this is a removed post
  const isRemovedPost = content === "This post has been removed because it doesn't follow the content policies";

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {/* Main profile avatar link */}
            <Link to={getUserProfileUrl()}>
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                {/* Main profile name link */}
                <Link 
                  to={getUserProfileUrl()} 
                  className="font-semibold text-sm hover:underline"
                >
                  {user.name}
                </Link>
                {user.user_type === 'musician' && (
                  <Badge variant="secondary" className="text-xs">
                    <Music className="w-3 h-3 mr-1" />
                    Musician
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>@{user.username}</span>
                <span>•</span>
                <span>{timestamp}</span>
                {isEdited && (
                  <>
                    <span>•</span>
                    <span className="italic">edited</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {isOwner && !isRemovedPost && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Post
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Post</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this post? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Content */}
          <p className={`text-sm leading-relaxed ${isRemovedPost ? 'text-destructive font-medium' : ''}`}>
            {content}
          </p>
          
          {/* Song Info */}
          {songInfo && !isRemovedPost && (
            <div className="bg-muted p-3 rounded-lg flex items-center space-x-3">
              <img 
                src={songInfo.albumCover} 
                alt={`${songInfo.title} cover`}
                className="w-12 h-12 rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{songInfo.title}</p>
                <p className="text-xs text-muted-foreground truncate">{songInfo.artist}</p>
              </div>
              <Music className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          
          {/* Image */}
          {imageUrl && !isRemovedPost && (
            <div className="rounded-lg overflow-hidden">
              <img 
                src={imageUrl} 
                alt="Post content" 
                className="w-full max-h-96 object-cover"
              />
            </div>
          )}
          
          {/* Interaction Buttons */}
          {!isRemovedPost && (
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center space-x-6">
                <button 
                  onClick={handleLike}
                  className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current text-red-500' : ''}`} />
                  <span>{likesCount}</span>
                </button>
                
                <button className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <MessageCircle className="h-4 w-4" />
                  <span>{stats.comments}</span>
                </button>
                
                <button className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Share2 className="h-4 w-4" />
                  <span>{stats.shares}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
