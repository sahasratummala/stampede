
export interface UserPrompt {
  question: string;
  answer: string;
}

export interface User {
  id: string;
  name: string;
  pronouns?: string;
  email: string;
  major: string;
  bio: string;
  photo: string;
  topArtists: string[];
  interests: string[];
  attendingEvent: string;
  prompts?: UserPrompt[];
  concertMood?: 'Pit Warrior' | 'Merch Hunter' | 'Vibe Seeker' | 'Photo Pro' | 'First Timer';
}

