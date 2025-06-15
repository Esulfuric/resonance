
import React from "react";
import { usePostsUnified } from "@/hooks/use-posts-unified";
import { useSupabase } from "@/lib/supabase-provider";
import { PostListUnified } from "@/components/feed/PostListUnified";
import { EmptyFollowingState } from "@/components/feed/EmptyFollowingState";
import { FeedTabs } from "@/components/feed/FeedTabs";
import { CreatePostForm } from "@/components/CreatePostForm";

interface FeedContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const FeedContentOptimized: React.FC<FeedContentProps> = ({ 
  activeTab, 
  setActiveTab 
}) => {
  const { user } = useSupabase();
  const { 
    posts, 
    isLoading, 
    isLoadingMore, 
    fetchPosts, 
    handleDeletePost, 
    lastElementRef 
  } = usePostsUnified(user?.id);
  
  React.useEffect(() => {
    fetchPosts(activeTab);
  }, [activeTab, fetchPosts]);
  
  const handleRefresh = React.useCallback(() => {
    fetchPosts(activeTab);
  }, [activeTab, fetchPosts]);

  const forYouContent = (
    <>
      {user && <CreatePostForm onPostCreated={handleRefresh} />}
      <PostListUnified 
        posts={posts} 
        currentUserId={user?.id} 
        onDeletePost={handleDeletePost}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        onRefreshFeed={handleRefresh}
        lastElementRef={lastElementRef}
      />
    </>
  );

  const followingContent = isLoading ? (
    <PostListUnified 
      posts={[]} 
      currentUserId={user?.id} 
      onDeletePost={handleDeletePost}
      isLoading={true}
      isLoadingMore={false}
      onRefreshFeed={handleRefresh}
    />
  ) : posts.length > 0 ? (
    <>
      {user && <CreatePostForm onPostCreated={handleRefresh} />}
      <PostListUnified 
        posts={posts} 
        currentUserId={user?.id} 
        onDeletePost={handleDeletePost}
        isLoading={false}
        isLoadingMore={isLoadingMore}
        onRefreshFeed={handleRefresh}
        lastElementRef={lastElementRef}
      />
    </>
  ) : (
    <EmptyFollowingState />
  );

  return (
    <FeedTabs
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onRefresh={handleRefresh}
      isLoading={isLoading}
      forYouContent={forYouContent}
      followingContent={followingContent}
    />
  );
};
