// Improved web scraping functions for music chart data
export const scrapeKworbTop100 = async () => {
  try {
    const proxies = [
      'https://corsproxy.io/?',
      'https://api.codetabs.com/v1/proxy?quest=',
    ];
    
    const kworbUrl = 'https://kworb.net/ww/';
    
    for (const proxy of proxies) {
      try {
        console.log(`Trying kworb worldwide proxy: ${proxy}`);
        const response = await fetch(proxy + encodeURIComponent(kworbUrl), {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (!response.ok) {
          console.log(`Kworb worldwide proxy ${proxy} failed with status:`, response.status);
          continue;
        }
        
        const html = await response.text();
        console.log('Successfully fetched kworb worldwide HTML, length:', html.length);
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const songs = [];
        
        // Look for the main table with chart data - updated selector
        const table = doc.querySelector('table.sortable') || doc.querySelector('table');
        if (table) {
          const rows = table.querySelectorAll('tr');
          console.log(`Found ${rows.length} table rows on kworb worldwide`);
          
          for (let i = 1; i < Math.min(rows.length, 11); i++) {
            const row = rows[i];
            const cells = row.querySelectorAll('td');
            
            if (cells.length >= 2) {
              const rank = i;
              
              // Look for artist and title in different cell structures
              let artist = '';
              let title = '';
              
              // Try different cell indices for artist/title data
              for (let cellIndex = 0; cellIndex < Math.min(cells.length, 4); cellIndex++) {
                const cellText = cells[cellIndex]?.textContent?.trim() || '';
                
                // Skip numeric cells (likely chart positions)
                if (/^\d+$/.test(cellText)) continue;
                
                // Look for cells with " - " separator indicating "Artist - Title"
                if (cellText.includes(' - ') && cellText.length > 5) {
                  const parts = cellText.split(' - ');
                  artist = parts[0].trim();
                  title = parts.slice(1).join(' - ').trim();
                  break;
                }
                
                // Look for cells with just artist or title
                if (cellText.length > 2 && !artist) {
                  artist = cellText;
                } else if (cellText.length > 2 && !title && artist) {
                  title = cellText;
                }
              }
              
              // Clean up extracted data
              if (artist && title) {
                // Remove any chart indicators or extra symbols
                artist = artist.replace(/[#\d+\-\s]*$/, '').trim();
                title = title.replace(/[#\d+\-\s]*$/, '').trim();
                
                const weeksStr = cells[cells.length - 1]?.textContent?.trim() || '1';
                const weeks = parseInt(weeksStr.replace(/\D/g, '')) || 1;
                
                songs.push({
                  rank,
                  title,
                  artist,
                  peak_position: rank,
                  weeks_on_chart: weeks
                });
              }
            }
          }
        }
        
        if (songs.length > 0) {
          console.log('Successfully scraped kworb worldwide data:', songs);
          return songs;
        }
        
      } catch (proxyError) {
        console.log(`Kworb worldwide proxy ${proxy} failed:`, proxyError);
        continue;
      }
    }
    
    throw new Error('All kworb worldwide proxies failed');
    
  } catch (error) {
    console.error('Error scraping kworb worldwide data:', error);
    return null;
  }
};

export const scrapeSpotifyChartsOfficial = async (country: string = 'US') => {
  try {
    const proxies = [
      'https://corsproxy.io/?',
      'https://api.codetabs.com/v1/proxy?quest=',
    ];
    
    const kworbSpotifyUrl = `https://kworb.net/spotify/country/${country.toLowerCase()}_daily.html`;
    
    for (const proxy of proxies) {
      try {
        console.log(`Trying Kworb Spotify Charts proxy: ${proxy} for country: ${country}`);
        const response = await fetch(proxy + encodeURIComponent(kworbSpotifyUrl), {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (!response.ok) {
          console.log(`Kworb Spotify Charts proxy ${proxy} failed with status:`, response.status);
          continue;
        }
        
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const tracks = [];
        
        // Look for the main table with chart data
        const table = doc.querySelector('table.sortable') || doc.querySelector('table');
        
        if (table) {
          const rows = table.querySelectorAll('tr');
          console.log(`Found ${rows.length} table rows on Kworb Spotify`);
          
          for (let i = 1; i < Math.min(rows.length, 6); i++) {
            const row = rows[i];
            const cells = row.querySelectorAll('td');
            
            if (cells.length >= 2) {
              let artist = '';
              let title = '';
              
              // Search through cells for artist - title pattern
              for (let j = 0; j < Math.min(cells.length, 4); j++) {
                const cellText = (cells[j] as Element)?.textContent?.trim() || '';
                
                if (cellText.includes(' - ') && cellText.length > 10) {
                  const parts = cellText.split(' - ');
                  if (parts.length >= 2) {
                    artist = parts[0].trim();
                    title = parts.slice(1).join(' - ').trim();
                    break;
                  }
                }
              }
              
              if (artist && title) {
                // Clean up any remaining indicators
                const cleanArtist = artist.replace(/\([^)]*\)|\[[^\]]*\]/g, '').trim();
                const cleanTitle = title.replace(/\([^)]*\)|\[[^\]]*\]/g, '').trim();
                
                if (cleanArtist && cleanTitle) {
                  tracks.push({
                    rank: i,
                    title: cleanTitle,
                    artist: cleanArtist
                  });
                }
              }
            }
          }
        }
        
        if (tracks.length > 0) {
          console.log('Successfully scraped Kworb Spotify Charts data:', tracks);
          return tracks;
        }
        
      } catch (proxyError) {
        console.log(`Kworb Spotify Charts proxy ${proxy} failed:`, proxyError);
        continue;
      }
    }
    
    throw new Error('All Kworb Spotify Charts proxies failed');
    
  } catch (error) {
    console.error('Error scraping Kworb Spotify Charts data:', error);
    return null;
  }
};

// ... keep existing code (getUserLocation function)
export const getUserLocation = async () => {
  try {
    const services = [
      'https://ipapi.co/json/',
      'https://api.ipify.org?format=json',
      'https://httpbin.org/ip'
    ];
    
    for (const service of services) {
      try {
        const response = await fetch(service);
        if (response.ok) {
          const data = await response.json();
          
          if (service.includes('ipapi.co')) {
            return {
              country: data.country_name || 'United States',
              countryCode: data.country_code || 'US',
              city: data.city
            };
          } else {
            return {
              country: 'United States',
              countryCode: 'US',
              city: null
            };
          }
        }
      } catch (serviceError) {
        console.log(`Location service ${service} failed:`, serviceError);
        continue;
      }
    }
    
    throw new Error('All location services failed');
    
  } catch (error) {
    console.error('Error fetching location:', error);
    return {
      country: 'United States',
      countryCode: 'US',
      city: null
    };
  }
};
