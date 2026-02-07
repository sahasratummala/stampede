
import { User } from "./types";

export const UT_THEME = {
  burntOrange: '#BF5700',
  charcoal: '#333f48',
  white: '#FFFFFF',
  limestone: '#D6D2C4'
};

export const CATEGORIES = ['Concerts', 'Basketball', 'Comedy', 'Community'];

export const MOCK_BUDDIES: User[] = [
  {
    id: '1',
    name: 'Sarah J.',
    email: 'sarah.j@utexas.edu',
    major: 'Architecture',
    bio: 'Big Taylor Swift fan! Looking for someone to trade friendship bracelets with at the Eras tour.',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&h=600&auto=format&fit=crop',
    topArtists: ['Taylor Swift', 'Gracie Abrams', 'The 1975'],
    interests: ['Photography', 'Travel', 'Espresso'],
    attendingEvent: 'The Eras Tour @ Moody'
  },
  {
    id: '2',
    name: 'Marcus T.',
    email: 'm.t@utexas.edu',
    major: 'Computer Science',
    bio: 'Coding by day, mosh pits by night. Huge Travis Scott fan. Let\'s go crazy!',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&h=600&auto=format&fit=crop',
    topArtists: ['Travis Scott', 'Playboi Carti', 'Metro Boomin'],
    interests: ['Gaming', 'Sneakers', 'Gym'],
    attendingEvent: 'Travis Scott: Utopia'
  },
  {
    id: '3',
    name: 'Elena V.',
    email: 'ev@utexas.edu',
    major: 'Music Business',
    bio: 'I go to Moody Center at least once a month. Looking for a group to vibe with in the pit.',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&h=600&auto=format&fit=crop',
    topArtists: ['Lana Del Rey', 'SZA', 'Arctic Monkeys'],
    interests: ['Vinyl', 'Astrology', 'Fashion'],
    attendingEvent: 'SZA: SOS Tour'
  },
  {
    id: '4',
    name: 'David K.',
    email: 'dk@utexas.edu',
    major: 'Economics',
    bio: 'Looking for a crew to hit the floor with for Kendrick. Big on hip-hop history.',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&h=600&auto=format&fit=crop',
    topArtists: ['Kendrick Lamar', 'J. Cole', 'Drake'],
    interests: ['Basketball', 'Podcasts', 'Hiking'],
    attendingEvent: 'Kendrick Lamar Live'
  },
  {
    id: '5',
    name: 'Chloe M.',
    email: 'cm@utexas.edu',
    major: 'Biology',
    bio: 'Pre-med life is stressful. Music is my therapy. Seeing Billie Eilish soon!',
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&h=600&auto=format&fit=crop',
    topArtists: ['Billie Eilish', 'Olivia Rodrigo', 'Conan Gray'],
    interests: ['Art', 'Nature', 'Cooking'],
    attendingEvent: 'Billie Eilish @ Moody'
  }
];
