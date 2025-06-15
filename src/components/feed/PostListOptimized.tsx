import React, { memo } from "react";
import { Post } from "@/types/post";
import { PostCard } from "@/components/PostCard";
import { LoadingGif } from "@/components/ui/loading-gif";

interface PostListProps {
  posts: Post[];
  currentUserId?: string;
  onDeletePost: (postId: string) => void;
  isLoading: boolean;
  isLoadingMore?: boolean;
  onRefreshFeed: () => void;
  lastElementRef?: (node: HTMLDivElement) => void;
}

const PostListSkeleton = memo(() => (
  <div className="space-y-8 py-8">
    <div className="flex flex-col items-center gap-4">
      <LoadingGif size="lg" />
      <p className="text-muted-foreground">Loading posts...</p>
    </div>
  </div>
));

const PostItem = memo(({ post, currentUserId, onDeletePost, onRefreshFeed }: {
  post: Post;
  currentUserId?: string;
  onDeletePost: (postId: string) => void;
  onRefreshFeed: () => void;
}) => {
  const profile = post.profiles || {};
  
  const displayName = profile.full_name || profile.username || "Anonymous User";
  const displayUsername = profile.username || "anonymous";
  
  const mappedPost = {
    id: post.id,
    user_id: post.user_id,
    user: {
      name: displayName,
      username: displayUsername,
      avatar: profile.avatar_url || "https://randomuser.me/api/portraits/women/42.jpg",
      user_type: profile.user_type
    },
    timestamp: new Date(post.created_at).toLocaleDateString(),
    content: post.content,
    isEdited: post.is_edited,
    songInfo: post.song_title ? {
      title: post.song_title,
      artist: "Unknown Artist",
      albumCover: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?q=80&w=200&auto=format&fit=crop",
    } : undefined,
    imageUrl: post.image_url,
    stats: {
      likes: Math.max(0, post.likes_count || 0),
      comments: Math.max(0, post.comments_count || 0),
      shares: 0,
    },
    isOwner: currentUserId === post.user_id,
    onDelete: () => onDeletePost(post.id),
    onRefreshFeed: onRefreshFeed
  };

  return <PostCard {...mappedPost} />;
});

export const PostListOptimized: React.FC<PostListProps> = memo(({ 
  posts, 
  currentUserId, 
  onDeletePost,
  isLoading,
  isLoadingMore = false,
  onRefreshFeed,
  lastElementRef
}) => {
  if (isLoading) {
    return <PostListSkeleton />;
  }
  
  if (!posts.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post, index) => (
        <div 
          key={post.id}
          ref={index === posts.length - 1 ? lastElementRef : null}
        >
          <PostItem 
            post={post}
            currentUserId={currentUserId}
            onDeletePost={onDeletePost}
            onRefreshFeed={onRefreshFeed}
          />
        </div>
      ))}
      {isLoadingMore && (
        <div className="flex flex-col items-center gap-2 py-4">
          <LoadingGif size="md" />
          <p className="text-muted-foreground">Loading more posts...</p>
        </div>
      )}
    </div>
  );
});
