
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import { SearchForm } from "./music/SearchForm";
import { TrackList } from "./music/TrackList";
import { ArtistInfo } from "./music/ArtistInfo";
import { AlbumInfo } from "./music/AlbumInfo";

export const MusicSearch = () => {
  const navigate = useNavigate();
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
      <SearchForm 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
        isSearching={isSearching}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="tracks">Tracks ({searchResults.length})</TabsTrigger>
          <TabsTrigger value="artists">Artists</TabsTrigger>
          <TabsTrigger value="albums">Albums</TabsTrigger>
          <TabsTrigger value="playlists">Suggestions ({playlist.length})</TabsTrigger>
          <TabsTrigger value="lyrics">Lyrics</TabsTrigger>
        </TabsList>

        <TabsContent value="tracks">
          <TrackList 
            tracks={searchResults}
            onArtistClick={searchArtist}
            onLyricsClick={getLyrics}
          />
        </TabsContent>

        <TabsContent value="artists" className="space-y-4">
          {artistInfo && <ArtistInfo artist={artistInfo} onGetLyrics={getLyrics} />}
        </TabsContent>

        <TabsContent value="albums" className="space-y-4">
          {albumInfo && <AlbumInfo album={albumInfo} />}
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
