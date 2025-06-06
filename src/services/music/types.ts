
export interface Track {
  title: string;
  artist: string;
  album?: string;
  duration?: string;
  thumbnail?: string;
  mbid?: string;
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
