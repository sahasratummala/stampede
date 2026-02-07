
export interface User {
  id: string;
  name: string;
  email: string;
  major: string;
  bio: string;
  photo: string;
  topArtists: string[];
}

export interface ConcertEvent {
  id: string;
  title: string;
  artist: string;
  date: string;
  image: string;
  description: string;
  category: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface OutfitSuggestion {
  vibe: string;
  description: string;
  items: string[];
  tips: string;
}
