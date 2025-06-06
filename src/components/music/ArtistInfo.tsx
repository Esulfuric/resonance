
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Artist } from "@/services/music/types";

interface ArtistInfoProps {
  artist: Artist;
  onGetLyrics: (song: any) => void;
}

export const ArtistInfo = ({ artist, onGetLyrics }: ArtistInfoProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <img src={artist.image} alt={artist.name} className="w-24 h-24 rounded-lg object-cover" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{artist.name}</h2>
            <p className="text-muted-foreground mt-2">{artist.description}</p>
          </div>
        </div>
        
        {artist.songs && artist.songs.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Popular Songs</h3>
            <div className="space-y-2">
              {artist.songs.slice(0, 5).map((song, index) => (
                <div key={index} className="flex items-center gap-3 p-2 hover:bg-muted rounded">
                  <div className="w-8 h-8 rounded bg-resonance-green text-white flex items-center justify-center text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{song.title}</p>
                    <p className="text-sm text-muted-foreground">{song.duration}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => onGetLyrics(song)}>
                    Lyrics
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
