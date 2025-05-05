
import { useState } from "react";
import { Heart, MessageCircle, Share } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

interface PostCardProps {
  user: {
    name: string;
    username: string;
    avatar?: string;
  };
  timestamp: string;
  content: string;
  songInfo?: {
    title: string;
    artist: string;
    albumCover?: string;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
}

export function PostCard({
  user,
  timestamp,
  content,
  songInfo,
  stats,
}: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(stats.likes);

  const handleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setLiked(!liked);
  };

  return (
    <Card className="mb-4 border-border bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="avatar-ring">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1">
                <p className="text-sm font-medium">{user.name}</p>
                <span className="text-xs text-muted-foreground">@{user.username}</span>
              </div>
              <p className="text-xs text-muted-foreground">{timestamp}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="mb-3">{content}</p>
        {songInfo && (
          <div className="flex items-center gap-3 rounded-md bg-secondary p-3 cursor-pointer hover:bg-secondary/80 transition-colors">
            <Avatar className="h-12 w-12 rounded-md">
              <AvatarImage src={songInfo.albumCover} alt={songInfo.title} />
              <AvatarFallback>{songInfo.title.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{songInfo.title}</p>
              <p className="text-xs text-muted-foreground">{songInfo.artist}</p>
            </div>
            <Button size="sm" className="ml-auto h-8 bg-resonance-green hover:bg-resonance-green/90" variant="default">
              <Play className="h-4 w-4 mr-1" />
              Play
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 border-t">
        <div className="flex items-center justify-between w-full">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-1 ${liked ? "text-resonance-green" : ""}`}
            onClick={handleLike}
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-resonance-green" : ""}`} />
            {likeCount}
          </Button>
          <Button variant="ghost" size="sm" className="gap-1">
            <MessageCircle className="h-4 w-4" />
            {stats.comments}
          </Button>
          <Button variant="ghost" size="sm" className="gap-1">
            <Share className="h-4 w-4" />
            {stats.shares}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

// Missing import mock
function Play(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
}
