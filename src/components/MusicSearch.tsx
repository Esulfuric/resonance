
import { useState } from "react";
import { Search, Play, Heart, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface SearchResult {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  cover?: string;
}

const mockResults: SearchResult[] = [
  {
    id: 1,
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    duration: "3:20",
    cover: "/placeholder.svg"
  },
  {
    id: 2,
    title: "Watermelon Sugar",
    artist: "Harry Styles",
    album: "Fine Line",
    duration: "2:54",
    cover: "/placeholder.svg"
  },
];

export function MusicSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      setSearchResults(mockResults.filter(song => 
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase())
      ));
      setIsSearching(false);
    }, 1000);
  };

  const handleSongClick = (song: SearchResult) => {
    navigate(`/song/${encodeURIComponent(song.title)}/${encodeURIComponent(song.artist)}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Search Music</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search for songs, artists, or albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button 
            onClick={handleSearch} 
            disabled={isSearching}
            className="bg-resonance-orange hover:bg-resonance-orange/90"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground">Search Results</h3>
            <div className="space-y-2">
              {searchResults.map((song) => (
                <div 
                  key={song.id} 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => handleSongClick(song)}
                >
                  <div className="h-12 w-12 rounded overflow-hidden bg-muted">
                    {song.cover && <img src={song.cover} alt={song.title} className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1 overflow-hidden min-w-0">
                    <p className="font-medium truncate">{song.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                    <p className="text-xs text-muted-foreground truncate">{song.album}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{song.duration}</span>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="rounded-full p-2 bg-resonance-orange hover:bg-resonance-orange/90 text-white"
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isSearching && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-resonance-orange mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Searching...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
