
import { useSearchParams, useParams } from "react-router-dom";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ProfileHeader } from "@/components/ProfileHeader";
import { ProfileContent } from "@/components/ProfileContent";
import { FormattedPost } from "@/types/post";

const UserProfile = () => {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const {
    profile,
    posts,
    isLoading,
    followers,
    following,
    currentUser,
    userId,
    errorMessage
  } = useUserProfile();
  
  // Use auth guard to protect this route
  useAuthGuard();
  
  // Get the active tab from URL params
  const defaultTab = searchParams.get('tab') || 'posts';
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading profile...</div>;
  }
  
  if (!!errorMessage) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-destructive/10 border border-destructive p-8 rounded-lg text-center max-w-lg">
          <h2 className="text-lg font-bold mb-2 text-destructive">Profile Not Found</h2>
          <p className="text-base">{errorMessage}</p>
        </div>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-destructive/10 border border-destructive p-8 rounded-lg text-center max-w-lg">
          <h2 className="text-lg font-bold mb-2 text-destructive">Profile Not Found</h2>
          <p className="text-base">The profile could not be found or loaded.</p>
        </div>
      </div>
    );
  }

  // Format posts for display
  const displayPosts: FormattedPost[] = posts.map((post) => {
    return {
      id: post.id,
      user: {
        name: profile?.full_name || profile?.username || "User",
        username: profile?.username || "user",
        avatar: profile?.avatar_url || "https://randomuser.me/api/portraits/women/42.jpg",
        user_type: profile?.user_type,
      },
      timestamp: new Date(post.created_at).toLocaleDateString(),
      content: post.content,
      imageUrl: post.image_url,
      songInfo: post.song_title ? {
        title: post.song_title,
        artist: "Unknown Artist",
        albumCover: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?q=80&w=200&auto=format&fit=crop",
      } : undefined,
      stats: {
        likes: 0,
        comments: 0,
        shares: 0,
      },
    };
  });
  
  const isOwnProfile = currentUser?.id === userId;
  
  return (
    <div className="min-h-screen flex flex-col">
      <main className="container flex-1 py-6">
        {/* Profile header */}
        <ProfileHeader 
          profile={{
            ...profile,
            post_count: posts.length,
            follower_count: followers.length,
            following_count: following.length
          }} 
          isOwnProfile={isOwnProfile}
        />

        {/* Profile content */}
        <ProfileContent 
          posts={displayPosts}
          followers={followers}
          following={following}
          isOwnProfile={isOwnProfile}
          defaultTab={defaultTab}
          userType={profile.user_type}
        />
      </main>
    </div>
  );
};

export default UserProfile;

