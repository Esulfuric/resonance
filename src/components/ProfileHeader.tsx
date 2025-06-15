import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useFollow } from "@/hooks/use-follow";
import { useSupabase } from "@/lib/supabase-provider";
import { useNavigate } from "react-router-dom";
import { Camera, Edit, MessageCircle, Music } from "lucide-react";

interface ProfileData {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  user_type?: 'musician' | 'listener';
  post_count: number;
  follower_count?: number;
  following_count?: number;
}

interface ProfileHeaderProps {
  profile: ProfileData;
  isOwnProfile: boolean;
  onAvatarClick?: () => void;
  isUploadingAvatar?: boolean;
  onEditClick?: () => void;
}

export function ProfileHeader({ 
  profile, 
  isOwnProfile, 
  onAvatarClick, 
  isUploadingAvatar = false,
  onEditClick
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

  // Use provided counts if available, otherwise use values from useFollow
  const displayFollowerCount = profile.follower_count !== undefined ? profile.follower_count : followerCount;
  const displayFollowingCount = profile.following_count !== undefined ? profile.following_count : followingCount;

  const handleMessageClick = () => {
    navigate(`/messages?user=${profile.id}`);
  };

  // Canonical username-based navigation only:
  const getUsernameUrl = (tab?: string) => {
    const username = profile.username || 'user';
    const prefix = profile.user_type === 'musician' ? 'm' : 'l';
    const baseUrl = `/${prefix}/${username}`;
    return tab ? `${baseUrl}?tab=${tab}` : baseUrl;
  };

  return (
    <div className="mb-6 px-4 md:px-0">
      <div className="flex flex-col items-center space-y-4 md:flex-row md:items-start md:space-y-0 md:space-x-6">
        <div className="relative group shrink-0">
          <Avatar className={`h-20 w-20 md:h-32 md:w-32 avatar-ring ${isUploadingAvatar ? 'opacity-50' : ''}`}>
            <AvatarImage 
              src={profile.avatar_url} 
              alt={profile.full_name || "User"}
            />
            <AvatarFallback className="text-lg md:text-2xl">
              {(profile.full_name?.[0] || profile.username?.[0] || 'U').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {isOwnProfile && onAvatarClick && (
            <div 
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={onAvatarClick}
            >
              <Camera className="h-5 w-5 md:h-6 md:w-6 text-white" />
              {isUploadingAvatar && <span className="absolute inset-0 flex items-center justify-center text-white text-xs">Uploading...</span>}
            </div>
          )}
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-3 md:space-y-4 min-w-0">
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-bold truncate">{profile.full_name || profile.username || "User"}</h1>
            <p className="text-muted-foreground text-sm md:text-base">@{profile.username || "user"}</p>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              {profile.user_type && (
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  profile.user_type === 'musician' 
                    ? 'bg-resonance-green/10 text-resonance-green flex gap-1' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {profile.user_type === 'musician' && <Music className="h-3 w-3" />}
                  {profile.user_type.charAt(0).toUpperCase() + profile.user_type.slice(1)}
                </span>
              )}
            </div>
          </div>
          
          <p className="text-sm md:text-base max-w-xl leading-relaxed">
            {profile.bio || (profile.user_type === 'musician' ? 'Musician sharing their musical journey.' : 'Music enthusiast')}
          </p>
          
          {/* Stats row */}
          <div className="flex gap-4 justify-center md:justify-start text-sm">
            <div className="cursor-pointer hover:text-resonance-green transition-colors" onClick={() => navigate(getUsernameUrl('posts'))}>
              <span className="font-bold">{profile.post_count}</span>{" "}
              <span className="text-muted-foreground">Posts</span>
            </div>
            <div className="cursor-pointer hover:text-resonance-green transition-colors" onClick={() => navigate(getUsernameUrl('following'))}>
              <span className="font-bold">{displayFollowingCount}</span>{" "}
              <span className="text-muted-foreground">Following</span>
            </div>
            <div className="cursor-pointer hover:text-resonance-green transition-colors" onClick={() => navigate(getUsernameUrl('followers'))}>
              <span className="font-bold">{displayFollowerCount}</span>{" "}
              <span className="text-muted-foreground">Followers</span>
            </div>
            
            {/* Music tracks count for musicians */}
            {profile.user_type === 'musician' && (
              <div className="cursor-pointer hover:text-resonance-green transition-colors" onClick={() => navigate(getUsernameUrl('music'))}>
                <span className="font-bold">0</span>{" "}
                <span className="text-muted-foreground">Tracks</span>
              </div>
            )}
          </div>
        </div>
        
        {!isOwnProfile && currentUser && (
          <div className="flex gap-2 shrink-0">
            <Button 
              variant={isFollowing ? "outline" : "default"}
              onClick={handleFollowToggle}
              disabled={isFollowLoading}
              size="sm"
              className="text-sm"
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleMessageClick}
              size="sm"
              className="flex gap-2 items-center text-sm"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Message</span>
            </Button>
          </div>
        )}
        
        {isOwnProfile && onEditClick && (
          <div className="shrink-0">
            <Button onClick={onEditClick} size="sm" className="flex gap-2 items-center text-sm">
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">Edit Profile</span>
              <span className="sm:hidden">Edit</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
