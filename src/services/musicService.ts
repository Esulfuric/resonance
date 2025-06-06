
// Re-export all types and functions from the refactored modules
export type { Track, Artist, Album, Playlist } from './music/types';
export { extractYouTubeMusicData } from './music/trackSearchService';
export { getArtistInfo } from './music/artistService';
export { getAlbumInfo } from './music/albumService';
export { generatePlaylist, getSongLyrics } from './music/playlistService';
