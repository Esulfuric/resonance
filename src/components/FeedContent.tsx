
import React from "react";
import { usePosts } from "@/hooks/use-posts";
import { useSupabase } from "@/lib/supabase-provider";
import { PostList } from "@/components/feed/PostList";
import { EmptyFollowingState } from "@/components/feed/EmptyFollowingState";
import { FeedTabs } from "@/components/feed/FeedTabs";
import { CreatePostForm } from "@/components/CreatePostForm";

interface FeedContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const FeedContent: React.FC<FeedContentProps> = ({ 
  activeTab, 
  setActiveTab 
}) => {
  const { user } = useSupabase();
  const { posts, isLoading, fetchPosts, handleDeletePost } = usePosts(user?.id);
  
  // Fetch posts when tab changes or component mounts
  React.useEffect(() => {
    fetchPosts(activeTab);
  }, [activeTab]);
  
  const handleRefresh = () => {
    fetchPosts(activeTab);
  };

  // Prepare content for each tab
  const forYouContent = (
    <>
      {user && <CreatePostForm onPostCreated={handleRefresh} />}
      <PostList 
        posts={posts} 
        currentUserId={user?.id} 
        onDeletePost={handleDeletePost}
        isLoading={isLoading}
        onRefreshFeed={handleRefresh}
      />
    </>
  );

  const followingContent = isLoading ? (
    <div className="text-center py-8">Loading posts...</div>
  ) : posts.length > 0 ? (
    <>
      {user && <CreatePostForm onPostCreated={handleRefresh} />}
      <PostList 
        posts={posts} 
        currentUserId={user?.id} 
        onDeletePost={handleDeletePost}
        isLoading={false}
        onRefreshFeed={handleRefresh}
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
