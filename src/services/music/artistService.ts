
import { Artist, Track } from './types';

const getDefaultThumbnail = (): string => {
  return 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=200&auto=format&fit=crop';
};

const getLastFmArtistInfo = async (artistName: string): Promise<Artist | null> => {
  try {
    const apiUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(artistName)}&api_key=0123456789abcdef&format=json`;
    
    const proxies = [
      'https://corsproxy.io/?',
      'https://api.codetabs.com/v1/proxy?quest=',
    ];
    
    for (const proxy of proxies) {
      try {
        const response = await fetch(proxy + encodeURIComponent(apiUrl));
        if (!response.ok) continue;
        
        const data = await response.json();
        
        if (data.artist) {
          return {
            name: data.artist.name,
            description: data.artist.bio?.summary?.replace(/<[^>]*>/g, '') || `Information about ${artistName}`,
            image: data.artist.image?.[3]?.['#text'] || getDefaultThumbnail(),
            lastfm_url: data.artist.url,
            mbid: data.artist.mbid
          };
        }
      } catch (error) {
        continue;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Last.fm artist info failed:', error);
    return null;
  }
};

const getArtistTopTracks = async (artistName: string): Promise<Track[]> => {
  try {
    const apiUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=${encodeURIComponent(artistName)}&api_key=0123456789abcdef&format=json&limit=10`;
    
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
        
        if (data.toptracks?.track) {
          const trackList = Array.isArray(data.toptracks.track) 
            ? data.toptracks.track 
            : [data.toptracks.track];
            
          trackList.forEach((track: any) => {
            tracks.push({
              title: track.name,
              artist: artistName,
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
    console.error('Error getting top tracks:', error);
    return [];
  }
};

export const getArtistInfo = async (artistName: string): Promise<Artist | null> => {
  try {
    const lastfmInfo = await getLastFmArtistInfo(artistName);
    if (lastfmInfo) {
      const songs = await getArtistTopTracks(artistName);
      return { ...lastfmInfo, songs };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting artist info:', error);
    return null;
  }
};
