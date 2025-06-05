
import { useState } from "react";
import { Search, Play, User, Album as AlbumIcon, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  extractYouTubeMusicData, 
  getArtistInfo, 
  getSongLyrics, 
  generatePlaylist,
  getAlbumInfo,
  type Track, 
  type Artist,
  type Album 
} from "@/services/musicService";

export const MusicSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [artistInfo, setArtistInfo] = useState<Artist | null>(null);
  const [selectedLyrics, setSelectedLyrics] = useState<string | null>(null);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [albumInfo, setAlbumInfo] = useState<Album | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("tracks");

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    
    try {
      const tracks = await extractYouTubeMusicData(searchQuery);
      setSearchResults(tracks);
      
      if (tracks.length > 0) {
        // Generate related playlist from first result
        const relatedTracks = await generatePlaylist(tracks[0]);
        setPlaylist(relatedTracks);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const searchArtist = async (artistName: string) => {
    setIsSearching(true);
    try {
      const info = await getArtistInfo(artistName);
      setArtistInfo(info);
      setActiveTab("artists");
    } catch (error) {
      console.error('Artist search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const getLyrics = async (track: Track) => {
    setIsSearching(true);
    try {
      const lyrics = await getSongLyrics(track.title, track.artist);
      setSelectedLyrics(lyrics);
      setActiveTab("lyrics");
    } catch (error) {
      console.error('Lyrics fetch failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const searchAlbum = async (albumName: string, artistName: string) => {
    setIsSearching(true);
    try {
      const album = await getAlbumInfo(albumName, artistName);
      setAlbumInfo(album);
      setActiveTab("albums");
    } catch (error) {
      console.error('Album search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Music Discovery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search for songs, artists, or albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isSearching}>
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="tracks">Tracks ({searchResults.length})</TabsTrigger>
          <TabsTrigger value="artists">Artists</TabsTrigger>
          <TabsTrigger value="albums">Albums</TabsTrigger>
          <TabsTrigger value="playlists">Suggestions ({playlist.length})</TabsTrigger>
          <TabsTrigger value="lyrics">Lyrics</TabsTrigger>
        </TabsList>

        <TabsContent value="tracks" className="space-y-3">
          {searchResults.map((track, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center gap-4">
                {track.thumbnail && (
                  <img src={track.thumbnail} alt={track.title} className="w-12 h-12 rounded object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{track.title}</h3>
                  <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                  {track.duration && (
                    <p className="text-xs text-muted-foreground">{track.duration}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => searchArtist(track.artist)}>
                    <User className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => getLyrics(track)}>
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button size="sm">
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="artists" className="space-y-4">
          {artistInfo && (
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <img src={artistInfo.image} alt={artistInfo.name} className="w-24 h-24 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{artistInfo.name}</h2>
                    <p className="text-muted-foreground mt-2">{artistInfo.description}</p>
                  </div>
                </div>
                
                {artistInfo.songs && artistInfo.songs.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Popular Songs</h3>
                    <div className="space-y-2">
                      {artistInfo.songs.slice(0, 5).map((song, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 hover:bg-muted rounded">
                          <div className="w-8 h-8 rounded bg-resonance-green text-white flex items-center justify-center text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{song.title}</p>
                            <p className="text-sm text-muted-foreground">{song.duration}</p>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => getLyrics(song)}>
                            Lyrics
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="albums" className="space-y-4">
          {albumInfo && (
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <img src={albumInfo.cover} alt={albumInfo.title} className="w-24 h-24 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{albumInfo.title}</h2>
                    <p className="text-lg text-muted-foreground">{albumInfo.artist}</p>
                    {albumInfo.year && <p className="text-sm text-muted-foreground">{albumInfo.year}</p>}
                  </div>
                </div>
                
                {albumInfo.tracks && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Track List</h3>
                    <div className="space-y-2">
                      {albumInfo.tracks.map((track, index) => (
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
          )}
        </TabsContent>

        <TabsContent value="playlists" className="space-y-3">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Suggested Tracks</h3>
            <p className="text-sm text-muted-foreground">Based on your search results</p>
          </div>
          {playlist.map((track, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center gap-3">
                {track.thumbnail && (
                  <img src={track.thumbnail} alt={track.title} className="w-10 h-10 rounded object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm">{track.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Suggested
                </Badge>
                <Button size="sm" variant="ghost">
                  <Play className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="lyrics" className="space-y-4">
          {selectedLyrics ? (
            <Card>
              <CardHeader>
                <CardTitle>Song Lyrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {selectedLyrics}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No lyrics selected. Click the lyrics button on any track to view lyrics.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
