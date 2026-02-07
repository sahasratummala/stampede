
import { MOCK_BUDDIES, CONCERT_MOODS, AVAILABLE_PROMPTS } from '../constants';
import { User, UserPrompt } from '../types';
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { getAllEventNames, generateBuddyResponse } from '../services/geminiService';

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
  const [isTyping, setIsTyping] = useState(false);

  // Dropdown States
  const [availableEvents, setAvailableEvents] = useState<string[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Chat Histories State
  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>({});

  // Unsaved changes state
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingView, setPendingView] = useState<'discover' | 'matches' | 'profile' | 'chat' | null>(null);

  // Draft profile state (Current Edits)
  const [tempProfile, setTempProfile] = useState<User>({ ...myProfile });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Helper for unique IDs
  const generateMsgId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

  // Fetch real events for the dropdown
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoadingEvents(true);
      const names = await getAllEventNames();
      setAvailableEvents(names);
      setIsLoadingEvents(false);
    };
    fetchEvents();
  }, []);

  // Update temp profile when global profile changes
  useEffect(() => {
    if (view !== 'profile') {
      setTempProfile({ ...myProfile });
    }
  }, [myProfile, view]);

  // Scroll logic to prevent page jumps
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (view === 'chat') {
      const timer = setTimeout(() => scrollToBottom(), 50);
      return () => clearTimeout(timer);
    }
  }, [view, chatHistories, chattingWith, isTyping]);

  const isDirty = useMemo(() => {
    return JSON.stringify(myProfile) !== JSON.stringify(tempProfile);
  }, [myProfile, tempProfile]);

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

  // Expanded and randomized response logic
  // Removed: getDynamicReplies - now using AI-powered responses via generateBuddyResponse

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chattingWith) return;

    const currentChattingId = chattingWith.id;
    const userMessage: Message = {
      id: generateMsgId(),
      senderId: 'me',
      text: newMessage.trim(),
      timestamp: new Date()
    };

    setChatHistories(prev => ({
      ...prev,
      [currentChattingId]: [...(prev[currentChattingId] || []), userMessage]
    }));

    setNewMessage('');

    // Build conversation history for context
    const currentHistory = chatHistories[currentChattingId] || [];
    const conversationHistory = currentHistory.map(msg => ({
      role: msg.senderId === 'me' ? 'user' : 'buddy',
      content: msg.text
    }));

    // Simulate typing indicator
    setTimeout(() => {
      setIsTyping(true);
    }, 300);

    try {
      // Generate AI response using Gemini
      const buddyResponse = await generateBuddyResponse(
        userMessage.text,
        chattingWith,
        myProfile,
        conversationHistory
      );

      setTimeout(() => {
        const buddyReply: Message = {
          id: generateMsgId(),
          senderId: currentChattingId,
          text: buddyResponse,
          timestamp: new Date()
        };
        setChatHistories(prev => ({
          ...prev,
          [currentChattingId]: [...(prev[currentChattingId] || []), buddyReply]
        }));
        setIsTyping(false);
      }, 1200);
    } catch (error) {
      console.error('Error generating response:', error);
      // Fallback response if AI fails
      setTimeout(() => {
        const fallbackReply: Message = {
          id: generateMsgId(),
          senderId: currentChattingId,
          text: "That's awesome! Let me think about that...",
          timestamp: new Date()
        };
        setChatHistories(prev => ({
          ...prev,
          [currentChattingId]: [...(prev[currentChattingId] || []), fallbackReply]
        }));
        setIsTyping(false);
      }, 1200);
    }
  };

  const [filterEvent, setFilterEvent] = useState<string>('');
  const [filterMajor, setFilterMajor] = useState<string>('');
  const [filterInterest, setFilterInterest] = useState<string>('');

  const uniqueEvents = useMemo(() => Array.from(new Set(MOCK_BUDDIES.map(b => b.attendingEvent))), []);
  const uniqueMajors = useMemo(() => Array.from(new Set(MOCK_BUDDIES.map(b => b.major))), []);

  const filteredBuddies = useMemo(() => {
    return MOCK_BUDDIES.filter(buddy => {
      const matchEvent = !filterEvent || buddy.attendingEvent === filterEvent;
      const matchMajor = !filterMajor || buddy.major === filterMajor;
      const matchInterest = !filterInterest ||
        buddy.interests.some(i => i.toLowerCase().includes(filterInterest.toLowerCase())) ||
        buddy.topArtists.some(a => a.toLowerCase().includes(filterInterest.toLowerCase()));
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

  const handlePromptChange = (index: number, field: keyof UserPrompt, value: string) => {
    const newPrompts = [...(tempProfile.prompts || [])];
    if (!newPrompts[index]) {
      newPrompts[index] = { question: AVAILABLE_PROMPTS[0], answer: '' };
    }
    newPrompts[index] = { ...newPrompts[index], [field]: value };
    setTempProfile(prev => ({ ...prev, prompts: newPrompts }));
  };

  const removePrompt = (index: number) => {
    const newPrompts = (tempProfile.prompts || []).filter((_, i) => i !== index);
    setTempProfile(prev => ({ ...prev, prompts: newPrompts }));
  };

  const addPrompt = () => {
    if ((tempProfile.prompts || []).length >= 3) return;
    setTempProfile(prev => ({
      ...prev,
      prompts: [...(prev.prompts || []), { question: AVAILABLE_PROMPTS[0], answer: '' }]
    }));
  };

  const currentUser = filteredBuddies[currentIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 pt-8 pb-32 md:pt-12 md:pb-40 min-h-[calc(100vh-4rem)]">
      <div className="flex justify-center mb-8 sticky top-[4rem] z-40 bg-gray-50/80 backdrop-blur-md py-4">
        <div className="bg-gray-200 p-1 rounded-full flex w-full max-w-md shadow-inner">
          <button onClick={() => handleViewChange('discover')} className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${view === 'discover' ? 'bg-white text-burnt-orange shadow' : 'text-gray-500'}`}>Discover</button>
          <button onClick={() => handleViewChange('matches')} className={`flex-1 py-2 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 ${view === 'matches' || view === 'chat' ? 'bg-white text-burnt-orange shadow' : 'text-gray-500'}`}>Matches {matches.length > 0 && <span className="bg-burnt-orange text-white text-[10px] px-1.5 py-0.5 rounded-full">{matches.length}</span>}</button>
          <button onClick={() => handleViewChange('profile')} className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${view === 'profile' ? 'bg-white text-burnt-orange shadow' : 'text-gray-500'}`}>My Profile {isDirty && view === 'profile' && <span className="ml-2 w-2 h-2 bg-burnt-orange rounded-full animate-pulse"></span>}</button>
        </div>
      </div>

      {view === 'discover' && (
        <div className="flex flex-col items-center">
          <div className="text-center mb-6">
            <h2 className="text-4xl font-bebas text-burnt-orange tracking-wider">Concert Buddy</h2>
            <p className="text-gray-500 text-sm">Find your pit crew for upcoming Moody Center shows.</p>
          </div>
          <div className="w-full max-w-[380px] mb-6 flex justify-end">
            <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${showFilters || filterEvent || filterMajor || filterInterest ? 'bg-burnt-orange text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
              <i className="fas fa-sliders-h"></i> {showFilters ? 'Hide Filters' : 'Filters'}
            </button>
          </div>
          {showFilters && (
            <div className="w-full max-w-[380px] bg-white border border-gray-100 rounded-2xl shadow-lg p-6 mb-8 animate-fade-in">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Filter by Event</label>
                  <select value={filterEvent} onChange={(e) => setFilterEvent(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none">
                    <option value="">All Events</option>
                    {uniqueEvents.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Filter by Major</label>
                  <select value={filterMajor} onChange={(e) => setFilterMajor(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none">
                    <option value="">All Majors</option>
                    {uniqueMajors.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Search Interest</label>
                  <input type="text" value={filterInterest} onChange={(e) => setFilterInterest(e.target.value)} placeholder="e.g. Photography, Pit" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none" />
                </div>
                <button onClick={clearFilters} className="w-full pt-2 text-xs font-bold text-burnt-orange hover:underline text-center">Clear All Filters</button>
              </div>
            </div>
          )}
          {filteredBuddies.length > 0 ? (
            <div className="relative w-full max-w-[380px] aspect-[2/3]">
              <div className="absolute inset-0 bg-white rounded-[2rem] shadow-lg transform translate-y-2 scale-95 opacity-50"></div>
              {/* Card Container: Handles all scrolling for a unified profile view */}
              <div className={`absolute inset-0 bg-white rounded-[2rem] shadow-2xl overflow-y-auto overflow-x-hidden transition-all duration-500 ${swiped === 'left' ? 'animate-swipe-left' : ''} ${swiped === 'right' ? 'animate-swipe-right' : ''}`}>
                {/* Profile Photo Area: Updated to a shorter aspect-square (1:1) per request */}
                <div className="relative aspect-square w-full bg-gray-100">
                  <img src={currentUser.photo} alt={currentUser.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  {currentUser.concertMood && (
                    <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md border border-white/30 text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-2">
                      <i className="fas fa-bolt text-yellow-400"></i> {currentUser.concertMood}
                    </div>
                  )}
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-3xl font-bold">{currentUser.name}</h3>
                      {currentUser.pronouns && <span className="text-xs font-medium opacity-70">({currentUser.pronouns})</span>}
                    </div>
                    <p className="text-sm font-medium opacity-90">{currentUser.major} @ UT Austin</p>
                  </div>
                </div>
                {/* Content Area: No separate scrolling box, part of unified flow */}
                <div className="p-6 bg-white space-y-4">
                  <div className="flex items-center gap-2 bg-orange-50 p-2 rounded-xl border border-orange-100">
                    <i className="fas fa-ticket-alt text-burnt-orange text-sm"></i>
                    <span className="text-xs font-bold text-burnt-orange uppercase tracking-tight truncate">Attending: {currentUser.attendingEvent}</span>
                  </div>
                  {currentUser.prompts && currentUser.prompts.length > 0 && (
                    <div className="space-y-3">
                      {currentUser.prompts.map((p, i) => (
                        <div key={i} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">{p.question}</p>
                          <p className="text-xs font-bold text-gray-800 italic">"{p.answer}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-gray-600 text-sm leading-snug">{currentUser.bio}</p>
                  <div className="flex flex-wrap gap-1.5 pb-4">
                    {currentUser.interests.map((interest) => (
                      <span key={interest} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-[10px] font-bold rounded-full border border-gray-200">{interest}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-20 left-0 right-0 flex justify-center items-center gap-28">
                <button
                  onClick={() => handleSwipe('left')}
                  className="w-14 h-14 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 hover:scale-125 transition-all duration-300 active:scale-90 group"
                >
                  <i className="fas fa-times text-xl group-hover:rotate-90 transition-transform duration-300"></i>
                </button>
                <button
                  onClick={() => handleSwipe('right')}
                  className="w-14 h-14 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-burnt-orange hover:scale-125 hover:shadow-burnt-orange/20 transition-all duration-300 active:scale-90 group"
                >
                  <i className="fas fa-heart text-xl group-hover:animate-pulse"></i>
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
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 mx-auto"><i className="fas fa-user-friends text-gray-300 text-2xl"></i></div>
              <p className="text-gray-400 font-medium">No matches yet. Keep swiping!</p>
              <button onClick={() => handleViewChange('discover')} className="mt-4 text-burnt-orange font-bold text-sm hover:underline">Back to Discover</button>
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((match) => (
                <div key={match.id} onClick={() => openChat(match)} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all group cursor-pointer active:scale-[0.99]">
                  <div className="relative flex-shrink-0">
                    <img src={match.photo} alt={match.name} className="w-14 h-14 rounded-xl object-cover border-2 border-burnt-orange p-0.5" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-900">{match.name} {match.pronouns && <span className="text-[10px] font-normal text-gray-400">({match.pronouns})</span>}</h4>
                      <button onClick={(e) => triggerRemoveMatch(e, match)} className="text-gray-300 hover:text-red-500 p-1 transition-colors"><i className="fas fa-trash-alt text-sm"></i></button>
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
        <div className="animate-fade-in max-w-2xl mx-auto h-[65vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-charcoal p-4 flex items-center gap-4 text-white">
            <button onClick={() => handleViewChange('matches')} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition"><i className="fas fa-arrow-left"></i></button>
            <img src={chattingWith.photo} alt={chattingWith.name} className="w-10 h-10 rounded-full object-cover border border-white/20" />
            <div className="flex-grow min-w-0">
              <h4 className="font-bold text-sm leading-tight truncate">{chattingWith.name}</h4>
              <p className="text-[10px] opacity-70 truncate">{chattingWith.attendingEvent}</p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <button onClick={(e) => triggerRemoveMatch(e, chattingWith)} className="text-white/40 hover:text-red-400 transition"><i className="fas fa-trash-alt"></i></button>
            </div>
          </div>
          <div ref={messagesContainerRef} className="flex-grow p-6 overflow-y-auto bg-gray-50 space-y-4 scroll-smooth">
            <div className="flex justify-center"><span className="bg-gray-200 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Matched on {new Date().toLocaleDateString()}</span></div>
            {(chatHistories[chattingWith.id] || []).map((msg) => (
              <div key={msg.id} className={`flex items-end gap-2 max-w-[80%] ${msg.senderId === 'me' ? 'ml-auto flex-row-reverse' : ''}`}>
                <img src={msg.senderId === 'me' ? myProfile.photo : chattingWith.photo} className="w-6 h-6 rounded-full object-cover" alt="" />
                <div className={`p-3 rounded-2xl shadow-sm ${msg.senderId === 'me' ? 'bg-burnt-orange text-white rounded-br-none' : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none'}`}>
                  <p className="text-sm">{msg.text}</p>
                  <span className={`text-[8px] block mt-1 ${msg.senderId === 'me' ? 'text-white/60 text-right' : 'text-gray-400'}`}>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-end gap-2 max-w-[80%]">
                <img src={chattingWith.photo} className="w-6 h-6 rounded-full object-cover" alt="" />
                <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-gray-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2 border border-gray-200 focus-within:border-burnt-orange transition-colors">
              <button className="text-gray-400 hover:text-burnt-orange"><i className="fas fa-plus"></i></button>
              <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-grow bg-transparent border-none outline-none text-sm py-1" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSendMessage(); } }} />
              <button onClick={handleSendMessage} disabled={!newMessage.trim()} className={`transition-colors ${newMessage.trim() ? 'text-burnt-orange' : 'text-gray-300'}`}><i className="fas fa-paper-plane"></i></button>
            </div>
          </div>
        </div>
      )}

      {view === 'profile' && (
        <div className="animate-fade-in max-w-2xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden pb-10">
          <div className="bg-burnt-orange p-8 text-white text-center">
            <h2 className="text-4xl font-bebas tracking-wider">Setup Your Card</h2>
            <p className="opacity-80 text-sm">This is how other Longhorns will see you.</p>
          </div>
          <div className="p-8 space-y-8">
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 rounded-3xl overflow-hidden border-4 border-gray-100 shadow-lg cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                <img src={tempProfile.photo} className="w-full h-full object-cover" alt="My Profile" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><i className="fas fa-camera text-white text-2xl"></i></div>
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
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Concert Mood</label>
                <select value={tempProfile.concertMood || ''} onChange={(e) => setTempProfile(prev => ({ ...prev, concertMood: e.target.value as any }))} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-burnt-orange outline-none text-sm font-bold text-burnt-orange">
                  <option value="">Select your vibe...</option>
                  {CONCERT_MOODS.map(mood => <option key={mood} value={mood}>{mood}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Pronouns</label>
                <input type="text" value={tempProfile.pronouns || ''} onChange={(e) => setTempProfile(prev => ({ ...prev, pronouns: e.target.value }))} placeholder="e.g. they/them" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-burnt-orange outline-none text-sm font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Major</label>
                <input type="text" value={tempProfile.major} onChange={(e) => setTempProfile(prev => ({ ...prev, major: e.target.value }))} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-burnt-orange outline-none text-sm font-medium" />
              </div>
            </div>
            <div className="space-y-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Conversation Starters</label>
                <button onClick={addPrompt} disabled={(tempProfile.prompts || []).length >= 3} className="text-xs font-bold text-burnt-orange hover:underline disabled:opacity-30">+ Add Prompt</button>
              </div>
              <div className="space-y-4">
                {(tempProfile.prompts || []).map((prompt, idx) => (
                  <div key={idx} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 relative group animate-fade-in">
                    <button onClick={() => removePrompt(idx)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"><i className="fas fa-trash-alt"></i></button>
                    <div className="space-y-3">
                      <div className="relative flex items-center">
                        <i className="fas fa-chevron-down absolute left-0 text-[8px] text-burnt-orange"></i>
                        <select value={prompt.question} onChange={(e) => handlePromptChange(idx, 'question', e.target.value)} className="w-full bg-transparent border-none pl-4 p-0 font-black text-[10px] text-burnt-orange uppercase tracking-wider outline-none cursor-pointer appearance-none">
                          {AVAILABLE_PROMPTS.map(q => <option key={q} value={q}>{q}</option>)}
                        </select>
                      </div>
                      <input type="text" value={prompt.answer} onChange={(e) => handlePromptChange(idx, 'answer', e.target.value)} placeholder="Type your answer..." className="w-full bg-transparent border-none p-0 text-sm font-bold text-gray-800 outline-none placeholder:text-gray-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Upcoming Event I'm Attending</label>
              <div className="relative">
                <i className="fas fa-ticket-alt absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <select value={tempProfile.attendingEvent} onChange={(e) => setTempProfile(prev => ({ ...prev, attendingEvent: e.target.value }))} className={`w-full pl-10 pr-4 py-3 bg-orange-50/30 border border-orange-100 rounded-xl focus:ring-2 focus:ring-burnt-orange outline-none text-sm font-bold text-burnt-orange appearance-none ${isLoadingEvents ? 'opacity-50' : ''}`} disabled={isLoadingEvents}>
                  <option value="">Select an upcoming show...</option>
                  {availableEvents.map(event => <option key={event} value={event}>{event}</option>)}
                </select>
                {isLoadingEvents && <div className="absolute right-4 top-1/2 -translate-y-1/2"><i className="fas fa-circle-notch fa-spin text-burnt-orange"></i></div>}
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
                  <span key={idx} className="bg-burnt-orange text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center">{interest}<button onClick={() => removeInterest(interest)} className="ml-2 hover:text-black"><i className="fas fa-times"></i></button></span>
                ))}
              </div>
              <input type="text" onKeyDown={handleAddInterest} placeholder="e.g. Pit Access, Mosh, Photo Ops" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-burnt-orange outline-none text-sm font-medium" />
            </div>
            <div className="space-y-4">
              <button onClick={handleSaveChanges} disabled={isSaved || !isDirty} className={`w-full py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${isSaved ? 'bg-green-600 text-white cursor-default' : isDirty ? 'bg-burnt-orange text-white hover:bg-orange-800' : 'bg-gray-200 text-gray-400 cursor-default'}`}>{isSaved ? 'Profile Saved Successfully!' : 'Save Profile Changes'}</button>
            </div>
          </div>
        </div>
      )}

      {showMatchModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-center relative overflow-hidden shadow-2xl">
            <h3 className="text-5xl font-bebas text-burnt-orange mb-4 tracking-tighter">IT'S A MATCH!</h3>
            <p className="text-gray-600 mb-8">You and <span className="font-bold">{showMatchModal.name}</span> both want to see <span className="italic">{showMatchModal.attendingEvent}</span>.</p>
            <div className="flex justify-center -space-x-4 mb-10">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-200 relative z-10"><img src={myProfile.photo} alt="Me" className="w-full h-full object-cover" /></div>
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-200 relative z-0"><img src={showMatchModal.photo} alt={showMatchModal.name} className="w-full h-full object-cover" /></div>
            </div>
            <div className="space-y-3">
              <button onClick={() => { const buddy = showMatchModal; setShowMatchModal(null); openChat(buddy); }} className="w-full py-4 bg-burnt-orange text-white rounded-2xl font-bold shadow-lg hover:bg-orange-800 transition active:scale-95">Send a Message</button>
              <button onClick={() => setShowMatchModal(null)} className="w-full py-3 bg-gray-50 text-gray-400 rounded-2xl font-bold text-sm hover:bg-gray-100 transition">Keep Swiping</button>
            </div>
          </div>
        </div>
      )}

      {matchToRemove && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center relative overflow-hidden shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Unmatch with {matchToRemove.name}?</h3>
            <p className="text-gray-500 text-sm mb-8">This will permanently remove them from your pit crew.</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setMatchToRemove(null)} className="py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition">Keep Match</button>
              <button onClick={confirmRemoveMatch} className="py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 shadow-lg transition">Unmatch</button>
            </div>
          </div>
        </div>
      )}

      {showUnsavedModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center relative overflow-hidden shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Unsaved Changes</h3>
            <p className="text-gray-500 text-sm mb-8">You've made changes to your profile. Save them before leaving?</p>
            <div className="space-y-3">
              <button onClick={confirmNavigateAndSave} className="w-full py-4 bg-burnt-orange text-white rounded-xl font-bold text-sm hover:bg-orange-800 transition">Save and Continue</button>
              <button onClick={confirmNavigateDiscard} className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition">Discard Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuddyFinder;
