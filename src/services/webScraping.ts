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
        
        // Look for the main table with chart data - Kworb uses specific table structure
        const tables = doc.querySelectorAll('table');
        let chartTable = null;
        
        // Find the correct table (usually the one with the most rows containing chart data)
        for (const table of tables) {
          const rows = table.querySelectorAll('tr');
          if (rows.length > 10) { // Chart tables typically have many rows
            chartTable = table;
            break;
          }
        }
        
        if (chartTable) {
          const rows = chartTable.querySelectorAll('tr');
          console.log(`Found ${rows.length} table rows on Kworb Spotify`);
          
          // Skip header rows and process data rows
          for (let i = 1; i < Math.min(rows.length, 6); i++) { // Skip header row, get top 5
            const row = rows[i];
            const cells = row.querySelectorAll('td');
            
            if (cells.length >= 4) { // Kworb typically has: rank, +/-, artist, song, streams
              const rank = i;
              
              // Try different cell positions for artist and title
              // Kworb format: [rank] [+/-] [artist] [song] [streams]
              let artist = '';
              let title = '';
              
              // Check if we have artist in cell 2 and title in cell 3
              if (cells[2] && cells[3]) {
                artist = cells[2]?.textContent?.trim() || '';
                title = cells[3]?.textContent?.trim() || '';
              }
              
              // If that doesn't work, try combined format in cell 2 or 3
              if (!artist || !title || artist === '=' || title === '=' || artist.includes('+') || title.includes('+')) {
                for (let cellIndex = 1; cellIndex < Math.min(cells.length, 5); cellIndex++) {
                  const cellText = cells[cellIndex]?.textContent?.trim() || '';
                  
                  // Skip cells that contain chart position indicators
                  if (cellText && !cellText.match(/^[+\-=]\d*$/) && !cellText.match(/^\d+$/) && cellText.length > 2) {
                    // Check if this cell contains "Artist - Title" format
                    if (cellText.includes(' - ')) {
                      const parts = cellText.split(' - ');
                      artist = parts[0].trim();
                      title = parts.slice(1).join(' - ').trim();
                      break;
                    } else if (!artist && cellText.length > 0) {
                      artist = cellText;
                    } else if (!title && cellText.length > 0) {
                      title = cellText;
                      break;
                    }
                  }
                }
              }
              
              // Clean up the data
              artist = artist.replace(/[+\-=]\d*/, '').trim();
              title = title.replace(/[+\-=]\d*/, '').trim();
              
              // Only add if we have valid artist and title
              if (title && artist && title.length > 1 && artist.length > 1 && 
                  !title.match(/^[+\-=]\d*$/) && !artist.match(/^[+\-=]\d*$/)) {
                tracks.push({
                  rank,
                  title,
                  artist
                });
              }
            }
          }
        }
        
        if (tracks.length > 0) {
          console.log('Successfully scraped Kworb Spotify Charts data:', tracks);
          return tracks;
        } else {
          console.log('No valid tracks found, checking page structure...');
          // Log some sample cell content for debugging
          const sampleRows = doc.querySelectorAll('table tr');
          for (let i = 1; i < Math.min(sampleRows.length, 4); i++) {
            const cells = sampleRows[i]?.querySelectorAll('td');
            if (cells) {
              console.log(`Row ${i} cells:`, Array.from(cells).map(cell => cell.textContent?.trim()).slice(0, 5));
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
