
import React from "react";
import { usePosts } from "@/hooks/use-posts";
import { useSupabase } from "@/lib/supabase-provider";
import { PostList } from "@/components/feed/PostList";
import { EmptyFollowingState } from "@/components/feed/EmptyFollowingState";
import { FeedTabs } from "@/components/feed/FeedTabs";
import { CreatePostForm } from "@/components/CreatePostForm";
import { Button } from "@/components/ui/button";
import { LoadingGif } from "@/components/ui/loading-gif";

interface FeedContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const FeedContent: React.FC<FeedContentProps> = ({ 
  activeTab, 
  setActiveTab 
}) => {
  const { user } = useSupabase();
  const { 
    posts, 
    isLoading, 
    isLoadingMore, 
    error,
    fetchPosts, 
    handleDeletePost, 
    lastElementRef 
  } = usePosts(user?.id);
  
  // Fetch posts when tab changes or component mounts
  React.useEffect(() => {
    fetchPosts(activeTab);
  }, [activeTab]);
  
  const handleRefresh = () => {
    fetchPosts(activeTab);
  };

  const errorView = (
    <div className="text-center py-8">
      <p className="text-destructive mb-4">{error}</p>
      <Button onClick={handleRefresh}>
        Try Again
      </Button>
    </div>
  );

  // Prepare content for each tab
  const forYouContent = (
    <>
      {user && <CreatePostForm onPostCreated={handleRefresh} />}
      {error ? errorView : <PostList 
        posts={posts} 
        currentUserId={user?.id} 
        onDeletePost={handleDeletePost}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        onRefreshFeed={handleRefresh}
        lastElementRef={lastElementRef}
      />}
    </>
  );

  const followingContent = error ? errorView : isLoading ? (
    <div className="flex flex-col items-center gap-4 py-8">
      <LoadingGif size="lg" />
      <p className="text-muted-foreground">Loading posts...</p>
    </div>
  ) : posts.length > 0 ? (
    <>
      {user && <CreatePostForm onPostCreated={handleRefresh} />}
      <PostList 
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
      isLoading={isLoading && !error}
      forYouContent={forYouContent}
      followingContent={followingContent}
    />
  );
};
