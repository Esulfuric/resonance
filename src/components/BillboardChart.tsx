
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music } from "lucide-react";

interface BillboardSong {
  rank: number;
  title: string;
  artist: string;
  last_week?: number;
  peak_position: number;
  weeks_on_chart: number;
}

export function BillboardChart() {
  const [songs, setSongs] = useState<BillboardSong[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBillboardChart();
  }, []);

  const fetchBillboardChart = async () => {
    try {
      setIsLoading(true);
      // Using a proxy service to fetch Billboard data
      const response = await fetch('https://billboard-api2.p.rapidapi.com/hot-100', {
        headers: {
          'X-RapidAPI-Key': 'RAPIDAPI_KEY', // This will be replaced with the actual key
          'X-RapidAPI-Host': 'billboard-api2.p.rapidapi.com'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch Billboard data');
      }
      
      const data = await response.json();
      setSongs(data.content?.slice(0, 10) || getDemoData());
    } catch (error) {
      console.error('Error fetching Billboard data:', error);
      setError('Using demo data - connect API key for live data');
      setSongs(getDemoData());
    } finally {
      setIsLoading(false);
    }
  };

  const getDemoData = (): BillboardSong[] => [
    { rank: 1, title: "Flowers", artist: "Miley Cyrus", peak_position: 1, weeks_on_chart: 12 },
    { rank: 2, title: "Kill Bill", artist: "SZA", peak_position: 2, weeks_on_chart: 8 },
    { rank: 3, title: "Anti-Hero", artist: "Taylor Swift", peak_position: 1, weeks_on_chart: 20 },
    { rank: 4, title: "Creepin'", artist: "Metro Boomin, The Weeknd, 21 Savage", peak_position: 3, weeks_on_chart: 15 },
    { rank: 5, title: "Unholy", artist: "Sam Smith ft. Kim Petras", peak_position: 1, weeks_on_chart: 25 },
    { rank: 6, title: "As It Was", artist: "Harry Styles", peak_position: 1, weeks_on_chart: 40 },
    { rank: 7, title: "Rich Flex", artist: "Drake & 21 Savage", peak_position: 2, weeks_on_chart: 10 },
    { rank: 8, title: "Karma", artist: "Taylor Swift", peak_position: 8, weeks_on_chart: 3 },
    { rank: 9, title: "Shakira: Bzrp Music Sessions, Vol. 53", artist: "Bizarrap & Shakira", peak_position: 9, weeks_on_chart: 6 },
    { rank: 10, title: "Boy's a liar Pt. 2", artist: "PinkPantheress & Ice Spice", peak_position: 10, weeks_on_chart: 4 }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Music className="h-5 w-5" />
          Billboard Hot 100
        </CardTitle>
        {error && (
          <p className="text-xs text-muted-foreground">{error}</p>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">Loading chart...</div>
        ) : (
          <div className="divide-y max-h-96 overflow-y-auto">
            {songs.map((song) => (
              <div key={song.rank} className="flex items-center gap-3 p-3 hover:bg-muted transition-colors">
                <div className="w-8 h-8 rounded-full bg-resonance-green text-white flex items-center justify-center text-sm font-bold">
                  {song.rank}
                </div>
                <div className="flex-1 overflow-hidden min-w-0">
                  <p className="font-medium truncate text-sm">{song.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                  <p className="text-xs text-muted-foreground">
                    Peak: #{song.peak_position} • {song.weeks_on_chart}w
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
