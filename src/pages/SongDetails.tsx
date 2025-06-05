
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { ArrowLeft, Play, Heart, Share2, User, Album as AlbumIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSongLyrics, generatePlaylist, type Track } from "@/services/musicService";

const SongDetails = () => {
  const { songTitle, artist } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthGuard();
  
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [relatedTracks, setRelatedTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (songTitle && artist) {
      loadSongData();
    }
  }, [songTitle, artist]);

  const loadSongData = async () => {
    if (!songTitle || !artist) return;
    
    setIsLoading(true);
    try {
      const decodedTitle = decodeURIComponent(songTitle);
      const decodedArtist = decodeURIComponent(artist);
      
      const [lyricsData, relatedData] = await Promise.all([
        getSongLyrics(decodedTitle, decodedArtist),
        generatePlaylist({ title: decodedTitle, artist: decodedArtist }, 10)
      ]);
      
      setLyrics(lyricsData);
      setRelatedTracks(relatedData);
    } catch (error) {
      console.error('Error loading song data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Redirecting...</div>;
  }

  const decodedTitle = songTitle ? decodeURIComponent(songTitle) : '';
  const decodedArtist = artist ? decodeURIComponent(artist) : '';

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
          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Play className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl">{decodedTitle}</CardTitle>
                  <p className="text-lg text-muted-foreground mt-1">{decodedArtist}</p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm">
                      <Play className="h-4 w-4 mr-2" />
                      Play
                    </Button>
                    <Button size="sm" variant="outline">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lyrics</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-muted-foreground">Loading lyrics...</p>
                ) : lyrics ? (
                  <div className="whitespace-pre-wrap text-sm leading-relaxed max-h-96 overflow-y-auto">
                    {lyrics}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No lyrics available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Related Tracks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {relatedTracks.slice(0, 8).map((track, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-3 p-2 hover:bg-muted rounded cursor-pointer"
                      onClick={() => navigate(`/song/${encodeURIComponent(track.title)}/${encodeURIComponent(track.artist)}`)}
                    >
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                        <Play className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{track.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/artist/${encodeURIComponent(decodedArtist)}`)}
            >
              <User className="h-4 w-4 mr-2" />
              View Artist
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate(`/album/${encodeURIComponent(`${decodedTitle} - Single`)}/${encodeURIComponent(decodedArtist)}`)}
            >
              <AlbumIcon className="h-4 w-4 mr-2" />
              View Album
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SongDetails;
