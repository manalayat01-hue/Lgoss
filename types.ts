
export type ContentType = 'movie' | 'series';

export interface Episode {
  id: string;
  title: string;
  duration: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  seasonNumber: number;
  episodeNumber: number;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  rating: number;
  date: string;
}

export interface Content {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  backdrop: string;
  type: ContentType;
  genres: string[];
  rating: number;
  year: number;
  episodes?: Episode[];
  trailerUrl: string;
  comments: Comment[];
  isNew?: boolean;
  isPopular?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  profilePic: string;
  watchlist: string[];
  history: string[];
  role: 'user' | 'admin';
}
