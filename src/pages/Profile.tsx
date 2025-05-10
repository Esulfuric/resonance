
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useSupabase } from "@/lib/supabase-provider";
import { ProfileHeader } from "@/components/ProfileHeader";
import { ProfileEditor } from "@/components/ProfileEditor";
import { ProfileContent } from "@/components/ProfileContent";
import { useProfileData } from "@/components/profile/ProfileData";
import { FormattedPost } from "@/types/post";

const Profile = () => {
  const { isLoading: authLoading } = useAuthGuard();
  const { user } = useSupabase();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // State for profile editing
  const [isEditing, setIsEditing] = useState(false);
  
  // Get the active tab from URL params
  const activeTab = searchParams.get('tab') || 'posts';
  
  // Use the custom hook to load profile data
  const {
    isLoading,
    profileData,
    userPosts,
    followers,
    following
  } = useProfileData(user?.id || '');
  
  // Format posts for display
  const displayPosts: FormattedPost[] = userPosts.map((post) => {
    return {
      id: post.id,
      user: {
        name: profileData.full_name || profileData.username || "User",
        username: profileData.username || "user",
        avatar: profileData.avatar_url || "https://randomuser.me/api/portraits/women/42.jpg",
        user_type: profileData.user_type,
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
        likes: post.likes_count || 0,
        comments: post.comments_count || 0,
        shares: 0,
      },
    };
  });
  
  if (authLoading || isLoading) {
    return <div className="flex items-center justify-center h-[calc(100vh-64px)]">Loading...</div>;
  }
  
  const handleAvatarUpdate = (newUrl: string) => {
    // Do nothing, the profile data will be refreshed by the hook
  };
  
  return (
    <div className="container mx-auto py-6">
      {/* Profile header or editor */}
      {isEditing ? (
        <div className="mb-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
          <ProfileEditor 
            profileData={{
              id: profileData.id,
              full_name: profileData.full_name,
              username: profileData.username,
              bio: profileData.bio,
              avatar_url: profileData.avatar_url,
              user_type: profileData.user_type
            }}
            onSave={() => setIsEditing(false)}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <ProfileHeader 
          profile={{
            ...profileData,
            post_count: profileData.post_count,
            follower_count: profileData.follower_count,
            following_count: profileData.following_count
          }} 
          isOwnProfile={true}
          onEditClick={() => setIsEditing(true)}
        />
      )}

      {/* Profile content with settings tab */}
      <ProfileContent 
        posts={displayPosts}
        followers={followers}
        following={following}
        isOwnProfile={true}
        showSettings={true}
        defaultTab={activeTab}
        userType={profileData.user_type}
      />
    </div>
  );
};

export default Profile;
