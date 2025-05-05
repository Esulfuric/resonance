
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Volume, Play, SkipBack, SkipForward, Pause } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([80]);
  
  return (
    <div className="fixed bottom-0 left-0 z-40 w-full border-t bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4 w-1/4">
          <Avatar className="h-10 w-10 rounded-md">
            <AvatarImage src="https://images.unsplash.com/photo-1598387993441-a364f854c3e1?q=80&w=200&auto=format&fit=crop" alt="Album cover" />
            <AvatarFallback>AL</AvatarFallback>
          </Avatar>
          <div className="space-y-0.5 overflow-hidden">
            <h4 className="font-medium leading-tight truncate">Ocean Waves</h4>
            <p className="text-xs text-muted-foreground truncate">Chill Vibes</p>
          </div>
        </div>
        
        <div className="flex flex-col items-center w-2/4">
          <div className="flex items-center gap-4">
            <button className="rounded-full p-1 hover:bg-accent">
              <SkipBack className="h-5 w-5" />
            </button>
            <button
              className="rounded-full bg-primary text-primary-foreground p-2 hover:bg-primary/90"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button className="rounded-full p-1 hover:bg-accent">
              <SkipForward className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center gap-2 w-full max-w-md mt-1">
            <span className="text-xs text-muted-foreground">1:21</span>
            <Slider
              className="w-full"
              defaultValue={[23]}
              max={100}
              step={1}
            />
            <span className="text-xs text-muted-foreground">5:46</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-1/4 justify-end">
          <Volume className="h-4 w-4 text-muted-foreground" />
          <Slider
            className="w-24"
            value={volume}
            max={100}
            step={1}
            onValueChange={setVolume}
          />
        </div>
      </div>
    </div>
  );
}
