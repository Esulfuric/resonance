
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
    // Instead of just "Loading", render skeleton rows for instant feedback
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, idx) => (
          <div key={idx} className="p-4 border rounded-lg flex flex-col gap-2 animate-pulse bg-muted">
            <div className="flex items-center gap-3">
              <div className="bg-gray-300 rounded-full h-8 w-8" />
              <div className="h-4 bg-gray-300 rounded w-1/3" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mt-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2 mt-1" />
          </div>
        ))}
      </div>
    );
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
      {posts.map((post, index) => {
        const profile = post.profiles || {};
        
        // Ensure we show proper names instead of just "User"
        const displayName = profile.full_name || profile.username || "Anonymous User";
        const displayUsername = profile.username || "anonymous";
        
        return (
          <div 
            key={post.id}
            ref={index === posts.length - 1 ? lastElementRef : null}
          >
            <PostCard
              id={post.id}
              user_id={post.user_id}
              user={{
                id: post.user_id,
                name: displayName,
                username: displayUsername,
                avatar: profile.avatar_url || "https://randomuser.me/api/portraits/women/42.jpg",
                user_type: profile.user_type
              }}
              timestamp={new Date(post.created_at).toLocaleDateString()}
              content={post.content}
              isEdited={post.is_edited}
              songInfo={post.song_title ? {
                title: post.song_title,
                artist: "Unknown Artist",
                albumCover: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?q=80&w=200&auto=format&fit=crop",
              } : undefined}
              imageUrl={post.image_url}
              stats={{
                likes: Math.max(0, post.likes_count || 0),
                comments: Math.max(0, post.comments_count || 0),
                shares: 0,
              }}
              likes_count={post.likes_count}
              comments_count={post.comments_count}
              is_removed={post.is_removed}
              removal_reason={post.removal_reason}
              currentUserId={currentUserId}
              onDeletePost={onDeletePost}
              onRefreshFeed={onRefreshFeed}
            />
          </div>
        );
      })}
      {isLoadingMore && (
        <div className="text-center py-4">
          <p className="text-muted-foreground">Loading more posts...</p>
        </div>
      )}
    </div>
  );
};
