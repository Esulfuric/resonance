
import React, { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { MusicPlayer } from "@/components/MusicPlayer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share, Play, Pause } from "lucide-react";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface MusicReel {
  id: number;
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  song: {
    title: string;
    artist: string;
    coverArt: string;
    audioUrl?: string;
  };
  description: string;
  likes: number;
  comments: number;
}

const MusicReelCard = ({ 
  reel,
  isActive,
  handleUserClick 
}: { 
  reel: MusicReel; 
  isActive: boolean;
  handleUserClick: (userId: string) => void;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(reel.likes);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setLiked(!liked);
  };

  // Control audio playback
  useEffect(() => {
    if (!audioRef.current || !reel.song.audioUrl) return;
    
    if (isActive && isPlaying) {
      audioRef.current.play().catch(e => console.error("Audio playback error:", e));
    } else {
      audioRef.current.pause();
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [isActive, isPlaying, reel.song.audioUrl]);

  // Pause when not visible
  useEffect(() => {
    if (!isActive && isPlaying) {
      setIsPlaying(false);
    }
  }, [isActive, isPlaying]);

  return (
    <div className="relative h-[100vh] w-full snap-center">
      {/* Background image with gradient overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ backgroundImage: `url(${reel.song.coverArt})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
      </div>
      
      {/* Audio element */}
      {reel.song.audioUrl && (
        <audio 
          ref={audioRef} 
          src={reel.song.audioUrl} 
          loop
          onEnded={() => setIsPlaying(false)}
        />
      )}
      
      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-4 text-white">
        {/* User info and description */}
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
            
            {/* Moved Follow button to the right */}
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
          <p className="text-sm">{reel.description}</p>
        </div>
        
        {/* Album cover and song info */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div 
            className="relative w-48 h-48 rounded-lg shadow-xl bg-cover bg-center border border-white/20"
            style={{ backgroundImage: `url(${reel.song.coverArt})` }}
          >
            <button 
              className="absolute inset-0 flex items-center justify-center"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              <div className="rounded-full bg-black/50 p-4">
                {isPlaying ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8" />
                )}
              </div>
            </button>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold">{reel.song.title}</h3>
            <p className="text-sm text-gray-300">{reel.song.artist}</p>
          </div>
        </div>
        
        {/* Actions */}
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
  const [musicReels, setMusicReels] = useState<MusicReel[]>([]);
  const { toast } = useToast();

  // Fetch music reels from Supabase (for now, return an empty array)
  useEffect(() => {
    const fetchMusicReels = async () => {
      try {
        // For now, returning an empty array
        // In the future, we would implement real data fetching from Supabase
        setMusicReels([]);
      } catch (error: any) {
        console.error('Error fetching music reels:', error);
        toast({
          title: "Error loading content",
          description: "Could not load music reels. Please try again later.",
          variant: "destructive",
        });
      }
    };
    
    fetchMusicReels();
  }, []);

  // Handle scroll events to determine which reel is active
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const height = container.clientHeight;
      const index = Math.round(scrollTop / height);
      setActiveReelIndex(Math.min(index, musicReels.length - 1));
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [musicReels.length]);

  const handleUserClick = (userId: string) => {
    // Navigate to user profile
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
        {musicReels.length > 0 ? (
          musicReels.map((reel, index) => (
            <MusicReelCard 
              key={reel.id} 
              reel={reel} 
              isActive={index === activeReelIndex}
              handleUserClick={handleUserClick}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md mx-auto p-4">
              <h2 className="text-2xl font-bold mb-3">Coming Soon</h2>
              <p className="text-muted-foreground">
                We're working on bringing you the best music content.
                Check back later for exciting music reels!
              </p>
            </div>
          </div>
        )}
      </div>
      
      {!isMobile && <MusicPlayer />}
    </div>
  );
};

export default Discover;
