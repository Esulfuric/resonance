
import React, { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share, Camera } from "lucide-react";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface ContentReel {
  id: number;
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  content: {
    type: 'photo' | 'video';
    url: string;
    description: string;
  };
  likes: number;
  comments: number;
}

const ContentReelCard = ({ 
  reel,
  isActive,
  handleUserClick 
}: { 
  reel: ContentReel; 
  isActive: boolean;
  handleUserClick: (userId: string) => void;
}) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(reel.likes);

  const handleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setLiked(!liked);
  };

  return (
    <div className="relative h-[100vh] w-full snap-center">
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ backgroundImage: `url(${reel.content.url})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
      </div>
      
      <div className="relative h-full flex flex-col justify-between p-4 text-white">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Avatar 
                className="h-8 w-8 border border-white cursor-pointer" 
                onClick={() => handleUserClick(reel.user.id)}
              >
                <AvatarImage src={reel.user.avatar} alt={reel.user.name} />
                <AvatarFallback>{reel.user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="cursor-pointer" onClick={() => handleUserClick(reel.user.id)}>
                <p className="font-semibold">{reel.user.name}</p>
                <p className="text-xs text-gray-300">@{reel.user.username}</p>
              </div>
            </div>
            
            <Button 
              variant="default" 
              size="sm" 
              className="bg-resonance-green hover:bg-resonance-green/90"
              onClick={(e) => {
                e.stopPropagation();
                handleUserClick(reel.user.id);
              }}
            >
              Follow
            </Button>
          </div>
          <p className="text-sm">{reel.content.description}</p>
        </div>
        
        <div className="flex justify-around">
          <button 
            className="flex flex-col items-center gap-1" 
            onClick={handleLike}
          >
            <Heart className={`h-7 w-7 ${liked ? "fill-resonance-green text-resonance-green" : ""}`} />
            <span className="text-xs">{likeCount}</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <MessageCircle className="h-7 w-7" />
            <span className="text-xs">{reel.comments}</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <Share className="h-7 w-7" />
            <span className="text-xs">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const Discover = () => {
  const isMobile = useIsMobile();
  const { isLoading } = useAuthGuard();
  const navigate = useNavigate();
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [contentReels, setContentReels] = useState<ContentReel[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchContentReels = async () => {
      try {
        setContentReels([]);
      } catch (error: any) {
        console.error('Error fetching content reels:', error);
        toast({
          title: "Error loading content",
          description: "Could not load content reels. Please try again later.",
          variant: "destructive",
        });
      }
    };
    
    fetchContentReels();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const height = container.clientHeight;
      const index = Math.round(scrollTop / height);
      setActiveReelIndex(Math.min(index, contentReels.length - 1));
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [contentReels.length]);

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return (
    <div className="h-screen flex flex-col">
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden snap-y snap-mandatory"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {contentReels.length > 0 ? (
          contentReels.map((reel, index) => (
            <ContentReelCard 
              key={reel.id} 
              reel={reel} 
              isActive={index === activeReelIndex}
              handleUserClick={handleUserClick}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md mx-auto p-4">
              <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-3">Discover Content</h2>
              <p className="text-muted-foreground">
                We're working on bringing you amazing content to discover.
                Check back later for exciting posts and updates!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;
