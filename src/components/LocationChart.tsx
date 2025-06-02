
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { scrapeSpotifyCharts, getUserLocation } from "@/services/webScraping";

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

export function LocationChart() {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingDemoData, setIsUsingDemoData] = useState(false);

  useEffect(() => {
    fetchLocationAndCharts();
  }, []);

  const fetchLocationAndCharts = async () => {
    try {
      setIsLoading(true);
      setIsUsingDemoData(false);
      
      // Get user's location
      console.log('Fetching user location...');
      const userLocation = await getUserLocation();
      setLocation(userLocation);
      
      // Try to scrape Spotify charts for the user's country
      console.log('Attempting to scrape Spotify charts for:', userLocation.countryCode);
      const scrapedTracks = await scrapeSpotifyCharts(userLocation.countryCode);
      
      if (scrapedTracks && scrapedTracks.length > 0) {
        console.log('Successfully scraped Spotify data:', scrapedTracks);
        setTracks(scrapedTracks);
        setIsUsingDemoData(false);
      } else {
        console.log('Scraping failed, using demo data');
        setIsUsingDemoData(true);
        setTracks(getDemoTracksForCountry(userLocation.countryCode));
      }
      
    } catch (error) {
      console.error('Error fetching location or charts:', error);
      setIsUsingDemoData(true);
      setLocation({ country: 'United States', countryCode: 'US' });
      setTracks(getDemoTracksForCountry('US'));
    } finally {
      setIsLoading(false);
    }
  };

  const getDemoTracksForCountry = (countryCode: string): SpotifyTrack[] => {
    const tracks: Record<string, SpotifyTrack[]> = {
      'US': [
        { rank: 1, title: "Flowers", artist: "Miley Cyrus" },
        { rank: 2, title: "Kill Bill", artist: "SZA" },
        { rank: 3, title: "Anti-Hero", artist: "Taylor Swift" },
        { rank: 4, title: "Creepin'", artist: "Metro Boomin ft. The Weeknd" },
        { rank: 5, title: "Unholy", artist: "Sam Smith ft. Kim Petras" }
      ],
      'GB': [
        { rank: 1, title: "Flowers", artist: "Miley Cyrus" },
        { rank: 2, title: "Miracle", artist: "Calvin Harris & Ellie Goulding" },
        { rank: 3, title: "Kill Bill", artist: "SZA" },
        { rank: 4, title: "Eyes Closed", artist: "Ed Sheeran" },
        { rank: 5, title: "Anti-Hero", artist: "Taylor Swift" }
      ],
      'DE': [
        { rank: 1, title: "Flowers", artist: "Miley Cyrus" },
        { rank: 2, title: "Komet", artist: "Udo Lindenberg & Apache 207" },
        { rank: 3, title: "Kill Bill", artist: "SZA" },
        { rank: 4, title: "Miracle", artist: "Calvin Harris & Ellie Goulding" },
        { rank: 5, title: "Shivers", artist: "Ed Sheeran" }
      ],
      'CA': [
        { rank: 1, title: "Flowers", artist: "Miley Cyrus" },
        { rank: 2, title: "Kill Bill", artist: "SZA" },
        { rank: 3, title: "Anti-Hero", artist: "Taylor Swift" },
        { rank: 4, title: "Made You Look", artist: "Meghan Trainor" },
        { rank: 5, title: "Creepin'", artist: "Metro Boomin ft. The Weeknd" }
      ]
    };
    
    return tracks[countryCode] || tracks['US'];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Top Songs in {location?.country || 'Your Country'}
        </CardTitle>
        {isUsingDemoData && (
          <p className="text-xs text-muted-foreground">Using demo data - live scraping temporarily unavailable</p>
        )}
        {!isUsingDemoData && !isLoading && (
          <p className="text-xs text-muted-foreground">
            Live data scraped from Spotify Charts • Based on your location
          </p>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">Loading charts...</div>
        ) : (
          <div className="divide-y max-h-80 overflow-y-auto">
            {tracks.map((track) => (
              <div key={track.rank} className="flex items-center gap-3 p-3 hover:bg-muted transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
                  {track.rank}
                </div>
                <div className="flex-1 overflow-hidden min-w-0">
                  <p className="font-medium truncate text-sm">{track.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  <button className="rounded-full bg-green-500 p-2 text-white hover:bg-green-600 transition-colors">
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
