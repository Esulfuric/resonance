
import { useNavigate } from "react-router-dom";
import { Play, User, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Track } from "@/services/music/types";

interface TrackListProps {
  tracks: Track[];
  onArtistClick: (artistName: string) => void;
  onLyricsClick: (track: Track) => void;
}

export const TrackList = ({ tracks, onArtistClick, onLyricsClick }: TrackListProps) => {
  const navigate = useNavigate();

  const handleTrackClick = (track: Track) => {
    navigate(`/song/${encodeURIComponent(track.title)}/${encodeURIComponent(track.artist)}`);
  };

  return (
    <div className="space-y-3">
      {tracks.map((track, index) => (
        <Card key={index} className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
          <div className="flex items-center gap-4">
            {track.thumbnail && (
              <img src={track.thumbnail} alt={track.title} className="w-12 h-12 rounded object-cover" />
            )}
            <div className="flex-1 min-w-0" onClick={() => handleTrackClick(track)}>
              <h3 className="font-medium truncate">{track.title}</h3>
              <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
              {track.duration && (
                <p className="text-xs text-muted-foreground">{track.duration}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={(e) => {
                e.stopPropagation();
                onArtistClick(track.artist);
              }}>
                <User className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={(e) => {
                e.stopPropagation();
                onLyricsClick(track);
              }}>
                <Heart className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={() => handleTrackClick(track)}>
                <Play className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
