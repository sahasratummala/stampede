
import React, { useState } from 'react';
import { MOCK_BUDDIES } from '../constants';

const BuddyFinder: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swiped, setSwiped] = useState<string | null>(null);
  const [matches, setMatches] = useState<typeof MOCK_BUDDIES>([]);

  const handleSwipe = (direction: 'left' | 'right') => {
    setSwiped(direction);
    
    // Simulating match logic
    if (direction === 'right') {
      // 50% chance of immediate match for demo purposes
      if (Math.random() > 0.5) {
        setMatches(prev => [...prev, MOCK_BUDDIES[currentIndex]]);
      }
    }

    setTimeout(() => {
      setSwiped(null);
      setCurrentIndex(prev => (prev + 1) % MOCK_BUDDIES.length);
    }, 0.5);
  };

  const currentUser = MOCK_BUDDIES[currentIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Left Side: Swipe UI */}
        <div className="flex-grow flex flex-col items-center">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bebas text-burnt-orange mb-2 tracking-wider">Concert Buddy</h2>
            <p className="text-gray-600">Find Longhorns heading to the same show as you!</p>
          </div>

          <div className="relative w-full max-w-sm h-[600px]">
            {/* Card Stack */}
            <div className={`
              absolute inset-0 bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-500
              ${swiped === 'left' ? 'animate-swipe-left' : swiped === 'right' ? 'animate-swipe-right' : ''}
            `}>
              <div className="h-2/3 relative">
                <img src={currentUser.photo} alt={currentUser.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-3xl font-bold">{currentUser.name}</h3>
                  <p className="text-lg opacity-90">{currentUser.major} @ UT Austin</p>
                </div>
                
                {/* Swipe Overlays */}
                {swiped === 'right' && (
                  <div className="absolute top-10 left-10 border-4 border-green-500 rounded-xl p-4 rotate-[-20deg] opacity-100 z-50">
                    <span className="text-green-500 text-4xl font-black uppercase">HOOK 'EM</span>
                  </div>
                )}
                {swiped === 'left' && (
                  <div className="absolute top-10 right-10 border-4 border-red-500 rounded-xl p-4 rotate-[20deg] opacity-100 z-50">
                    <span className="text-red-500 text-4xl font-black uppercase">NOPE</span>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h4 className="font-bold text-gray-800 mb-2 uppercase text-xs tracking-widest">About Me</h4>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">
                  {currentUser.bio}
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentUser.topArtists.map(artist => (
                    <span key={artist} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full border">
                      {artist}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="absolute -bottom-20 inset-x-0 flex justify-center space-x-6 items-center">
              <button 
                onClick={() => handleSwipe('left')}
                className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors border"
              >
                <i className="fas fa-times text-2xl"></i>
              </button>
              <button className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors border">
                <i className="fas fa-undo"></i>
              </button>
              <button 
                onClick={() => handleSwipe('right')}
                className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-burnt-orange hover:bg-burnt-orange hover:text-white transition-colors border"
              >
                <i className="fas fa-heart text-2xl"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Matches & Chats */}
        <div className="w-full lg:w-80 bg-white rounded-3xl shadow-sm border p-6 h-fit sticky top-24">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <i className="fas fa-comment-dots text-burnt-orange mr-3"></i> 
            Matched Longhorns
          </h3>
          
          <div className="space-y-4">
            {matches.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-2xl">
                <p className="text-gray-400 text-sm">No matches yet. Start swiping to find concert buddies!</p>
              </div>
            ) : (
              matches.map((match, i) => (
                <div key={i} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-xl transition cursor-pointer border-b last:border-0 border-gray-100">
                  <img src={match.photo} alt={match.name} className="w-12 h-12 rounded-full object-cover border-2 border-burnt-orange" />
                  <div className="flex-grow">
                    <h4 className="font-bold text-gray-900 text-sm">{match.name}</h4>
                    <p className="text-xs text-green-600 font-medium">New Match! Say Hi 👋</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {matches.length > 0 && (
             <div className="mt-8">
               <button className="w-full bg-charcoal text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center">
                 <i className="fas fa-users mr-2"></i> Join Concert Group Chat
               </button>
             </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default BuddyFinder;
