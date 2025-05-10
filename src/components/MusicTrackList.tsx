
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSupabase } from "@/lib/supabase-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Upload, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  cover_url: string;
  track_url: string;
  duration: number;
  play_count: number;
}

interface MusicTrackListProps {
  isOwnProfile?: boolean;
  userId?: string;
}

export function MusicTrackList({ isOwnProfile = false, userId }: MusicTrackListProps) {
  const { user } = useSupabase();
  const { toast } = useToast();
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleUploadMusic = () => {
    // For now we'll just show a toast as this would require implementing a music upload feature
    toast({
      title: "Coming Soon",
      description: "Music upload functionality will be available in a future update!"
    });
  };
  
  // This would typically fetch music tracks from Supabase
  // For now, we're showing a placeholder state

  if (tracks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-4">
            <div className="rounded-full bg-muted p-6 w-24 h-24 flex items-center justify-center">
              <Play className="h-10 w-10 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">No tracks yet</h3>
          <p className="text-muted-foreground mb-4">
            {isOwnProfile 
              ? "Upload your music to share it with your followers." 
              : "This artist hasn't uploaded any tracks yet."}
          </p>
          {isOwnProfile && (
            <Button 
              variant="default" 
              className="mt-2 flex items-center gap-2"
              onClick={handleUploadMusic}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4" />
              Upload Music
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {isOwnProfile && (
        <div className="flex justify-end mb-4">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleUploadMusic}
          >
            <Plus className="h-4 w-4" />
            Add New Track
          </Button>
        </div>
      )}
      {tracks.map((track) => (
        <Card key={track.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center">
              <div className="h-16 w-16 flex-shrink-0">
                <img 
                  src={track.cover_url || "/placeholder.svg"} 
                  alt={track.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 p-4">
                <h3 className="font-semibold">{track.title}</h3>
                <p className="text-sm text-muted-foreground">{track.artist}</p>
              </div>
              <div className="pr-4">
                <Button size="sm" variant="ghost" className="rounded-full h-10 w-10 p-0">
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
