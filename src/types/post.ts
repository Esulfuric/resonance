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
  likes_count?: number;
  comments_count?: number;
  is_removed?: boolean;
  removal_reason?: string;
  removed_at?: string;
  removed_by?: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string;
  };
}

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string;
  type: 'like' | 'comment' | 'follow' | 'message';
  post_id?: string;
  comment_id?: string;
  created_at: string;
  is_read: boolean;
  actor?: {
    id: string;
    full_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender?: {
    id: string;
    full_name?: string;
    username?: string;
    avatar_url?: string;
  };
  recipient?: {
    id: string;
    full_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

export interface Conversation {
  other_user: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string;
  };
  last_message: string;
  created_at: string;
  unread_count: number;
}

export interface FormattedPost {
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
  isLiked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onRefreshFeed?: () => void;
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
  isLiked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onRefreshFeed?: () => void;
}
