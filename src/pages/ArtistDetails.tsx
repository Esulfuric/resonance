
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { ArrowLeft, Play, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getArtistInfo, type Artist } from "@/services/musicService";

const ArtistDetails = () => {
  const { artistName } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthGuard();
  
  const [artist, setArtist] = useState<Artist | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (artistName) {
      loadArtistData();
    }
  }, [artistName]);

  const loadArtistData = async () => {
    if (!artistName) return;
    
    setIsLoading(true);
    try {
      const decodedArtist = decodeURIComponent(artistName);
      const artistData = await getArtistInfo(decodedArtist);
      setArtist(artistData);
    } catch (error) {
      console.error('Error loading artist data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Redirecting...</div>;
  }

  const decodedArtist = artistName ? decodeURIComponent(artistName) : '';

  return (
    <div className="min-h-screen flex flex-col pb-16">
      <main className="container flex-1 py-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="space-y-6">
          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p>Loading artist information...</p>
              </CardContent>
            </Card>
          ) : artist ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-start gap-6">
                    <img 
                      src={artist.image} 
                      alt={artist.name}
                      className="w-32 h-32 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <CardTitle className="text-3xl">{artist.name}</CardTitle>
                      <p className="text-muted-foreground mt-2 leading-relaxed">
                        {artist.description}
                      </p>
                      <div className="flex gap-2 mt-4">
                        <Button>
                          <Play className="h-4 w-4 mr-2" />
                          Play All
                        </Button>
                        <Button variant="outline">
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button variant="outline">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {artist.songs && artist.songs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Popular Songs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {artist.songs.slice(0, 10).map((song, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-4 p-3 hover:bg-muted rounded cursor-pointer"
                          onClick={() => navigate(`/song/${encodeURIComponent(song.title)}/${encodeURIComponent(song.artist)}`)}
                        >
                          <div className="w-8 h-8 rounded bg-resonance-green text-white flex items-center justify-center text-sm">
                            {index + 1}
                          </div>
                          {song.thumbnail && (
                            <img src={song.thumbnail} alt={song.title} className="w-12 h-12 rounded object-cover" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{song.title}</p>
                            <p className="text-sm text-muted-foreground truncate">{song.duration}</p>
                          </div>
                          <Button size="sm" variant="ghost">
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Artist information not found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default ArtistDetails;
