
import { MOCK_BUDDIES } from '../constants';
import { User } from '../types';
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useUser } from '../context/UserContext';

interface Message {
  id: string;
  senderId: string; // 'me' or buddy id
  text: string;
  timestamp: Date;
}

const BuddyFinder: React.FC = () => {
  const { profile: myProfile, updateProfile } = useUser();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swiped, setSwiped] = useState<'left' | 'right' | null>(null);
  const [matches, setMatches] = useState<User[]>([]);
  const [showMatchModal, setShowMatchModal] = useState<User | null>(null);
  const [matchToRemove, setMatchToRemove] = useState<User | null>(null);
  const [view, setView] = useState<'discover' | 'matches' | 'profile' | 'chat'>('discover');
  const [chattingWith, setChattingWith] = useState<User | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  // Chat Histories State
  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>({});

  // Unsaved changes state
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingView, setPendingView] = useState<'discover' | 'matches' | 'profile' | 'chat' | null>(null);

  // Draft profile state (Current Edits)
  const [tempProfile, setTempProfile] = useState<User>({ ...myProfile });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update temp profile when global profile changes (only if not already editing)
  useEffect(() => {
    if (view !== 'profile') {
      setTempProfile({ ...myProfile });
    }
  }, [myProfile, view]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (view === 'chat') {
      scrollToBottom();
    }
  }, [view, chatHistories, chattingWith]);

  // Check if profile has unsaved changes
  const isDirty = useMemo(() => {
    return JSON.stringify(myProfile) !== JSON.stringify(tempProfile);
  }, [myProfile, tempProfile]);

  // Handle view navigation with dirty check
  const handleViewChange = (newView: 'discover' | 'matches' | 'profile' | 'chat') => {
    if (view === 'profile' && isDirty && newView !== 'profile') {
      setPendingView(newView);
      setShowUnsavedModal(true);
    } else {
      if (newView === 'profile') {
        setTempProfile({ ...myProfile });
      }
      setView(newView);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !chattingWith) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text: newMessage.trim(),
      timestamp: new Date()
    };

    setChatHistories(prev => ({
      ...prev,
      [chattingWith.id]: [...(prev[chattingWith.id] || []), userMessage]
    }));

    setNewMessage('');

    // Mock reply from buddy
    setTimeout(() => {
      const buddyReply: Message = {
        id: (Date.now() + 1).toString(),
        senderId: chattingWith.id,
        text: "That sounds awesome! Can't wait for the show. Hook 'em! 🤘",
        timestamp: new Date()
      };
      setChatHistories(prev => ({
        ...prev,
        [chattingWith.id]: [...(prev[chattingWith.id] || []), buddyReply]
      }));
    }, 1500);
  };

  // Filter States
  const [filterEvent, setFilterEvent] = useState<string>('');
  const [filterMajor, setFilterMajor] = useState<string>('');
  const [filterInterest, setFilterInterest] = useState<string>('');

  const uniqueEvents = useMemo(() => Array.from(new Set(MOCK_BUDDIES.map(b => b.attendingEvent))), []);
  const uniqueMajors = useMemo(() => Array.from(new Set(MOCK_BUDDIES.map(b => b.major))), []);

  const filteredBuddies = useMemo(() => {
    return MOCK_BUDDIES.filter(buddy => {
      const matchEvent = !filterEvent || buddy.attendingEvent === filterEvent;
      const matchMajor = !filterMajor || buddy.major === filterMajor;
      const matchInterest = !filterInterest || buddy.interests.some(i => i.toLowerCase().includes(filterInterest.toLowerCase()));
      return matchEvent && matchMajor && matchInterest;
    });
  }, [filterEvent, filterMajor, filterInterest]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [filteredBuddies.length]);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (swiped || filteredBuddies.length === 0) return;
    setSwiped(direction);
    
    const swipedUser = filteredBuddies[currentIndex];

    if (direction === 'right') {
      setTimeout(() => {
        setShowMatchModal(swipedUser);
        setMatches(prev => {
          if (prev.find(m => m.id === swipedUser.id)) return prev;
          return [...prev, swipedUser];
        });
        
        // Initialize chat history if it doesn't exist
        if (!chatHistories[swipedUser.id]) {
          setChatHistories(prev => ({
            ...prev,
            [swipedUser.id]: [
              {
                id: 'initial-' + swipedUser.id,
                senderId: swipedUser.id,
                text: `Hey! Saw you're going to ${swipedUser.attendingEvent.split('@')[0]} too. Ready for it?`,
                timestamp: new Date()
              }
            ]
          }));
        }
      }, 500);
    }

    setTimeout(() => {
      setSwiped(null);
      setCurrentIndex((prev) => (prev + 1) % filteredBuddies.length);
    }, 500);
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempProfile(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddInterest = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = (e.target as HTMLInputElement).value.trim();
      if (value && !tempProfile.interests.includes(value)) {
        setTempProfile(prev => ({ ...prev, interests: [...prev.interests, value] }));
        (e.target as HTMLInputElement).value = '';
      }
    }
  };

  const removeInterest = (interest: string) => {
    setTempProfile(prev => ({ ...prev, interests: prev.interests.filter(i => i !== interest) }));
  };

  const handleSaveChanges = () => {
    updateProfile({ ...tempProfile });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  const confirmNavigateAndSave = () => {
    updateProfile({ ...tempProfile });
    if (pendingView) setView(pendingView);
    setShowUnsavedModal(false);
    setPendingView(null);
  };

  const confirmNavigateDiscard = () => {
    setTempProfile({ ...myProfile });
    if (pendingView) setView(pendingView);
    setShowUnsavedModal(false);
    setPendingView(null);
  };

  const clearFilters = () => {
    setFilterEvent('');
    setFilterMajor('');
    setFilterInterest('');
  };

  const triggerRemoveMatch = (e: React.MouseEvent, buddy: User) => {
    e.stopPropagation();
    setMatchToRemove(buddy);
  };

  const confirmRemoveMatch = () => {
    if (!matchToRemove) return;
    const idToRemove = matchToRemove.id;
    setMatches(prev => prev.filter(m => m.id !== idToRemove));
    if (chattingWith?.id === idToRemove) {
      setView('matches');
      setChattingWith(null);
    }
    setMatchToRemove(null);
  };

  const openChat = (buddy: User) => {
    setMatches(prev => {
      if (prev.find(m => m.id === buddy.id)) return prev;
      return [...prev, buddy];
    });
    setChattingWith(buddy);
    setView('chat');
  };

  const currentUser = filteredBuddies[currentIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 min-h-[calc(100vh-4rem)]">
      {/* Persistent Toggle View Navigation */}
      <div className="flex justify-center mb-8 sticky top-[4rem] z-40 bg-gray-50/80 backdrop-blur-md py-4">
        <div className="bg-gray-200 p-1 rounded-full flex w-full max-w-md shadow-inner">
          <button 
            onClick={() => handleViewChange('discover')}
            className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${view === 'discover' ? 'bg-white text-burnt-orange shadow' : 'text-gray-500'}`}
          >
            Discover
          </button>
          <button 
            onClick={() => handleViewChange('matches')}
            className={`flex-1 py-2 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 ${view === 'matches' || view === 'chat' ? 'bg-white text-burnt-orange shadow' : 'text-gray-500'}`}
          >
            Matches
            {matches.length > 0 && <span className="bg-burnt-orange text-white text-[10px] px-1.5 py-0.5 rounded-full">{matches.length}</span>}
          </button>
          <button 
            onClick={() => handleViewChange('profile')}
            className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${view === 'profile' ? 'bg-white text-burnt-orange shadow' : 'text-gray-500'}`}
          >
            My Profile
            {isDirty && view === 'profile' && <span className="ml-2 w-2 h-2 bg-burnt-orange rounded-full animate-pulse"></span>}
          </button>
        </div>
      </div>

      {view === 'discover' && (
        <div className="flex flex-col items-center">
          <div className="text-center mb-6">
            <h2 className="text-4xl font-bebas text-burnt-orange tracking-wider">Concert Buddy</h2>
            <p className="text-gray-500 text-sm">Find your pit crew for upcoming Moody Center shows.</p>
          </div>

          <div className="w-full max-w-[380px] mb-6 flex justify-end">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${showFilters || filterEvent || filterMajor || filterInterest ? 'bg-burnt-orange text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
            >
              <i className="fas fa-sliders-h"></i>
              {showFilters ? 'Hide Filters' : 'Filters'}
              {(filterEvent || filterMajor || filterInterest) && <span className="w-2 h-2 bg-white rounded-full"></span>}
            </button>
          </div>

          {showFilters && (
            <div className="w-full max-w-[380px] bg-white border border-gray-100 rounded-2xl shadow-lg p-6 mb-8 animate-fade-in">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Filter by Event</label>
                  <select 
                    value={filterEvent}
                    onChange={(e) => setFilterEvent(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-burnt-orange/20"
                  >
                    <option value="">All Events</option>
                    {uniqueEvents.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Filter by Major</label>
                  <select 
                    value={filterMajor}
                    onChange={(e) => setFilterMajor(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-burnt-orange/20"
                  >
                    <option value="">All Majors</option>
                    {uniqueMajors.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Search Interest</label>
                  <input 
                    type="text"
                    value={filterInterest}
                    onChange={(e) => setFilterInterest(e.target.value)}
                    placeholder="e.g. Photography, Pit"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-burnt-orange/20"
                  />
                </div>
                <button 
                  onClick={clearFilters}
                  className="w-full pt-2 text-xs font-bold text-burnt-orange hover:underline text-center"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}

          {filteredBuddies.length > 0 ? (
            <div className="relative w-full max-w-[380px] aspect-[2/3]">
              <div className="absolute inset-0 bg-white rounded-[2rem] shadow-lg transform translate-y-2 scale-95 opacity-50"></div>
              <div className={`
                absolute inset-0 bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col transition-all duration-500
                ${swiped === 'left' ? 'animate-swipe-left' : ''}
                ${swiped === 'right' ? 'animate-swipe-right' : ''}
              `}>
                <div className="relative h-[65%]">
                  <img src={currentUser.photo} alt={currentUser.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-3xl font-bold">{currentUser.name}</h3>
                      {currentUser.pronouns && <span className="text-xs font-medium opacity-70">({currentUser.pronouns})</span>}
                      <span className="text-xl opacity-90 ml-auto">21</span>
                    </div>
                    <p className="text-sm font-medium opacity-90">{currentUser.major} @ UT Austin</p>
                  </div>
                </div>
                <div className="p-6 overflow-y-auto flex-grow bg-white">
                  <div className="flex items-center gap-2 mb-3 bg-orange-50 p-2 rounded-xl border border-orange-100">
                    <i className="fas fa-ticket-alt text-burnt-orange text-sm"></i>
                    <span className="text-xs font-bold text-burnt-orange uppercase tracking-tight truncate">Attending: {currentUser.attendingEvent}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 leading-snug line-clamp-2">{currentUser.bio}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {currentUser.interests.map((interest) => (
                      <span key={interest} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-[10px] font-bold rounded-full border border-gray-200">{interest}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-10 left-0 right-0 flex justify-center items-center gap-6">
                <button onClick={() => handleSwipe('left')} className="w-14 h-14 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors active:scale-90">
                  <i className="fas fa-times text-xl"></i>
                </button>
                <button onClick={() => handleSwipe('right')} className="w-14 h-14 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-burnt-orange hover:bg-burnt-orange hover:text-white transition-all active:scale-90">
                  <i className="fas fa-heart text-xl"></i>
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-[380px] bg-white rounded-[2rem] shadow-xl p-12 text-center border-2 border-dashed border-gray-100 mt-8">
              <i className="fas fa-search text-gray-200 text-5xl mb-6"></i>
              <h4 className="text-xl font-bold text-gray-800 mb-2">No buddies found</h4>
              <p className="text-gray-500 text-sm mb-6">Try broadening your filters to find more Longhorns.</p>
              <button onClick={clearFilters} className="px-6 py-2 bg-burnt-orange text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-100">Clear Filters</button>
            </div>
          )}
        </div>
      )}

      {view === 'matches' && (
        <div className="animate-fade-in max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bebas text-burnt-orange tracking-wider">Your Matches</h2>
            <p className="text-gray-500 text-sm">Click to chat or manage your pit crew.</p>
          </div>
          {matches.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 mx-auto">
                <i className="fas fa-user-friends text-gray-300 text-2xl"></i>
              </div>
              <p className="text-gray-400 font-medium">No matches yet. Keep swiping!</p>
              <button onClick={() => handleViewChange('discover')} className="mt-4 text-burnt-orange font-bold text-sm hover:underline">Back to Discover</button>
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((match) => (
                <div 
                  key={match.id} 
                  onClick={() => openChat(match)}
                  className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all group cursor-pointer active:scale-[0.99]"
                >
                  <div className="relative flex-shrink-0">
                    <img src={match.photo} alt={match.name} className="w-14 h-14 rounded-xl object-cover border-2 border-burnt-orange p-0.5" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-900">{match.name} {match.pronouns && <span className="text-[10px] font-normal text-gray-400">({match.pronouns})</span>}</h4>
                      <button 
                        onClick={(e) => triggerRemoveMatch(e, match)}
                        className="text-gray-300 hover:text-red-500 p-1 transition-colors"
                        title="Remove Match"
                      >
                        <i className="fas fa-trash-alt text-sm"></i>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1 truncate pr-4">{match.attendingEvent}</p>
                    <span className="text-[10px] font-bold text-burnt-orange/60 uppercase">Active Now</span>
                  </div>
                  <i className="fas fa-chevron-right text-gray-200 group-hover:text-burnt-orange transition-colors"></i>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'chat' && chattingWith && (
        <div className="animate-fade-in max-w-2xl mx-auto h-[60vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Chat Header */}
          <div className="bg-charcoal p-4 flex items-center gap-4 text-white">
            <button 
              onClick={() => handleViewChange('matches')}
              className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition"
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <img src={chattingWith.photo} alt={chattingWith.name} className="w-10 h-10 rounded-full object-cover border border-white/20" />
            <div className="flex-grow min-w-0">
              <h4 className="font-bold text-sm leading-tight truncate">{chattingWith.name}</h4>
              <p className="text-[10px] opacity-70 truncate">{chattingWith.attendingEvent}</p>
            </div>
            <div className="ml-auto flex items-center gap-3">
               <button 
                onClick={(e) => triggerRemoveMatch(e, chattingWith)}
                className="text-white/40 hover:text-red-400 transition"
                title="Remove Match"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
              <button className="text-white/40 hover:text-white transition">
                <i className="fas fa-ellipsis-v"></i>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-grow p-6 overflow-y-auto bg-gray-50 space-y-4">
            <div className="flex justify-center">
              <span className="bg-gray-200 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                Matched on {new Date().toLocaleDateString()}
              </span>
            </div>
            
            {(chatHistories[chattingWith.id] || []).map((msg) => (
              <div 
                key={msg.id} 
                className={`flex items-end gap-2 max-w-[80%] ${msg.senderId === 'me' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <img src={msg.senderId === 'me' ? myProfile.photo : chattingWith.photo} className="w-6 h-6 rounded-full object-cover" alt="" />
                <div className={`p-3 rounded-2xl shadow-sm ${msg.senderId === 'me' ? 'bg-burnt-orange text-white rounded-br-none' : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none'}`}>
                  <p className="text-sm">{msg.text}</p>
                  <span className={`text-[8px] block mt-1 ${msg.senderId === 'me' ? 'text-white/60 text-right' : 'text-gray-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2 border border-gray-200 focus-within:border-burnt-orange transition-colors">
              <button className="text-gray-400 hover:text-burnt-orange"><i className="fas fa-plus"></i></button>
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-grow bg-transparent border-none outline-none text-sm py-1"
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className={`transition-colors ${newMessage.trim() ? 'text-burnt-orange' : 'text-gray-300'}`}
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {view === 'profile' && (
        <div className="animate-fade-in max-w-2xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="bg-burnt-orange p-8 text-white text-center">
            <h2 className="text-4xl font-bebas tracking-wider">Setup Your Card</h2>
            <p className="opacity-80 text-sm">This is how other Longhorns will see you.</p>
          </div>
          <div className="p-8 space-y-8">
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 rounded-3xl overflow-hidden border-4 border-gray-100 shadow-lg cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                <img src={tempProfile.photo} className="w-full h-full object-cover" alt="My Profile" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <i className="fas fa-camera text-white text-2xl"></i>
                </div>
                <input type="file" hidden ref={fileInputRef} onChange={handleProfileImageUpload} accept="image/*" />
              </div>
              <p className="mt-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Tap to change photo</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Display Name</label>
                <input type="text" value={tempProfile.name} onChange={(e) => setTempProfile(prev => ({ ...prev, name: e.target.value }))} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-burnt-orange outline-none text-sm font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Pronouns</label>
                <input type="text" value={tempProfile.pronouns || ''} onChange={(e) => setTempProfile(prev => ({ ...prev, pronouns: e.target.value }))} placeholder="e.g. they/them" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-burnt-orange outline-none text-sm font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Major</label>
                <input type="text" value={tempProfile.major} onChange={(e) => setTempProfile(prev => ({ ...prev, major: e.target.value }))} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-burnt-orange outline-none text-sm font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Upcoming Event I'm Attending</label>
                <div className="relative">
                  <i className="fas fa-ticket-alt absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input type="text" value={tempProfile.attendingEvent} onChange={(e) => setTempProfile(prev => ({ ...prev, attendingEvent: e.target.value }))} placeholder="e.g. Billie Eilish @ Moody" className="w-full pl-10 pr-4 py-3 bg-orange-50/30 border border-orange-100 rounded-xl focus:ring-2 focus:ring-burnt-orange outline-none text-sm font-bold text-burnt-orange" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Bio / Pitch</label>
              <textarea value={tempProfile.bio} onChange={(e) => setTempProfile(prev => ({ ...prev, bio: e.target.value }))} rows={3} placeholder="Tell others what you're looking for..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-burnt-orange outline-none text-sm font-medium resize-none"></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Interests (Press Enter to add)</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {tempProfile.interests.map((interest, idx) => (
                  <span key={idx} className="bg-burnt-orange text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center">
                    {interest}
                    <button onClick={() => removeInterest(interest)} className="ml-2 hover:text-black"><i className="fas fa-times"></i></button>
                  </span>
                ))}
              </div>
              <input type="text" onKeyDown={handleAddInterest} placeholder="e.g. Pit Access, Mosh, Photo Ops" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-burnt-orange outline-none text-sm font-medium" />
            </div>
            <div className="space-y-4">
              <button onClick={handleSaveChanges} disabled={isSaved || !isDirty} className={`w-full py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${isSaved ? 'bg-green-600 text-white cursor-default' : isDirty ? 'bg-burnt-orange text-white hover:bg-orange-800' : 'bg-gray-200 text-gray-400 cursor-default'}`}>
                {isSaved ? <><i className="fas fa-check-circle"></i> Profile Saved Successfully!</> : isDirty ? 'Save Profile Changes' : 'No Changes to Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Match Confirmation Modal */}
      {showMatchModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-burnt-orange to-orange-400"></div>
            <h3 className="text-5xl font-bebas text-burnt-orange mb-4 tracking-tighter">IT'S A MATCH!</h3>
            <p className="text-gray-600 mb-8">You and <span className="font-bold">{showMatchModal.name}</span> both want to see <span className="italic">{showMatchModal.attendingEvent}</span>.</p>
            <div className="flex justify-center -space-x-4 mb-10">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-200 relative z-10">
                <img src={myProfile.photo} alt="Me" className="w-full h-full object-cover" />
              </div>
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-200 relative z-0">
                <img src={showMatchModal.photo} alt={showMatchModal.name} className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="space-y-3">
              <button 
                onClick={() => { 
                  const buddy = showMatchModal;
                  setShowMatchModal(null); 
                  openChat(buddy); 
                }} 
                className="w-full py-4 bg-burnt-orange text-white rounded-2xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-800 transition active:scale-95"
              >
                Send a Message
              </button>
              <button onClick={() => setShowMatchModal(null)} className="w-full py-3 bg-gray-50 text-gray-400 rounded-2xl font-bold text-sm hover:bg-gray-100 transition">Keep Swiping</button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Match Confirmation Modal */}
      {matchToRemove && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center relative overflow-hidden shadow-2xl">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-user-slash text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Unmatch with {matchToRemove.name}?</h3>
            <p className="text-gray-500 text-sm mb-8">
              This will permanently remove them from your pit crew and delete your conversation.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setMatchToRemove(null)}
                className="py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition active:scale-95"
              >
                Keep Match
              </button>
              <button 
                onClick={confirmRemoveMatch}
                className="py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 shadow-lg shadow-red-100 transition active:scale-95"
              >
                Unmatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Confirmation Modal */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center relative overflow-hidden shadow-2xl">
            <div className="w-16 h-16 bg-orange-50 text-burnt-orange rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-exclamation-triangle text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Unsaved Changes</h3>
            <p className="text-gray-500 text-sm mb-8">
              You've made changes to your profile. Would you like to save them before leaving?
            </p>
            <div className="space-y-3">
              <button 
                onClick={confirmNavigateAndSave}
                className="w-full py-4 bg-burnt-orange text-white rounded-xl font-bold text-sm hover:bg-orange-800 transition active:scale-95"
              >
                Save and Continue
              </button>
              <button 
                onClick={confirmNavigateDiscard}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition active:scale-95"
              >
                Discard Changes
              </button>
              <button 
                onClick={() => { setShowUnsavedModal(false); setPendingView(null); }}
                className="w-full py-2 text-gray-400 font-bold text-xs hover:text-gray-600 transition"
              >
                Stay on Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuddyFinder;
