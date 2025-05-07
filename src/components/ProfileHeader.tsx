
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useFollow } from "@/hooks/use-follow";
import { useSupabase } from "@/lib/supabase-provider";
import { useNavigate } from "react-router-dom";
import { Camera } from "lucide-react";

interface ProfileData {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  user_type?: 'musician' | 'listener';
  post_count: number;
}

interface ProfileHeaderProps {
  profile: ProfileData;
  isOwnProfile: boolean;
  onAvatarClick?: () => void;
  isUploadingAvatar?: boolean;
}

export function ProfileHeader({ 
  profile, 
  isOwnProfile, 
  onAvatarClick, 
  isUploadingAvatar = false 
}: ProfileHeaderProps) {
  const navigate = useNavigate();
  const { user: currentUser } = useSupabase();
  const { 
    isFollowing, 
    isLoading: isFollowLoading, 
    followerCount, 
    followingCount, 
    handleFollowToggle 
  } = useFollow({ profileId: profile.id });

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
        <div className="relative group">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 avatar-ring">
            <AvatarImage 
              src={profile.avatar_url} 
              alt={profile.full_name || "User"}
            />
            <AvatarFallback>
              {(profile.full_name?.[0] || profile.username?.[0] || 'U').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {isOwnProfile && onAvatarClick && (
            <div 
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={onAvatarClick}
            >
              <Camera className="h-6 w-6 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold">{profile.full_name || profile.username || "User"}</h1>
          <p className="text-muted-foreground">@{profile.username || "user"}</p>
          <div className="mt-2 flex items-center gap-2 justify-center md:justify-start">
            {profile.user_type && (
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {profile.user_type.charAt(0).toUpperCase() + profile.user_type.slice(1)}
              </span>
            )}
          </div>
          <p className="mt-2 max-w-xl">
            {profile.bio || (profile.user_type === 'musician' ? 'Musician' : 'Music enthusiast')}
          </p>
          <div className="flex gap-4 mt-4 justify-center md:justify-start">
            <div>
              <span className="font-bold">{profile.post_count}</span>{" "}
              <span className="text-muted-foreground">Posts</span>
            </div>
            <div>
              <span className="font-bold">{followingCount}</span>{" "}
              <span className="text-muted-foreground">Following</span>
            </div>
            <div>
              <span className="font-bold">{followerCount}</span>{" "}
              <span className="text-muted-foreground">Followers</span>
            </div>
          </div>
        </div>
        
        {!isOwnProfile && currentUser && (
          <div className="md:self-start">
            <Button 
              variant={isFollowing ? "outline" : "default"}
              onClick={handleFollowToggle}
              disabled={isFollowLoading}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
          </div>
        )}
        
        {isOwnProfile && (
          <div className="md:self-start">
            <Button onClick={() => navigate('/profile')}>
              Edit Profile
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
