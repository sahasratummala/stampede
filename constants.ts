
import { User } from "./types";

export const UT_THEME = {
  burntOrange: '#BF5700',
  charcoal: '#333f48',
  white: '#FFFFFF',
  limestone: '#D6D2C4'
};

export const CATEGORIES = ['Concerts', 'Basketball', 'Comedy', 'Community'];

export const CONCERT_MOODS = ['Pit Warrior', 'Merch Hunter', 'Vibe Seeker', 'Photo Pro', 'First Timer'] as const;

export const AVAILABLE_PROMPTS = [
  "My go-to Moody Center snack is...",
  "In the pit, you'll find me...",
  "Best show I've ever seen was...",
  "My concert survival tip is...",
  "The artist I'd travel anywhere for is...",
  "My post-concert ritual is hitting up..."
];

export const MOCK_BUDDIES: User[] = [
  {
    id: '1',
    name: 'Sarah J.',
    pronouns: 'she/her',
    email: 'sarah.j@utexas.edu',
    major: 'Architecture',
    bio: 'Big Taylor Swift fan! Looking for someone to trade friendship bracelets with at the Eras tour.',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&h=600&auto=format&fit=crop',
    topArtists: ['Taylor Swift', 'Gracie Abrams', 'The 1975'],
    interests: ['Photography', 'Travel', 'Espresso'],
    attendingEvent: 'The Eras Tour @ Moody',
    concertMood: 'Photo Pro',
    prompts: [{ question: "My go-to Moody Center snack is...", answer: "Definitely the loaded nachos!" }]
  },
  {
    id: '2',
    name: 'Marcus T.',
    pronouns: 'he/him',
    email: 'm.t@utexas.edu',
    major: 'Computer Science',
    bio: 'Coding by day, mosh pits by night. Huge Travis Scott fan. Let\'s go crazy!',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&h=600&auto=format&fit=crop',
    topArtists: ['Travis Scott', 'Playboi Carti', 'Metro Boomin'],
    interests: ['Gaming', 'Sneakers', 'Gym'],
    attendingEvent: 'Travis Scott: Utopia',
    concertMood: 'Pit Warrior',
    prompts: [{ question: "In the pit, you'll find me...", answer: "Right in the middle of the circle!" }]
  },
  {
    id: '3',
    name: 'Elena V.',
    pronouns: 'she/they',
    email: 'ev@utexas.edu',
    major: 'Music Business',
    bio: 'I go to Moody Center at least once a month. Looking for a group to vibe with in the pit.',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&h=600&auto=format&fit=crop',
    topArtists: ['Lana Del Rey', 'SZA', 'Arctic Monkeys'],
    interests: ['Vinyl', 'Astrology', 'Fashion'],
    attendingEvent: 'SZA: SOS Tour',
    concertMood: 'Vibe Seeker',
    prompts: [{ question: "Best show I've ever seen was...", answer: "Lana at Lollapalooza was spiritual." }]
  },
  {
    id: '4',
    name: 'David K.',
    pronouns: 'he/him',
    email: 'dk@utexas.edu',
    major: 'Economics',
    bio: 'Looking for a crew to hit the floor with for Kendrick. Big on hip-hop history.',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&h=600&auto=format&fit=crop',
    topArtists: ['Kendrick Lamar', 'J. Cole', 'Drake'],
    interests: ['Basketball', 'Podcasts', 'Hiking'],
    attendingEvent: 'Kendrick Lamar Live',
    concertMood: 'First Timer'
  },
  {
    id: '5',
    name: 'Chloe M.',
    pronouns: 'she/her',
    email: 'cm@utexas.edu',
    major: 'Biology',
    bio: 'Pre-med life is stressful. Music is my therapy. Seeing Billie Eilish soon!',
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&h=600&auto=format&fit=crop',
    topArtists: ['Billie Eilish', 'Olivia Rodrigo', 'Conan Gray'],
    interests: ['Art', 'Nature', 'Cooking'],
    attendingEvent: 'Billie Eilish @ Moody',
    concertMood: 'Merch Hunter',
    prompts: [{ question: "My concert survival tip is...", answer: "Hydrate and wear comfy shoes!" }]
  }
];
