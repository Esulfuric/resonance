
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { Sidebar } from "@/components/Sidebar";
import { FeedContent } from "@/components/FeedContent";
import { CreatePostForm } from "@/components/CreatePostForm";

const Feed = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("foryou");

  // Use auth guard to protect this route
  const { user } = useAuthGuard();
  
  if (!user) {
    return <div className="flex items-center justify-center h-screen">Redirecting...</div>;
  }

  // Real trending topics data
  const trendingTopics = [
    { id: 1, name: "#NewMusicFriday", postCount: "24.5K posts" },
    { id: 2, name: "#SummerHits", postCount: "12.1K posts" },
    { id: 3, name: "#MusicProducer", postCount: "8.7K posts" },
  ];
  
  return (
    <div className="min-h-screen flex flex-col pb-16">
      <div className="container flex-1 py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {/* Main content */}
          <div className="md:col-span-2 lg:col-span-3">
            <CreatePostForm />
            <FeedContent 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>
          
          {/* Sidebar */}
          {!isMobile && (
            <Sidebar trendingTopics={trendingTopics} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;
