
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { ArrowLeft, Play, Heart, Share2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAlbumInfo, type Album } from "@/services/musicService";

const AlbumDetails = () => {
  const { albumName, artistName } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthGuard();
  
  const [album, setAlbum] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (albumName && artistName) {
      loadAlbumData();
    }
  }, [albumName, artistName]);

  const loadAlbumData = async () => {
    if (!albumName || !artistName) return;
    
    setIsLoading(true);
    try {
      const decodedAlbum = decodeURIComponent(albumName);
      const decodedArtist = decodeURIComponent(artistName);
      const albumData = await getAlbumInfo(decodedAlbum, decodedArtist);
      setAlbum(albumData);
    } catch (error) {
      console.error('Error loading album data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Redirecting...</div>;
  }

  const decodedAlbum = albumName ? decodeURIComponent(albumName) : '';
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
                <p>Loading album information...</p>
              </CardContent>
            </Card>
          ) : album ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-start gap-6">
                    <img 
                      src={album.cover} 
                      alt={album.title}
                      className="w-32 h-32 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <CardTitle className="text-3xl">{album.title}</CardTitle>
                      <p className="text-xl text-muted-foreground mt-1">{album.artist}</p>
                      {album.year && (
                        <p className="text-sm text-muted-foreground mt-1">{album.year}</p>
                      )}
                      <div className="flex gap-2 mt-4">
                        <Button>
                          <Play className="h-4 w-4 mr-2" />
                          Play Album
                        </Button>
                        <Button variant="outline">
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button variant="outline">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => navigate(`/artist/${encodeURIComponent(album.artist)}`)}
                        >
                          <User className="h-4 w-4 mr-2" />
                          View Artist
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {album.tracks && album.tracks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Track List</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {album.tracks.map((track, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-4 p-3 hover:bg-muted rounded cursor-pointer"
                          onClick={() => navigate(`/song/${encodeURIComponent(track.title)}/${encodeURIComponent(track.artist)}`)}
                        >
                          <div className="w-8 h-8 rounded bg-resonance-green text-white flex items-center justify-center text-sm">
                            {index + 1}
                          </div>
                          {track.thumbnail && (
                            <img src={track.thumbnail} alt={track.title} className="w-10 h-10 rounded object-cover" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{track.title}</p>
                            <p className="text-sm text-muted-foreground truncate">{track.duration}</p>
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
                <p className="text-muted-foreground">Album information not found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default AlbumDetails;
