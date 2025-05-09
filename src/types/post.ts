
export interface Profile {
  full_name?: string;
  username?: string;
  avatar_url?: string;
  user_type?: 'musician' | 'listener';
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_edited?: boolean;
  song_title?: string;
  image_url?: string;
  profiles?: Profile;
}

export interface PostCardProps {
  id: string;
  user_id?: string;
  user: {
    name: string;
    username: string;
    avatar: string;
    user_type?: 'musician' | 'listener';
  };
  timestamp: string;
  content: string;
  isEdited?: boolean;
  imageUrl?: string;
  songInfo?: {
    title: string;
    artist: string;
    albumCover: string;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
  isOwner?: boolean;
  onDelete?: () => void;
}
