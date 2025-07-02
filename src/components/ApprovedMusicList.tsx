
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Music } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface ApprovedTrack {
  id: string;
  track_title: string;
  original_file_url: string;
  upload: {
    title: string;
    composer_full_name: string;
    cover_art_url: string | null;
  };
}

export function ApprovedMusicList() {
  const [tracks, setTracks] = useState<ApprovedTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchApprovedTracks();
  }, []);

  const fetchApprovedTracks = async () => {
    try {
      const { data, error } = await supabase
        .from('music_tracks')
        .select(`
          id,
          track_title,
          original_file_url,
          upload:music_uploads!inner (
            title,
            composer_full_name,
            cover_art_url,
            status
          )
        `)
        .eq('upload.status', 'approved');

      if (error) throw error;
      setTracks(data || []);
    } catch (error: any) {
      console.error('Error fetching approved tracks:', error);
      toast({
        title: "Error",
        description: "Failed to load music tracks",
        variant: "destructive",
      });
    }
  };

  const playTrack = async (track: ApprovedTrack) => {
    try {
      // Stop current audio if playing
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }

      // Get the file URL from storage
      const { data } = supabase.storage
        .from('music-files')
        .getPublicUrl(track.original_file_url);

      const newAudio = new Audio(data.publicUrl);
      setAudio(newAudio);
      setCurrentTrack(track.id);
      setIsPlaying(true);

      newAudio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTrack(null);
      });

      newAudio.addEventListener('error', () => {
        toast({
          title: "Playback Error",
          description: "Unable to play this track",
          variant: "destructive",
        });
        setIsPlaying(false);
        setCurrentTrack(null);
      });

      await newAudio.play();
    } catch (error: any) {
      console.error('Error playing track:', error);
      toast({
        title: "Playback Error",
        description: "Unable to play this track",
        variant: "destructive",
      });
    }
  };

  const pauseTrack = () => {
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const stopTrack = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
      setCurrentTrack(null);
    }
  };

  if (tracks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <Music className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Music Available</h3>
          <p className="text-muted-foreground">
            No approved music tracks are available yet. Check back later!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5 text-resonance-orange" />
          Approved Music
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tracks.map((track) => (
          <div 
            key={track.id} 
            className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="h-12 w-12 rounded overflow-hidden bg-muted flex-shrink-0">
              {track.upload.cover_art_url ? (
                <img 
                  src={track.upload.cover_art_url} 
                  alt={track.track_title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Music className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{track.track_title}</h4>
              <p className="text-sm text-muted-foreground truncate">
                by {track.upload.composer_full_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {track.upload.title}
              </p>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full h-10 w-10 p-0"
              onClick={() => {
                if (currentTrack === track.id && isPlaying) {
                  pauseTrack();
                } else {
                  playTrack(track);
                }
              }}
            >
              {currentTrack === track.id && isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          </div>
        ))}
        
        {currentTrack && (
          <div className="fixed bottom-20 left-4 right-4 bg-background border rounded-lg p-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  Now Playing: {tracks.find(t => t.id === currentTrack)?.track_title}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={stopTrack}>
                Stop
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
