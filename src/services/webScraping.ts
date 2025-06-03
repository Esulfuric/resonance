
// Simple web scraping functions for publicly available chart data
export const scrapeKworbTop100 = async () => {
  try {
    // Try multiple CORS proxy services for better reliability
    const proxies = [
      'https://corsproxy.io/?',
      'https://api.codetabs.com/v1/proxy?quest=',
      'https://cors-anywhere.herokuapp.com/',
    ];
    
    const kworbUrl = 'https://kworb.net/pop/';
    
    for (const proxy of proxies) {
      try {
        console.log(`Trying kworb proxy: ${proxy}`);
        const response = await fetch(proxy + encodeURIComponent(kworbUrl), {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        if (!response.ok) {
          console.log(`Kworb proxy ${proxy} failed with status:`, response.status);
          continue;
        }
        
        const html = await response.text();
        console.log('Successfully fetched kworb HTML, length:', html.length);
        
        // Parse the HTML content to extract chart data
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const songs = [];
        
        // Look for the main table with chart data
        const table = doc.querySelector('table');
        if (table) {
          const rows = table.querySelectorAll('tr');
          console.log(`Found ${rows.length} table rows on kworb`);
          
          for (let i = 1; i < Math.min(rows.length, 11); i++) { // Skip header row, get top 10
            const row = rows[i];
            const cells = row.querySelectorAll('td');
            
            if (cells.length >= 3) {
              const rank = i;
              const artistTitle = cells[1]?.textContent?.trim() || '';
              
              // Parse "Artist - Title" format
              let artist = '';
              let title = '';
              
              if (artistTitle.includes(' - ')) {
                const parts = artistTitle.split(' - ');
                artist = parts[0].trim();
                title = parts.slice(1).join(' - ').trim();
              } else {
                // Fallback if format is different
                artist = 'Various Artists';
                title = artistTitle;
              }
              
              const weeksStr = cells[2]?.textContent?.trim() || '1';
              const weeks = parseInt(weeksStr) || 1;
              
              if (title && artist) {
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
          console.log('Successfully scraped kworb data:', songs);
          return songs;
        }
        
      } catch (proxyError) {
        console.log(`Kworb proxy ${proxy} failed:`, proxyError);
        continue;
      }
    }
    
    throw new Error('All kworb proxies failed');
    
  } catch (error) {
    console.error('Error scraping kworb data:', error);
    return null;
  }
};

export const scrapeSpotifyChartsOfficial = async (country: string = 'US') => {
  try {
    // Try multiple approaches for Kworb Spotify country charts
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
        console.log('Successfully fetched Kworb Spotify Charts HTML, length:', html.length);
        
        // Parse the HTML content
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const tracks = [];
        
        // Look for the main table with chart data
        const tables = doc.querySelectorAll('table');
        let chartTable = null;
        
        // Find the correct table (usually the first or largest table)
        for (const table of tables) {
          const rows = table.querySelectorAll('tr');
          if (rows.length > 5) { // Chart tables have multiple rows
            chartTable = table;
            break;
          }
        }
        
        if (chartTable) {
          const rows = chartTable.querySelectorAll('tr');
          console.log(`Found ${rows.length} table rows on Kworb Spotify`);
          
          // Process data rows (skip header)
          for (let i = 1; i < Math.min(rows.length, 6); i++) { // Get top 5
            const row = rows[i];
            const cells = row.querySelectorAll('td');
            
            if (cells.length >= 2) {
              // Look for the cell that contains the artist and song info
              // This is typically in the first or second column
              let artistAndSong = '';
              
              // Check first few cells for the one containing artist/song data
              for (let j = 0; j < Math.min(cells.length, 3); j++) {
                const cellText = (cells[j] as Element)?.textContent?.trim() || '';
                
                // Look for cells that contain " - " which indicates "Artist - Song" format
                if (cellText.includes(' - ') && cellText.length > 10) {
                  artistAndSong = cellText;
                  break;
                }
              }
              
              if (artistAndSong) {
                console.log(`Row ${i} found artist-song data:`, artistAndSong);
                
                // Split into artist and title
                const parts = artistAndSong.split(' - ');
                if (parts.length >= 2) {
                  const artist = parts[0].trim();
                  const title = parts.slice(1).join(' - ').trim();
                  
                  // Clean up any remaining chart indicators or numbers in parentheses
                  const cleanArtist = artist.replace(/\([^)]*\)/g, '').trim();
                  const cleanTitle = title.replace(/\([^)]*\)/g, '').trim();
                  
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
        }
        
        if (tracks.length > 0) {
          console.log('Successfully scraped Kworb Spotify Charts data:', tracks);
          return tracks;
        } else {
          console.log('No valid tracks found, debugging page structure...');
          // Enhanced debugging - show raw cell content
          if (chartTable) {
            const debugRows = chartTable.querySelectorAll('tr');
            for (let i = 1; i < Math.min(debugRows.length, 4); i++) {
              const cells = debugRows[i]?.querySelectorAll('td');
              if (cells) {
                const cellData = Array.from(cells).map((cell, index) => `[${index}]: "${(cell as Element).textContent?.trim()}"`);
                console.log(`Debug Row ${i}:`, cellData);
              }
            }
          }
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

export const getUserLocation = async () => {
  try {
    // Try multiple location services
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
            // For simpler IP services, default to US
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
