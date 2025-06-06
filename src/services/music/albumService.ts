
import { Album, Track } from './types';

const getDefaultThumbnail = (): string => {
  return 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=200&auto=format&fit=crop';
};

const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const getAlbumInfo = async (albumName: string, artistName: string): Promise<Album | null> => {
  try {
    const apiUrl = `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&artist=${encodeURIComponent(artistName)}&album=${encodeURIComponent(albumName)}&api_key=0123456789abcdef&format=json`;
    
    const proxies = [
      'https://corsproxy.io/?',
      'https://api.codetabs.com/v1/proxy?quest=',
    ];
    
    for (const proxy of proxies) {
      try {
        const response = await fetch(proxy + encodeURIComponent(apiUrl));
        if (!response.ok) continue;
        
        const data = await response.json();
        
        if (data.album) {
          const tracks: Track[] = [];
          
          if (data.album.tracks?.track) {
            const trackList = Array.isArray(data.album.tracks.track) 
              ? data.album.tracks.track 
              : [data.album.tracks.track];
              
            trackList.forEach((track: any) => {
              tracks.push({
                title: track.name,
                artist: artistName,
                duration: track.duration ? formatDuration(parseInt(track.duration) * 1000) : undefined,
                thumbnail: data.album.image?.[2]?.['#text'] || getDefaultThumbnail()
              });
            });
          }
          
          return {
            title: data.album.name,
            artist: artistName,
            cover: data.album.image?.[3]?.['#text'] || getDefaultThumbnail(),
            tracks,
            lastfm_url: data.album.url,
            mbid: data.album.mbid
          };
        }
      } catch (error) {
        continue;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting album info:', error);
    return null;
  }
};
