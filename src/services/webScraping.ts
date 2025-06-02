
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
    // Try multiple approaches for Spotify Charts
    const proxies = [
      'https://corsproxy.io/?',
      'https://api.codetabs.com/v1/proxy?quest=',
    ];
    
    const spotifyUrl = `https://spotifycharts.com/regional/${country.toLowerCase()}/daily/latest`;
    
    for (const proxy of proxies) {
      try {
        console.log(`Trying Spotify Charts proxy: ${proxy} for country: ${country}`);
        const response = await fetch(proxy + encodeURIComponent(spotifyUrl), {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (!response.ok) {
          console.log(`Spotify Charts proxy ${proxy} failed with status:`, response.status);
          continue;
        }
        
        const html = await response.text();
        console.log('Successfully fetched Spotify Charts HTML, length:', html.length);
        
        // Parse the HTML content
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const tracks = [];
        
        // Look for chart entries - try multiple selectors
        const selectors = [
          '.chart-table tbody tr',
          '.chart-list tr',
          'tbody tr',
          'tr'
        ];
        
        let trackRows = null;
        for (const selector of selectors) {
          trackRows = doc.querySelectorAll(selector);
          if (trackRows.length > 0) {
            console.log(`Found ${trackRows.length} Spotify chart rows with selector: ${selector}`);
            break;
          }
        }
        
        if (trackRows && trackRows.length > 0) {
          for (let i = 0; i < Math.min(trackRows.length, 5); i++) {
            const row = trackRows[i];
            const cells = row.querySelectorAll('td');
            
            if (cells.length >= 3) {
              const rank = i + 1;
              
              // Look for track name and artist in different cell positions
              let title = '';
              let artist = '';
              
              // Try different cell combinations
              for (let j = 0; j < cells.length; j++) {
                const cellText = cells[j]?.textContent?.trim() || '';
                
                // Look for patterns that might be song titles or artists
                if (!title && cellText.length > 2 && cellText.length < 100 && 
                    !cellText.match(/^\d+$/) && !cellText.includes('spotify:')) {
                  title = cellText;
                } else if (!artist && cellText.length > 2 && cellText.length < 100 && 
                          !cellText.match(/^\d+$/) && !cellText.includes('spotify:') && 
                          cellText !== title) {
                  artist = cellText;
                }
              }
              
              if (title && artist) {
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
          console.log('Successfully scraped Spotify Charts data:', tracks);
          return tracks;
        }
        
      } catch (proxyError) {
        console.log(`Spotify Charts proxy ${proxy} failed:`, proxyError);
        continue;
      }
    }
    
    throw new Error('All Spotify Charts proxies failed');
    
  } catch (error) {
    console.error('Error scraping Spotify Charts data:', error);
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
