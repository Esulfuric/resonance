
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music } from "lucide-react";
import { fetchBillboardChartData } from "@/services/chartDataService";

interface BillboardSong {
  rank: number;
  title: string;
  artist: string;
  peak_position?: number;
  weeks_on_chart?: number;
}

export function BillboardChart() {
  const navigate = useNavigate();
  const [songs, setSongs] = useState<BillboardSong[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching Billboard chart data...');
      const chartData = await fetchBillboardChartData();
      
      console.log('Successfully loaded chart data:', chartData);
      setSongs(chartData);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      setError('Unable to load chart data at this time');
      setSongs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSongClick = (song: BillboardSong) => {
    navigate(`/song/${encodeURIComponent(song.title)}/${encodeURIComponent(song.artist)}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Music className="h-5 w-5 text-resonance-orange" />
          Top Songs Worldwide
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">Loading latest chart...</div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">
            <p>{error}</p>
            <button 
              onClick={fetchChartData}
              className="mt-2 text-sm text-resonance-orange hover:underline"
            >
              Try again
            </button>
          </div>
        ) : songs.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">No chart data available</div>
        ) : (
          <div className="divide-y max-h-96 overflow-y-auto">
            {songs.map((song) => (
              <div 
                key={song.rank} 
                className="flex items-center gap-3 p-3 hover:bg-muted transition-colors cursor-pointer"
                onClick={() => handleSongClick(song)}
              >
                <div className="w-8 h-8 rounded-full bg-resonance-orange text-white flex items-center justify-center text-sm font-bold">
                  {song.rank}
                </div>
                <div className="flex-1 overflow-hidden min-w-0">
                  <p className="font-medium truncate text-sm">{song.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                  {song.peak_position && song.weeks_on_chart && (
                    <p className="text-xs text-muted-foreground">
                      Peak: #{song.peak_position} • {song.weeks_on_chart}w
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
