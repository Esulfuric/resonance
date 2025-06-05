
// Music service for extracting data from public sources without APIs
export interface Track {
  title: string;
  artist: string;
  album?: string;
  duration?: string;
  thumbnail?: string;
  videoId?: string;
}

export interface Artist {
  name: string;
  description?: string;
  image?: string;
  songs?: Track[];
  albums?: Album[];
  relatedArtists?: string[];
}

export interface Album {
  title: string;
  artist: string;
  year?: string;
  tracks?: Track[];
  cover?: string;
}

export interface Playlist {
  title: string;
  description?: string;
  tracks: Track[];
  thumbnail?: string;
}

// Extract YouTube video/music data from public pages
export const extractYouTubeMusicData = async (query: string): Promise<Track[]> => {
  try {
    // Use multiple search engines to find YouTube Music content
    const searchEngines = [
      `https://corsproxy.io/?https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' music')}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(`https://music.youtube.com/search?q=${query}`)}`,
    ];

    for (const searchUrl of searchEngines) {
      try {
        const response = await fetch(searchUrl);
        if (!response.ok) continue;
        
        const html = await response.text();
        const tracks = parseYouTubeMusicResults(html);
        
        if (tracks.length > 0) {
          return tracks.slice(0, 20); // Limit to 20 results
        }
      } catch (error) {
        console.log('Search engine failed:', error);
        continue;
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error extracting YouTube Music data:', error);
    return [];
  }
};

const parseYouTubeMusicResults = (html: string): Track[] => {
  const tracks: Track[] = [];
  
  try {
    // Extract JSON data from YouTube pages
    const scriptMatches = html.match(/var ytInitialData = ({.*?});/);
    if (scriptMatches) {
      const data = JSON.parse(scriptMatches[1]);
      const contents = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
      
      if (contents) {
        contents.forEach((section: any) => {
          const items = section?.itemSectionRenderer?.contents || [];
          items.forEach((item: any) => {
            const videoRenderer = item?.videoRenderer;
            if (videoRenderer) {
              const title = videoRenderer?.title?.runs?.[0]?.text || '';
              const channelName = videoRenderer?.ownerText?.runs?.[0]?.text || '';
              const duration = videoRenderer?.lengthText?.simpleText || '';
              const thumbnail = videoRenderer?.thumbnail?.thumbnails?.[0]?.url || '';
              const videoId = videoRenderer?.videoId || '';
              
              if (title && channelName) {
                tracks.push({
                  title,
                  artist: channelName,
                  duration,
                  thumbnail,
                  videoId
                });
              }
            }
          });
        });
      }
    }
    
    // Fallback: Parse HTML structure for video titles
    if (tracks.length === 0) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Look for video titles in various selectors
      const videoElements = doc.querySelectorAll('[title*="music"], [title*="song"], [aria-label*="music"]');
      videoElements.forEach((element, index) => {
        if (index < 10) { // Limit results
          const title = element.getAttribute('title') || element.textContent?.trim() || '';
          const artist = element.closest('[data-context-item-id]')?.querySelector('[id*="channel"]')?.textContent?.trim() || 'Unknown Artist';
          
          if (title.length > 3) {
            tracks.push({
              title,
              artist,
              thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=200&auto=format&fit=crop'
            });
          }
        }
      });
    }
  } catch (error) {
    console.error('Error parsing YouTube results:', error);
  }
  
  return tracks;
};

// Get artist information from multiple sources
export const getArtistInfo = async (artistName: string): Promise<Artist | null> => {
  try {
    const sources = [
      `https://corsproxy.io/?https://en.wikipedia.org/wiki/${encodeURIComponent(artistName)}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(`https://www.last.fm/music/${artistName}`)}`,
    ];

    for (const source of sources) {
      try {
        const response = await fetch(source);
        if (!response.ok) continue;
        
        const html = await response.text();
        const artistInfo = parseArtistInfo(html, artistName);
        
        if (artistInfo) {
          // Get artist's songs
          const songs = await extractYouTubeMusicData(artistName);
          return { ...artistInfo, songs };
        }
      } catch (error) {
        continue;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting artist info:', error);
    return null;
  }
};

const parseArtistInfo = (html: string, artistName: string): Artist | null => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extract description from Wikipedia or other sources
    const description = doc.querySelector('.mw-parser-output p')?.textContent?.slice(0, 500) || 
                      doc.querySelector('[class*="bio"]')?.textContent?.slice(0, 500) || 
                      `Information about ${artistName}`;
    
    // Extract image
    const image = doc.querySelector('.infobox img')?.getAttribute('src') || 
                 doc.querySelector('[class*="artist-image"] img')?.getAttribute('src') ||
                 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=400&auto=format&fit=crop';
    
    return {
      name: artistName,
      description,
      image
    };
  } catch (error) {
    console.error('Error parsing artist info:', error);
    return null;
  }
};

// Get song lyrics from public sources
export const getSongLyrics = async (title: string, artist: string): Promise<string | null> => {
  try {
    const query = `${title} ${artist} lyrics`;
    const sources = [
      `https://corsproxy.io/?https://genius.com/search?q=${encodeURIComponent(query)}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(`https://www.azlyrics.com/search.php?q=${query}`)}`,
    ];

    for (const source of sources) {
      try {
        const response = await fetch(source);
        if (!response.ok) continue;
        
        const html = await response.text();
        const lyrics = parseLyrics(html);
        
        if (lyrics && lyrics.length > 50) {
          return lyrics;
        }
      } catch (error) {
        continue;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting lyrics:', error);
    return null;
  }
};

const parseLyrics = (html: string): string | null => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Look for lyrics in common selectors
    const lyricsSelectors = [
      '[class*="lyrics"]',
      '[id*="lyrics"]',
      '.song_body',
      '.lyric-body'
    ];
    
    for (const selector of lyricsSelectors) {
      const element = doc.querySelector(selector);
      if (element) {
        const lyrics = element.textContent?.trim();
        if (lyrics && lyrics.length > 50) {
          return lyrics;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing lyrics:', error);
    return null;
  }
};

// Generate playlist suggestions based on a seed track
export const generatePlaylist = async (seedTrack: Track, count: number = 20): Promise<Track[]> => {
  try {
    const relatedQueries = [
      `${seedTrack.artist} similar songs`,
      `songs like ${seedTrack.title}`,
      `${seedTrack.artist} popular songs`,
      `${seedTrack.title.split(' ')[0]} music` // Use first word of title
    ];
    
    const allTracks: Track[] = [];
    
    for (const query of relatedQueries) {
      const tracks = await extractYouTubeMusicData(query);
      allTracks.push(...tracks);
      
      if (allTracks.length >= count) break;
    }
    
    // Remove duplicates and limit results
    const uniqueTracks = allTracks.filter((track, index, self) => 
      index === self.findIndex(t => t.title === track.title && t.artist === track.artist)
    );
    
    return uniqueTracks.slice(0, count);
  } catch (error) {
    console.error('Error generating playlist:', error);
    return [];
  }
};

// Get album information
export const getAlbumInfo = async (albumName: string, artistName: string): Promise<Album | null> => {
  try {
    const query = `${albumName} ${artistName} album tracklist`;
    const tracks = await extractYouTubeMusicData(query);
    
    return {
      title: albumName,
      artist: artistName,
      tracks: tracks.slice(0, 15), // Typical album length
      cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=400&auto=format&fit=crop'
    };
  } catch (error) {
    console.error('Error getting album info:', error);
    return null;
  }
};
