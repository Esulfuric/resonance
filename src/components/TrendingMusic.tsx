
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TrendingSong {
  id: number;
  title: string;
  artist: string;
  cover?: string;
}

const trendingSongs: TrendingSong[] = [
  { 
    id: 1, 
    title: "Ocean Waves", 
    artist: "Chill Vibes", 
    cover: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?q=80&w=200&auto=format&fit=crop" 
  },
  { 
    id: 2, 
    title: "Midnight Drive", 
    artist: "Retrowave", 
    cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop" 
  },
  { 
    id: 3, 
    title: "Urban Jungle", 
    artist: "LoFi Beats", 
    cover: "https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?q=80&w=200&auto=format&fit=crop" 
  },
  { 
    id: 4, 
    title: "Sunrise", 
    artist: "Ambient Dreams", 
    cover: "https://images.unsplash.com/photo-1489549132488-d00b7eee80f1?q=80&w=200&auto=format&fit=crop" 
  },
  { 
    id: 5, 
    title: "Neon City", 
    artist: "Synth Collective", 
    cover: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=200&auto=format&fit=crop" 
  },
];

export function TrendingMusic() {
  const navigate = useNavigate();

  const handleSongClick = (song: TrendingSong) => {
    navigate(`/song/${encodeURIComponent(song.title)}/${encodeURIComponent(song.artist)}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Trending Music</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {trendingSongs.map((song) => (
            <div 
              key={song.id} 
              className="flex items-center gap-3 p-3 hover:bg-muted transition-colors cursor-pointer"
              onClick={() => handleSongClick(song)}
            >
              <div className="h-10 w-10 rounded overflow-hidden bg-muted">
                {song.cover && <img src={song.cover} alt={song.title} className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1 overflow-hidden min-w-0">
                <p className="font-medium truncate">{song.title}</p>
                <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
              </div>
              <div className="text-xs text-muted-foreground">
                <PlayButton />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PlayButton() {
  return (
    <button className="rounded-full bg-resonance-green p-2 text-white hover:bg-resonance-green/90 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"/>
      </svg>
    </button>
  );
}
