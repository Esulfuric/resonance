
import { useState } from "react";
import { CreatePostForm } from "@/components/CreatePostForm";
import { PostCard } from "@/components/PostCard";
import { TrendingMusic } from "@/components/TrendingMusic";
import { SuggestedUsers } from "@/components/SuggestedUsers";
import Navbar from "@/components/Navbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCcw, Twitter, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockPosts = [
  {
    id: 1,
    user: {
      name: "Jane Cooper",
      username: "janecooper",
      avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    },
    timestamp: "2h ago",
    content: "Just discovered this amazing new track! The beat is so addictive. #MusicDiscovery",
    songInfo: {
      title: "Ocean Waves",
      artist: "Chill Vibes",
      albumCover: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?q=80&w=200&auto=format&fit=crop",
    },
    stats: {
      likes: 42,
      comments: 5,
      shares: 2,
    },
  },
  {
    id: 2,
    user: {
      name: "Robert Fox",
      username: "robertfox",
      avatar: "https://randomuser.me/api/portraits/men/64.jpg",
    },
    timestamp: "3h ago",
    content: "Throwback to this classic album that never gets old. What's your favorite track from it? 🎵",
    songInfo: {
      title: "Neon City",
      artist: "Synth Collective",
      albumCover: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=200&auto=format&fit=crop",
    },
    stats: {
      likes: 24,
      comments: 8,
      shares: 1,
    },
  },
  {
    id: 3,
    user: {
      name: "Esther Howard",
      username: "estherhoward",
      avatar: "https://randomuser.me/api/portraits/women/24.jpg",
    },
    timestamp: "5h ago",
    content: "Been listening to this on repeat all day. The lyrics really hit different today. Anyone else feel the same? 🎧",
    stats: {
      likes: 18,
      comments: 3,
      shares: 0,
    },
  },
];

const trendingTopics = [
  { id: 1, name: "#NewMusicFriday", postCount: "24.5K posts" },
  { id: 2, name: "Drake", postCount: "18.2K posts" },
  { id: 3, name: "#SummerHits", postCount: "12.1K posts" },
  { id: 4, name: "Taylor Swift", postCount: "45.8K posts" },
  { id: 5, name: "#MusicProducer", postCount: "8.7K posts" },
];

const Feed = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("foryou");
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isAuthenticated={true} />
      <div className="container flex-1 py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {/* Main content */}
          <div className="md:col-span-2 lg:col-span-3">
            <Tabs defaultValue="foryou" className="mb-6" onValueChange={setActiveTab}>
              <div className="flex items-center justify-between">
                <TabsList className="grid w-[400px] grid-cols-2">
                  <TabsTrigger value="foryou">For You</TabsTrigger>
                  <TabsTrigger value="following">Following</TabsTrigger>
                </TabsList>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>
              
              <TabsContent value="foryou" className="space-y-4 mt-4">
                <CreatePostForm />
                <div className="space-y-4">
                  {mockPosts.map((post) => (
                    <PostCard key={post.id} {...post} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="following" className="mt-4">
                <CreatePostForm />
                <div className="p-8 text-center">
                  <h3 className="text-xl font-medium mb-2">Follow more people to see their posts</h3>
                  <p className="text-muted-foreground mb-4">When you follow someone, you'll see their posts here.</p>
                  <Button>Find people to follow</Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          {!isMobile && (
            <div className="space-y-6">
              {/* What's happening section (Twitter-like) */}
              <div className="bg-card rounded-lg border overflow-hidden">
                <div className="p-4 border-b">
                  <h2 className="font-bold text-lg">What's happening</h2>
                </div>
                {trendingTopics.map((topic) => (
                  <div key={topic.id} className="p-4 hover:bg-muted transition-colors cursor-pointer border-b last:border-b-0">
                    <p className="text-xs text-muted-foreground">Trending in Music</p>
                    <p className="font-semibold">{topic.name}</p>
                    <p className="text-xs text-muted-foreground">{topic.postCount}</p>
                  </div>
                ))}
                <div className="p-4 text-primary hover:bg-muted transition-colors cursor-pointer">
                  <p>Show more</p>
                </div>
              </div>
              
              <TrendingMusic />
              <SuggestedUsers />
            </div>
          )}
        </div>
      </div>
      
      {!isMobile && (
        <div className="fixed bottom-20 right-6">
          <Button size="lg" className="h-14 w-14 rounded-full bg-resonance-green hover:bg-resonance-green/90">
            <MessageSquare className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Feed;
