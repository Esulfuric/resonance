
import { Track } from './types';

const getDefaultThumbnail = (): string => {
  return 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=200&auto=format&fit=crop';
};

const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const searchLastFm = async (query: string): Promise<Track[]> => {
  try {
    const apiUrl = `https://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(query)}&api_key=0123456789abcdef&format=json&limit=10`;
    
    const proxies = [
      'https://corsproxy.io/?',
      'https://api.codetabs.com/v1/proxy?quest=',
    ];
    
    for (const proxy of proxies) {
      try {
        const response = await fetch(proxy + encodeURIComponent(apiUrl), {
          headers: {
            'User-Agent': 'MusicApp/1.0'
          }
        });
        
        if (!response.ok) continue;
        
        const data = await response.json();
        const tracks: Track[] = [];
        
        if (data.results?.trackmatches?.track) {
          const trackList = Array.isArray(data.results.trackmatches.track) 
            ? data.results.trackmatches.track 
            : [data.results.trackmatches.track];
            
          trackList.forEach((track: any) => {
            if (track.name && track.artist) {
              tracks.push({
                title: track.name,
                artist: track.artist,
                thumbnail: track.image?.[2]?.['#text'] || getDefaultThumbnail(),
                lastfm_url: track.url,
                mbid: track.mbid
              });
            }
          });
        }
        
        return tracks;
      } catch (error) {
        continue;
      }
    }
    
    return [];
  } catch (error) {
    console.error('Last.fm search failed:', error);
    return [];
  }
};

export const searchMusicBrainz = async (query: string): Promise<Track[]> => {
  try {
    const apiUrl = `https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(query)}&fmt=json&limit=10`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'MusicApp/1.0 (contact@example.com)'
      }
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    const tracks: Track[] = [];
    
    if (data.recordings) {
      data.recordings.forEach((recording: any) => {
        if (recording.title && recording['artist-credit']) {
          const artist = recording['artist-credit'][0]?.name || 'Unknown Artist';
          tracks.push({
            title: recording.title,
            artist: artist,
            duration: recording.length ? formatDuration(recording.length) : undefined,
            thumbnail: getDefaultThumbnail(),
            mbid: recording.id
          });
        }
      });
    }
    
    return tracks;
  } catch (error) {
    console.error('MusicBrainz search failed:', error);
    return [];
  }
};

export const extractYouTubeMusicData = async (query: string): Promise<Track[]> => {
  try {
    const tracks: Track[] = [];
    
    const lastfmTracks = await searchLastFm(query);
    if (lastfmTracks.length > 0) {
      tracks.push(...lastfmTracks);
    }
    
    if (tracks.length < 10) {
      const mbTracks = await searchMusicBrainz(query);
      tracks.push(...mbTracks);
    }
    
    const uniqueTracks = tracks.filter((track, index, self) => 
      index === self.findIndex(t => 
        t.title.toLowerCase() === track.title.toLowerCase() && 
        t.artist.toLowerCase() === track.artist.toLowerCase()
      )
    );
    
    return uniqueTracks.slice(0, 20);
  } catch (error) {
    console.error('Error searching music:', error);
    return [];
  }
};
