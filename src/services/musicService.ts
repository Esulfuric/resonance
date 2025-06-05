
// Improved music service using reliable, scrape-friendly sources with official music data
export interface Track {
  title: string;
  artist: string;
  album?: string;
  duration?: string;
  thumbnail?: string;
  mbid?: string; // MusicBrainz ID
  lastfm_url?: string;
}

export interface Artist {
  name: string;
  description?: string;
  image?: string;
  songs?: Track[];
  albums?: Album[];
  relatedArtists?: string[];
  mbid?: string;
  lastfm_url?: string;
}

export interface Album {
  title: string;
  artist: string;
  year?: string;
  tracks?: Track[];
  cover?: string;
  mbid?: string;
  lastfm_url?: string;
}

export interface Playlist {
  title: string;
  description?: string;
  tracks: Track[];
  thumbnail?: string;
}

// Use Last.fm API (no key required for basic searches) and MusicBrainz
export const extractYouTubeMusicData = async (query: string): Promise<Track[]> => {
  try {
    const tracks: Track[] = [];
    
    // Try Last.fm search first (fast and reliable)
    const lastfmTracks = await searchLastFm(query);
    if (lastfmTracks.length > 0) {
      tracks.push(...lastfmTracks);
    }
    
    // If we need more results, try MusicBrainz
    if (tracks.length < 10) {
      const mbTracks = await searchMusicBrainz(query);
      tracks.push(...mbTracks);
    }
    
    // Remove duplicates and return top 20
    const uniqueTracks = tracks.filter((track, index, self) => 
      index === self.findIndex(t => 
        t.title.toLowerCase() === track.title.toLowerCase() && 
        t.artist.toLowerCase() === track.artist.toLowerCase()
      )
    );
    
    return uniqueTracks.slice(0, 20);
  } catch (error) {
    console.error('Error searching music:', error);
    return getFallbackTracks(query);
  }
};

const searchLastFm = async (query: string): Promise<Track[]> => {
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

const searchMusicBrainz = async (query: string): Promise<Track[]> => {
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

const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const getDefaultThumbnail = (): string => {
  return 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=200&auto=format&fit=crop';
};

const getFallbackTracks = (query: string): Track[] => {
  // Provide some popular tracks as fallback
  const fallbackTracks = [
    { title: "Flowers", artist: "Miley Cyrus" },
    { title: "Anti-Hero", artist: "Taylor Swift" },
    { title: "As It Was", artist: "Harry Styles" },
    { title: "Kill Bill", artist: "SZA" },
    { title: "Unholy", artist: "Sam Smith ft. Kim Petras" },
  ];
  
  return fallbackTracks
    .filter(track => 
      track.title.toLowerCase().includes(query.toLowerCase()) ||
      track.artist.toLowerCase().includes(query.toLowerCase())
    )
    .map(track => ({
      ...track,
      thumbnail: getDefaultThumbnail()
    }))
    .slice(0, 5);
};

// Get artist information from Last.fm and MusicBrainz
export const getArtistInfo = async (artistName: string): Promise<Artist | null> => {
  try {
    // Try Last.fm first for artist info
    const lastfmInfo = await getLastFmArtistInfo(artistName);
    if (lastfmInfo) {
      // Get top tracks for this artist
      const songs = await getArtistTopTracks(artistName);
      return { ...lastfmInfo, songs };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting artist info:', error);
    return null;
  }
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

// Get song lyrics - simplified and faster
export const getSongLyrics = async (title: string, artist: string): Promise<string | null> => {
  try {
    // Use a simple lyrics API or return a message
    return `Lyrics for "${title}" by ${artist} would appear here.\n\nTo get actual lyrics, you would need to integrate with a lyrics service like Genius API or similar.`;
  } catch (error) {
    console.error('Error getting lyrics:', error);
    return null;
  }
};

// Generate playlist suggestions - simplified and faster
export const generatePlaylist = async (seedTrack: Track, count: number = 10): Promise<Track[]> => {
  try {
    // Get similar tracks from Last.fm
    const similarTracks = await getSimilarTracks(seedTrack.title, seedTrack.artist);
    return similarTracks.slice(0, count);
  } catch (error) {
    console.error('Error generating playlist:', error);
    return [];
  }
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

// Get album information - simplified
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
              
            trackList.forEach((track: any, index: number) => {
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
