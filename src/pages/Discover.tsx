
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { MusicPlayer } from "@/components/MusicPlayer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Share, Play, Pause } from "lucide-react";

interface MusicReel {
  id: number;
  user: {
    name: string;
    username: string;
    avatar?: string;
  };
  song: {
    title: string;
    artist: string;
    coverArt: string;
  };
  description: string;
  likes: number;
  comments: number;
}

const musicReels: MusicReel[] = [
  {
    id: 1,
    user: {
      name: "Emma Davis",
      username: "emmad",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    },
    song: {
      title: "Midnight Serenade",
      artist: "The Dreamers",
      coverArt: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop",
    },
    description: "This track gives me all the vibes! 🎵✨ #NewMusic #MustListen",
    likes: 423,
    comments: 57,
  },
  {
    id: 2,
    user: {
      name: "Jordan Lee",
      username: "jlee_music",
      avatar: "https://randomuser.me/api/portraits/men/62.jpg",
    },
    song: {
      title: "Electric Dreams",
      artist: "Neon Collective",
      coverArt: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop",
    },
    description: "Found this hidden gem today! The production is insane 🔥 #ElectronicMusic",
    likes: 872,
    comments: 124,
  },
  {
    id: 3,
    user: {
      name: "Mia Johnson",
      username: "mia_vibes",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    song: {
      title: "Sunset Boulevard",
      artist: "Coastal Waves",
      coverArt: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=400&auto=format&fit=crop",
    },
    description: "This is the perfect summer anthem! Been on repeat all day 🌊☀️ #SummerVibes",
    likes: 651,
    comments: 83,
  },
];

const MusicReelCard = ({ reel }: { reel: MusicReel }) => {
  const [isPlaying, setIsPlaying] = useState(false);
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
    <Card className="relative h-[600px] w-full bg-black overflow-hidden">
      {/* Background image with gradient overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ backgroundImage: `url(${reel.song.coverArt})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
      </div>
      
      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-4 text-white">
        {/* User info and description */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Avatar className="h-8 w-8 border border-white">
              <AvatarImage src={reel.user.avatar} alt={reel.user.name} />
              <AvatarFallback>{reel.user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{reel.user.name}</p>
              <p className="text-xs text-gray-300">@{reel.user.username}</p>
            </div>
            <Button variant="default" size="sm" className="ml-auto bg-resonance-green hover:bg-resonance-green/90">
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
    </Card>
  );
};

const Discover = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isAuthenticated={true} />
      <main className="container flex-1 py-6">
        <h1 className="text-2xl font-bold mb-6">Discover New Music</h1>
        
        <div className="w-full max-w-md mx-auto">
          <Carousel className="w-full">
            <CarouselContent>
              {musicReels.map((reel) => (
                <CarouselItem key={reel.id}>
                  <MusicReelCard reel={reel} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>
      </main>
      
      {!isMobile && <MusicPlayer />}
    </div>
  );
};

export default Discover;
