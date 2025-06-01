
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  user_type?: string | null;
}

interface UserCardProps {
  profile: UserProfile;
}

export const UserCard = ({ profile }: UserCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      className="hover:bg-accent transition-colors cursor-pointer"
      onClick={() => navigate(`/profile/${profile.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback>
              {(profile.full_name?.[0] || profile.username?.[0] || 'U').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{profile.full_name || profile.username || "User"}</p>
            <p className="text-sm text-muted-foreground truncate">
              @{profile.username || "user"}{" "}
              {profile.user_type && (
                <span className="inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground ml-1">
                  {profile.user_type}
                </span>
              )}
            </p>
            {profile.bio && (
              <p className="text-sm truncate mt-1">{profile.bio}</p>
            )}
          </div>
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
