
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { getUserLocation, fetchLocationChartData } from "@/services/chartDataService";

interface SpotifyTrack {
  rank: number;
  title: string;
  artist: string;
  peak_position?: number;
  weeks_on_chart?: number;
}

interface LocationData {
  country: string;
  countryCode: string;
  city?: string;
}

export function LocationChart() {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLocationAndCharts();
  }, []);

  const fetchLocationAndCharts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get user's location
      console.log('Fetching user location...');
      const userLocation = await getUserLocation();
      setLocation(userLocation);
      
      // Fetch charts for the user's country
      console.log('Fetching location-specific charts for:', userLocation.country);
      const chartData = await fetchLocationChartData(userLocation.country);
      
      console.log('Successfully loaded location chart data:', chartData);
      setTracks(chartData);
      
    } catch (error) {
      console.error('Error fetching location or charts:', error);
      setError('Unable to load chart data for your location');
      setLocation({ country: 'United States', countryCode: 'US' });
      setTracks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackClick = (track: SpotifyTrack) => {
    navigate(`/song/${encodeURIComponent(track.title)}/${encodeURIComponent(track.artist)}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5 text-resonance-orange" />
          Top Songs in {location?.country || 'Your Country'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">Loading charts...</div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">
            <p>{error}</p>
            <button 
              onClick={fetchLocationAndCharts}
              className="mt-2 text-sm text-resonance-orange hover:underline"
            >
              Try again
            </button>
          </div>
        ) : tracks.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">No chart data available</div>
        ) : (
          <div className="divide-y max-h-80 overflow-y-auto">
            {tracks.map((track) => (
              <div 
                key={track.rank} 
                className="flex items-center gap-3 p-3 hover:bg-muted transition-colors cursor-pointer"
                onClick={() => handleTrackClick(track)}
              >
                <div className="w-8 h-8 rounded-full bg-resonance-orange text-white flex items-center justify-center text-sm font-bold">
                  {track.rank}
                </div>
                <div className="flex-1 overflow-hidden min-w-0">
                  <p className="font-medium truncate text-sm">{track.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                  {track.peak_position && track.weeks_on_chart && (
                    <p className="text-xs text-muted-foreground">
                      Peak: #{track.peak_position} • {track.weeks_on_chart}w
                    </p>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  <button className="rounded-full bg-resonance-orange p-2 text-white hover:bg-resonance-orange/80 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
