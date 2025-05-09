
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { Sidebar } from "@/components/Sidebar";
import { FeedContent } from "@/components/FeedContent";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Feed = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("foryou");

  // Use auth guard to protect this route
  const { user } = useAuthGuard();
  
  if (!user) {
    return <div className="flex items-center justify-center h-screen">Redirecting...</div>;
  }
  
  return (
    <div className="min-h-screen flex flex-col pb-16">
      <div className="container flex-1 py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {/* Main content */}
          <div className="md:col-span-2 lg:col-span-3">
            <div className="flex justify-end mb-4">
              <Button 
                onClick={() => navigate('/create-post')}
                className="bg-resonance-green hover:bg-resonance-green/90 rounded-full"
              >
                <Plus className="h-5 w-5 mr-1" /> New Post
              </Button>
            </div>
            
            <FeedContent 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>
          
          {/* Sidebar - removed "What's happening" section */}
          {!isMobile && (
            <Sidebar trendingTopics={[]} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;
