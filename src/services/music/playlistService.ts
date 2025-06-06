
import { Track } from './types';

const getDefaultThumbnail = (): string => {
  return 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=200&auto=format&fit=crop';
};

const getSimilarTracks = async (title: string, artist: string): Promise<Track[]> => {
  try {
    const apiUrl = `https://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(title)}&api_key=0123456789abcdef&format=json&limit=10`;
    
    const proxies = [
      'https://corsproxy.io/?',
      'https://api.codetabs.com/v1/proxy?quest=',
    ];
    
    for (const proxy of proxies) {
      try {
        const response = await fetch(proxy + encodeURIComponent(apiUrl));
        if (!response.ok) continue;
        
        const data = await response.json();
        const tracks: Track[] = [];
        
        if (data.similartracks?.track) {
          const trackList = Array.isArray(data.similartracks.track) 
            ? data.similartracks.track 
            : [data.similartracks.track];
            
          trackList.forEach((track: any) => {
            tracks.push({
              title: track.name,
              artist: track.artist?.name || 'Unknown Artist',
              thumbnail: track.image?.[2]?.['#text'] || getDefaultThumbnail(),
              lastfm_url: track.url,
              mbid: track.mbid
            });
          });
        }
        
        return tracks;
      } catch (error) {
        continue;
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error getting similar tracks:', error);
    return [];
  }
};

export const generatePlaylist = async (seedTrack: Track, count: number = 10): Promise<Track[]> => {
  try {
    const similarTracks = await getSimilarTracks(seedTrack.title, seedTrack.artist);
    return similarTracks.slice(0, count);
  } catch (error) {
    console.error('Error generating playlist:', error);
    return [];
  }
};

export const getSongLyrics = async (title: string, artist: string): Promise<string | null> => {
  try {
    return `Lyrics for "${title}" by ${artist} would appear here.\n\nTo get actual lyrics, you would need to integrate with a lyrics service like Genius API or similar.`;
  } catch (error) {
    console.error('Error getting lyrics:', error);
    return null;
  }
};
