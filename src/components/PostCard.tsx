
import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, MoreHorizontal, Music, Pencil, Trash2, Send } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Comment } from "@/types/post";
import { toggleLikePost, checkPostLiked, addComment, fetchComments } from "@/services/postService";
import { useSupabase } from "@/lib/supabase-provider";

interface PostCardProps {
  id: string;
  user_id?: string;
  user: {
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
  isOwner?: boolean;
  onDelete?: () => void;
  onRefreshFeed?: () => void;
}

export function PostCard(props: PostCardProps) {
  const { 
    id, 
    user_id, 
    user, 
    timestamp, 
    content, 
    imageUrl, 
    songInfo, 
    stats, 
    isEdited = false, 
    isOwner = false, 
    onDelete,
    onRefreshFeed
  } = props;
  
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(stats.likes);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsCount, setCommentsCount] = useState(stats.comments);
  const [showComments, setShowComments] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const { user: currentUser } = useSupabase();

  // Check if the current user has liked this post
  useEffect(() => {
    if (currentUser) {
      checkPostLiked(id, currentUser.id).then(isLiked => {
        setLiked(isLiked);
      });
    }
  }, [id, currentUser]);

  const handleLike = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like posts.",
        variant: "destructive",
      });
      return;
    }
    
    const newLikedState = !liked;
    // Optimistic update
    setLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
    
    const result = await toggleLikePost(id, currentUser.id);
    
    if (!result.success) {
      // Revert on failure
      setLiked(liked);
      setLikesCount(stats.likes);
      toast({
        title: "Error",
        description: "Could not update like status.",
        variant: "destructive",
      });
    }
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${user_id || id.split('-')[0]}`);
  };

  const handleEdit = () => {
    setIsEditing(true);
    // Focus the textarea and set cursor at the end when it becomes visible
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          editedContent.length,
          editedContent.length
        );
      }
    }, 0);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(content);
  };

  const handleSaveEdit = async () => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ content: editedContent, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setIsEditing(false);
      toast({
        title: "Post updated",
        description: "Your changes have been saved.",
      });

      // Update the local state or refresh the feed
      if (onRefreshFeed) {
        onRefreshFeed();
      }
    } catch (error: any) {
      console.error('Error updating post:', error);
      toast({
        title: "Error updating post",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleCommentClick = () => {
    setShowComments(true);
    loadComments();
  };
  
  const loadComments = async () => {
    if (isLoadingComments) return;
    
    setIsLoadingComments(true);
    try {
      const fetchedComments = await fetchComments(id);
      setComments(fetchedComments);
      setCommentsCount(fetchedComments.length);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast({
        title: "Error loading comments",
        description: "Could not load comments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingComments(false);
    }
  };
  
  const handlePostComment = async () => {
    if (!commentText.trim() || !currentUser) return;
    
    try {
      const result = await addComment(id, currentUser.id, commentText);
      
      if (result.success && result.data) {
        setComments([...comments, result.data]);
        setCommentsCount(prevCount => prevCount + 1);
        setCommentText('');
        toast({
          title: "Comment posted",
          description: "Your comment has been added.",
        });
      } else {
        throw result.error;
      }
    } catch (error: any) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error posting comment",
        description: error.message || "Could not post comment. Please try again.",
        variant: "destructive",
      });
    }
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
                {user.user_type && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1)}
                  </span>
                )}
                <span className="text-muted-foreground text-sm ml-2">{timestamp}</span>
              </div>
              
              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleEdit}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onDelete) onDelete();
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            <div className="mt-2">
              {isEditing ? (
                <div className="space-y-2">
                  <Textarea 
                    ref={textareaRef}
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveEdit}>
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm whitespace-pre-wrap">{content}</p>
                  {isEdited && <p className="text-xs text-green-500 mt-1">Edited</p>}
                </>
              )}
              
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
            className={`gap-1 ${liked ? 'text-red-500' : 'text-muted-foreground hover:text-primary'}`}
            onClick={handleLike}
          >
            <Heart className={`h-4 w-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
            <span>{likesCount}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1 text-muted-foreground hover:text-primary"
            onClick={handleCommentClick}
          >
            <MessageCircle className="h-4 w-4" />
            <span>{commentsCount}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-primary">
            <Share2 className="h-4 w-4" />
            <span>{stats.shares}</span>
          </Button>
        </div>
      </CardFooter>
      
      {/* Comments Dialog */}
      <Dialog open={showComments} onOpenChange={setShowComments}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto space-y-4 my-4">
            {isLoadingComments ? (
              <div className="text-center py-4">Loading comments...</div>
            ) : comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id} className="flex gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user?.avatar_url} />
                    <AvatarFallback>{comment.user?.full_name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-muted p-2 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm">{comment.user?.full_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">No comments yet. Be the first to comment!</div>
            )}
          </div>
          
          {currentUser && (
            <div className="flex gap-2 mt-4">
              <Textarea 
                ref={commentInputRef}
                placeholder="Write a comment..." 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="resize-none"
              />
              <Button size="icon" onClick={handlePostComment} disabled={!commentText.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
