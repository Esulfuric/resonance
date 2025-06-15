
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface SpotifyTrack {
  rank: number;
  title: string;
  artist: string;
  preview_url?: string;
}

interface LocationData {
  country: string;
  countryCode: string;
  city?: string;
}

const getUserLocationFromIP = async (): Promise<LocationData> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return {
      country: data.country_name || 'United States',
      countryCode: data.country_code || 'US',
      city: data.city
    };
  } catch (error) {
    console.error('Error getting user location:', error);
    return {
      country: 'United States',
      countryCode: 'US'
    };
  }
};

const scrapeRealSpotifyCharts = async (countryCode: string): Promise<SpotifyTrack[]> => {
  try {
    // Try multiple music chart sources for country-specific data
    const sources = [
      `https://kworb.net/spotify/country/${countryCode.toLowerCase()}.html`,
      `https://charts.spotify.com/charts/view/regional-${countryCode.toLowerCase()}-weekly/latest`,
      'https://www.last.fm/charts/top-tracks'
    ];

    for (const url of sources) {
      try {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        
        if (response.ok) {
          const data = await response.json();
          const parsed = parseSpotifyChartData(data.contents);
          if (parsed.length > 0) {
            return parsed;
          }
        }
      } catch (error) {
        console.log(`Failed to fetch from ${url}:`, error);
        continue;
      }
    }

    throw new Error('All chart sources failed');
  } catch (error) {
    console.error(`Error scraping charts for ${countryCode}:`, error);
    throw error;
  }
};

const parseSpotifyChartData = (html: string): SpotifyTrack[] => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const tracks: SpotifyTrack[] = [];

    // Try different selectors based on the source
    const selectors = [
      'tr[data-track]',
      '.chartlist-row',
      '.track-row',
      'tbody tr'
    ];

    for (const selector of selectors) {
      const elements = doc.querySelectorAll(selector);
      
      elements.forEach((element, index) => {
        if (index >= 10) return; // Limit to top 10
        
        const titleElement = element.querySelector('.track-name, .chartlist-name, [data-testid="title"]');
        const artistElement = element.querySelector('.artist-name, .chartlist-artist, [data-testid="artist"]');
        
        const title = titleElement?.textContent?.trim();
        const artist = artistElement?.textContent?.trim();
        
        if (title && artist) {
          tracks.push({
            rank: index + 1,
            title,
            artist
          });
        }
      });

      if (tracks.length > 0) break;
    }

    return tracks;
  } catch (error) {
    return [];
  }
};

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
      const userLocation = await getUserLocationFromIP();
      setLocation(userLocation);
      
      // Try to scrape real charts for the user's country
      console.log('Attempting to scrape real charts for:', userLocation.countryCode);
      const realTracks = await scrapeRealSpotifyCharts(userLocation.countryCode);
      
      if (realTracks.length > 0) {
        console.log('Successfully scraped real chart data:', realTracks);
        setTracks(realTracks);
      } else {
        throw new Error('No chart data available');
      }
      
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
