
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PostCard } from "@/components/PostCard";
import Navbar from "@/components/Navbar";
import { Music, Users, Settings } from "lucide-react";

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
      name: "Jane Cooper",
      username: "janecooper",
      avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    },
    timestamp: "3 days ago",
    content: "This playlist is perfect for my morning workouts. Highly recommend! 💪",
    songInfo: {
      title: "Midnight Drive",
      artist: "Retrowave",
      albumCover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop",
    },
    stats: {
      likes: 38,
      comments: 4,
      shares: 7,
    },
  },
];

const Profile = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isAuthenticated={true} />
      <main className="container flex-1 py-6">
        {/* Profile header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 avatar-ring">
              <AvatarImage src="https://randomuser.me/api/portraits/women/42.jpg" alt="Jane Cooper" />
              <AvatarFallback>JC</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold">Jane Cooper</h1>
              <p className="text-muted-foreground">@janecooper</p>
              <p className="mt-2 max-w-xl">
                Music enthusiast | Indie rock & electronic | Always hunting for new sounds 🎵
              </p>
              <div className="flex gap-4 mt-4 justify-center md:justify-start">
                <div>
                  <span className="font-bold">128</span>{" "}
                  <span className="text-muted-foreground">Posts</span>
                </div>
                <div>
                  <span className="font-bold">547</span>{" "}
                  <span className="text-muted-foreground">Following</span>
                </div>
                <div>
                  <span className="font-bold">2.3k</span>{" "}
                  <span className="text-muted-foreground">Followers</span>
                </div>
              </div>
            </div>
            <div className="md:self-start">
              <Button>Edit Profile</Button>
            </div>
          </div>
        </div>

        {/* Profile content */}
        <Tabs defaultValue="posts" className="mt-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto md:mx-0">
            <TabsTrigger value="posts" className="flex gap-2 items-center">
              <Music className="h-4 w-4" />
              <span className="hidden sm:inline">Posts</span>
            </TabsTrigger>
            <TabsTrigger value="following" className="flex gap-2 items-center">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Following</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex gap-2 items-center">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="mt-6 space-y-6">
            {mockPosts.map((post) => (
              <PostCard key={post.id} {...post} />
            ))}
          </TabsContent>
          <TabsContent value="following" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${(i + 1) * 10}.jpg`} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{["Alex Kim", "Mia Johnson", "Jordan Lee", "Taylor Swift", "Sam Smith", "Emma Davis"][i]}</p>
                    <p className="text-xs text-muted-foreground">@{["alex_beats", "mia_vibes", "jlee_music", "taylor", "samsmith", "emmad"][i]}</p>
                  </div>
                  <Button variant="outline" size="sm">Following</Button>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="settings" className="mt-6">
            <div className="max-w-md space-y-4">
              <div className="space-y-1">
                <h3 className="font-medium">Account Settings</h3>
                <p className="text-sm text-muted-foreground">Manage your account preferences and settings.</p>
              </div>
              <div className="border rounded-lg divide-y">
                <div className="p-4">
                  <h4 className="font-medium">Profile Information</h4>
                  <Button size="sm" variant="outline" className="mt-2">Edit</Button>
                </div>
                <div className="p-4">
                  <h4 className="font-medium">Email & Password</h4>
                  <Button size="sm" variant="outline" className="mt-2">Change</Button>
                </div>
                <div className="p-4">
                  <h4 className="font-medium">Privacy Settings</h4>
                  <Button size="sm" variant="outline" className="mt-2">Manage</Button>
                </div>
                <div className="p-4">
                  <h4 className="font-medium">Connected Accounts</h4>
                  <Button size="sm" variant="outline" className="mt-2">View</Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;
