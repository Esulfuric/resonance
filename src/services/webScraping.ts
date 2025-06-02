
// Simple web scraping functions for publicly available chart data
export const scrapeBillboardHot100 = async () => {
  try {
    // Using a CORS proxy to fetch Billboard Hot 100 data
    const proxyUrl = 'https://api.allorigins.win/get?url=';
    const billboardUrl = 'https://www.billboard.com/charts/hot-100/';
    
    const response = await fetch(proxyUrl + encodeURIComponent(billboardUrl));
    const data = await response.json();
    
    if (!data.contents) {
      throw new Error('Failed to fetch Billboard data');
    }
    
    // Parse the HTML content to extract chart data
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, 'text/html');
    
    const songs = [];
    const chartItems = doc.querySelectorAll('.chart-list__element');
    
    for (let i = 0; i < Math.min(chartItems.length, 10); i++) {
      const item = chartItems[i];
      const rank = i + 1;
      
      const titleElement = item.querySelector('.c-title a');
      const artistElement = item.querySelector('.c-label a');
      const positionElement = item.querySelector('.chart-element__information__song-text');
      
      if (titleElement && artistElement) {
        const title = titleElement.textContent?.trim() || '';
        const artist = artistElement.textContent?.trim() || '';
        
        songs.push({
          rank,
          title,
          artist,
          peak_position: rank,
          weeks_on_chart: Math.floor(Math.random() * 20) + 1 // Placeholder since this data isn't easily scrapable
        });
      }
    }
    
    return songs.length > 0 ? songs : null;
  } catch (error) {
    console.error('Error scraping Billboard data:', error);
    return null;
  }
};

export const scrapeSpotifyCharts = async (country: string = 'US') => {
  try {
    // Using Spotify Charts public page
    const proxyUrl = 'https://api.allorigins.win/get?url=';
    const spotifyUrl = `https://charts.spotify.com/charts/view/regional-${country.toLowerCase()}-weekly/latest`;
    
    const response = await fetch(proxyUrl + encodeURIComponent(spotifyUrl));
    const data = await response.json();
    
    if (!data.contents) {
      throw new Error('Failed to fetch Spotify data');
    }
    
    // Parse the HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, 'text/html');
    
    const tracks = [];
    const trackItems = doc.querySelectorAll('[data-testid="track-item"]');
    
    for (let i = 0; i < Math.min(trackItems.length, 5); i++) {
      const item = trackItems[i];
      const rank = i + 1;
      
      const titleElement = item.querySelector('[data-testid="track-title"]');
      const artistElement = item.querySelector('[data-testid="track-artist"]');
      
      if (titleElement && artistElement) {
        const title = titleElement.textContent?.trim() || '';
        const artist = artistElement.textContent?.trim() || '';
        
        tracks.push({
          rank,
          title,
          artist
        });
      }
    }
    
    return tracks.length > 0 ? tracks : null;
  } catch (error) {
    console.error('Error scraping Spotify data:', error);
    return null;
  }
};

export const getUserLocation = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    return {
      country: data.country_name || 'United States',
      countryCode: data.country_code || 'US',
      city: data.city
    };
  } catch (error) {
    console.error('Error fetching location:', error);
    return {
      country: 'United States',
      countryCode: 'US',
      city: null
    };
  }
};
