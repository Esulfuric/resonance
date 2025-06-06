
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Album } from "@/services/music/types";

interface AlbumInfoProps {
  album: Album;
}

export const AlbumInfo = ({ album }: AlbumInfoProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <img src={album.cover} alt={album.title} className="w-24 h-24 rounded-lg object-cover" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{album.title}</h2>
            <p className="text-lg text-muted-foreground">{album.artist}</p>
            {album.year && <p className="text-sm text-muted-foreground">{album.year}</p>}
          </div>
        </div>
        
        {album.tracks && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Track List</h3>
            <div className="space-y-2">
              {album.tracks.map((track, index) => (
                <div key={index} className="flex items-center gap-3 p-2 hover:bg-muted rounded">
                  <div className="w-8 h-8 rounded bg-resonance-green text-white flex items-center justify-center text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{track.title}</p>
                    <p className="text-sm text-muted-foreground">{track.duration}</p>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Play className="h-4 w-4" />
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
