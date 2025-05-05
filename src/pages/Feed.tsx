
import { CreatePostForm } from "@/components/CreatePostForm";
import { PostCard } from "@/components/PostCard";
import { TrendingMusic } from "@/components/TrendingMusic";
import { SuggestedUsers } from "@/components/SuggestedUsers";
import Navbar from "@/components/Navbar";
import { useIsMobile } from "@/hooks/use-mobile";

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

const Feed = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isAuthenticated={true} />
      <div className="container flex-1 py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {/* Main content */}
          <div className="md:col-span-2 lg:col-span-3">
            <CreatePostForm />
            <div className="space-y-4">
              {mockPosts.map((post) => (
                <PostCard key={post.id} {...post} />
              ))}
            </div>
          </div>
          
          {/* Sidebar */}
          {!isMobile && (
            <div className="space-y-6">
              <TrendingMusic />
              <SuggestedUsers />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;
