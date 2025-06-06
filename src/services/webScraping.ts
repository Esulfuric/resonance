// Enhanced web scraping with better data accuracy and auto-updating
export const scrapeKworbTop100 = async () => {
  try {
    const proxies = [
      'https://corsproxy.io/?',
      'https://api.codetabs.com/v1/proxy?quest=',
    ];
    
    const kworbUrl = 'https://kworb.net/ww/';
    
    for (const proxy of proxies) {
      try {
        console.log(`Fetching latest worldwide chart data from: ${proxy}`);
        const response = await fetch(proxy + encodeURIComponent(kworbUrl), {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          console.log(`Proxy ${proxy} failed with status:`, response.status);
          continue;
        }
        
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const songs = [];
        const table = doc.querySelector('table.sortable') || doc.querySelector('table');
        
        if (table) {
          const rows = table.querySelectorAll('tr');
          console.log(`Processing ${rows.length} chart entries`);
          
          for (let i = 1; i < Math.min(rows.length, 11); i++) {
            const row = rows[i];
            const cells = row.querySelectorAll('td');
            
            if (cells.length >= 3) {
              const rank = i;
              let artist = '';
              let title = '';
              
              // Enhanced parsing for better accuracy
              for (let cellIndex = 0; cellIndex < Math.min(cells.length, 5); cellIndex++) {
                const cellText = cells[cellIndex]?.textContent?.trim() || '';
                
                if (/^\d+$/.test(cellText)) continue;
                
                if (cellText.includes(' - ') && cellText.length > 5) {
                  const parts = cellText.split(' - ');
                  if (parts.length >= 2) {
                    artist = parts[0].trim();
                    title = parts.slice(1).join(' - ').trim();
                    break;
                  }
                }
                
                if (!artist && cellText.length > 2 && !cellText.includes(',')) {
                  artist = cellText;
                } else if (!title && cellText.length > 2 && artist) {
                  title = cellText;
                }
              }
              
              if (artist && title) {
                artist = artist.replace(/[#\d+\-\s]*$/, '').trim();
                title = title.replace(/[#\d+\-\s]*$/, '').trim();
                
                const weeksCell = cells[cells.length - 1]?.textContent?.trim() || '1';
                const weeks = parseInt(weeksCell.replace(/\D/g, '')) || 1;
                
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
          console.log('Successfully scraped current worldwide chart:', songs);
          return songs;
        }
        
      } catch (proxyError) {
        console.log(`Proxy ${proxy} failed:`, proxyError);
        continue;
      }
    }
    
    throw new Error('All proxies failed for worldwide chart');
    
  } catch (error) {
    console.error('Error scraping worldwide chart:', error);
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
        console.log(`Fetching current ${country} chart data from: ${proxy}`);
        const response = await fetch(proxy + encodeURIComponent(kworbSpotifyUrl), {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          console.log(`${country} chart proxy ${proxy} failed with status:`, response.status);
          continue;
        }
        
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const tracks = [];
        const table = doc.querySelector('table.sortable') || doc.querySelector('table');
        
        if (table) {
          const rows = table.querySelectorAll('tr');
          console.log(`Processing ${rows.length} ${country} chart entries`);
          
          for (let i = 1; i < Math.min(rows.length, 6); i++) {
            const row = rows[i];
            const cells = row.querySelectorAll('td');
            
            if (cells.length >= 2) {
              let artist = '';
              let title = '';
              
              for (let j = 0; j < Math.min(cells.length, 5); j++) {
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
          console.log(`Successfully scraped current ${country} chart:`, tracks);
          return tracks;
        }
        
      } catch (proxyError) {
        console.log(`${country} chart proxy ${proxy} failed:`, proxyError);
        continue;
      }
    }
    
    throw new Error(`All proxies failed for ${country} chart`);
    
  } catch (error) {
    console.error(`Error scraping ${country} chart:`, error);
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
        const response = await fetch(service, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
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
