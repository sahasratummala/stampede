
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';

interface UserContextType {
  profile: User;
  updateProfile: (newProfile: User) => void;
}

const DEFAULT_PHOTO = 'https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_Ldo0GwNM2qcVhod5liS6NoBSSpmP9K24.jpg';

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<User>({
    id: 'me',
    name: 'Bevo Longhorn',
    email: 'bevo@utexas.edu',
    major: 'Business',
    bio: 'Looking for a crew to enjoy the show with! Hook \'em!',
    photo: DEFAULT_PHOTO,
    topArtists: ['Post Malone', 'Quinn XCII'],
    interests: ['Tailgating', 'Live Music', 'Photography'],
    attendingEvent: 'Post Malone @ Moody'
  });

  const updateProfile = (newProfile: User) => {
    setProfile(newProfile);
  };

  return (
    <UserContext.Provider value={{ profile, updateProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
