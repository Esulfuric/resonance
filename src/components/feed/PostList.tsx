
import React from "react";
import { Post } from "@/types/post";
import { PostCard } from "@/components/PostCard";

interface PostListProps {
  posts: Post[];
  currentUserId?: string;
  onDeletePost: (postId: string) => void;
  isLoading: boolean;
  isLoadingMore?: boolean;
  onRefreshFeed: () => void;
  lastElementRef?: (node: HTMLDivElement) => void;
}

export const PostList: React.FC<PostListProps> = ({ 
  posts, 
  currentUserId, 
  onDeletePost,
  isLoading,
  isLoadingMore = false,
  onRefreshFeed,
  lastElementRef
}) => {
  if (isLoading) {
    return <div className="text-center py-8">Loading posts...</div>;
  }
  
  if (!posts.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
      </div>
    );
  }

  // Map the posts data to the format expected by PostCard component
  const mappedPosts = posts.map((post) => {
    const profile = post.profiles || {};
    
    // Ensure we show proper names instead of just "User"
    const displayName = profile.full_name || profile.username || "Anonymous User";
    const displayUsername = profile.username || "anonymous";
    
    return {
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
  });

  return (
    <div className="space-y-4">
      {mappedPosts.map((post, index) => (
        <div 
          key={post.id}
          ref={index === mappedPosts.length - 1 ? lastElementRef : null}
        >
          <PostCard {...post} />
        </div>
      ))}
      {isLoadingMore && (
        <div className="text-center py-4">
          <p className="text-muted-foreground">Loading more posts...</p>
        </div>
      )}
    </div>
  );
};
