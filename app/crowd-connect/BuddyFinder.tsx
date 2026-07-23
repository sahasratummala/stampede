'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Users,
  Heart,
  User as UserIcon,
  GraduationCap,
  Loader2,
  Sparkles,
  Send,
  ChevronLeft,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { normalizeInterests } from '@/lib/profile';

interface Buddy {
  id: string;
  name: string;
  major?: string;
  bio?: string;
  photo?: string;
  interests?: string | string[];
}

interface ChatMessage {
  id?: string;
  sender_id: string;
  receiver_id: string;
  content: string;
}

export default function CrowdConnect() {
  const [view, setView] = useState<'connect' | 'matches' | 'chat'>('connect');
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [matches, setMatches] = useState<Buddy[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [chatBuddy, setChatBuddy] = useState<Buddy | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [msgInput, setMsgInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- LOGIC: FETCHING ---
  const fetchMessages = async () => {
    if (!chatBuddy || !userId) return;
    const { data } = await supabase.from('messages').select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${chatBuddy.id}),and(sender_id.eq.${chatBuddy.id},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  const fetchBuddies = async (uid: string) => {
    setIsLoading(true);
    const { data: matched } = await supabase.from('buddy_matches').select('target_id').eq('user_id', uid);
    const matchedIds = matched?.map(m => m.target_id) || [];
    const { data } = await supabase.from('buddies').select('*').neq('id', uid)
      .not('id', 'in', `(${matchedIds.length > 0 ? matchedIds.join(',') : '00000000-0000-0000-0000-000000000000'})`);
    if (data) setBuddies(data);
    setIsLoading(false);
  };

  const fetchMatches = async (uid: string) => {
    const { data } = await supabase.from('buddy_matches').select(`target_id, buddies!buddy_matches_target_id_fkey (*)`).eq('user_id', uid);
    if (data) {
      setMatches(
        data
          .flatMap((match) => (Array.isArray(match.buddies) ? match.buddies : [match.buddies]))
          .filter((buddy): buddy is Buddy => Boolean(buddy))
      );
    }
  };

  // --- LOGIC: LIFECYCLE ---
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await fetchMatches(user.id);
        await fetchBuddies(user.id);
      }
    };
    init();
  }, []);

  // Chat logic
  useEffect(() => {
    if (view === 'chat' && chatBuddy && userId) {
      const messageTimer = window.setTimeout(() => {
        void fetchMessages();
      }, 0);
      const channel = supabase.channel('realtime-chat')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          if ((payload.new.sender_id === userId && payload.new.receiver_id === chatBuddy.id) ||
            (payload.new.sender_id === chatBuddy.id && payload.new.receiver_id === userId)) {
            setMessages(prev => [...prev, payload.new as ChatMessage]);
          }
        }).subscribe();
      return () => {
        window.clearTimeout(messageTimer);
        supabase.removeChannel(channel);
      };
    }
  }, [view, chatBuddy, userId]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim() || !userId || !chatBuddy) return;
    const { error } = await supabase.from('messages').insert({ sender_id: userId, receiver_id: chatBuddy.id, content: msgInput.trim() });
    if (!error) setMsgInput('');
  };

  const handleLike = async (targetId: string) => {
    if (!userId) return;
    const { error } = await supabase.from('buddy_matches').insert({ user_id: userId, target_id: targetId });
    if (!error) await fetchMatches(userId);
    setCurrentIndex(prev => prev + 1);
  };

  const currentUser = useMemo(() => buddies[currentIndex], [buddies, currentIndex]);
  const currentInterests = normalizeInterests(currentUser?.interests);

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 font-sans selection:bg-accent selection:text-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-7xl font-black italic uppercase tracking-tighter mb-16">CROWD CONNECT</h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Navigation */}
          <div className="lg:col-span-4">
            <div className="bg-card/50 rounded-3xl border border-border p-2 sticky top-24 backdrop-blur-xl">
              {([
                { id: 'connect', label: 'Connect', icon: Users },
                { id: 'matches', label: 'Matches', icon: Heart }
              ] as const).map(item => (
                <button key={item.id} onClick={() => setView(item.id)} className={`flex items-center gap-4 w-full px-8 py-5 rounded-2xl font-black uppercase italic transition-all ${view === item.id || (view === 'chat' && item.id === 'matches') ? 'bg-accent text-black translate-x-2' : 'text-muted hover:text-foreground hover:bg-card'}`}>
                  <item.icon size={22} strokeWidth={3} /> {item.label}
                  {item.id === 'matches' && matches.length > 0 && <span className="ml-auto bg-foreground/20 px-2 py-0.5 rounded-lg text-[10px]">{matches.length}</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8">
            {isLoading ? (
              <div className="flex justify-center py-40"><Loader2 className="animate-spin text-accent" size={60} /></div>
            ) : view === 'chat' && chatBuddy ? (
              <div className="bg-card rounded-[2.5rem] border border-border overflow-hidden flex flex-col h-[600px] animate-in slide-in-from-right-4">
                <div className="p-6 border-b border-border flex items-center gap-4">
                  <button onClick={() => setView('matches')} className="text-muted hover:text-foreground"><ChevronLeft size={24} /></button>
                  <div className="w-10 h-10 rounded-full bg-accent overflow-hidden">
                    {chatBuddy.photo ? <img src={chatBuddy.photo} alt="" className="w-full h-full object-cover" /> : <UserIcon className="m-auto mt-2 text-black" size={20} />}
                  </div>
                  <h4 className="font-black uppercase italic text-lg">{chatBuddy.name}</h4>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((msg, i) => (
                    <div key={msg.id ?? i} className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-4 py-3 rounded-2xl font-bold uppercase text-xs tracking-wider ${msg.sender_id === userId ? 'bg-accent text-black' : 'bg-card border border-border text-foreground'}`}>{msg.content}</div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={sendChat} className="p-6 border-t border-border flex gap-3">
                  <input type="text" value={msgInput} onChange={(e) => setMsgInput(e.target.value)} placeholder="SEND MESSAGE..." className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm font-bold uppercase outline-none focus:border-accent text-foreground placeholder:text-muted" />
                  <button type="submit" className="bg-accent text-black p-3 rounded-xl hover:scale-105 transition-all"><Send size={20} /></button>
                </form>
              </div>
            ) : view === 'matches' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {matches.length > 0 ? matches.map(m => (
                  <div key={m.id} onClick={() => { setChatBuddy(m); setView('chat'); }} className="bg-card p-6 rounded-[2rem] border border-border flex items-center gap-6 cursor-pointer hover:border-accent transition-all group">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-accent flex-shrink-0">
                      {m.photo ? <img src={m.photo} alt="" className="w-full h-full object-cover" /> : <UserIcon size={40} className="m-auto mt-5 text-black" />}
                    </div>
                    <div>
                      <h4 className="font-black uppercase italic text-xl group-hover:text-accent transition-colors">{m.name}</h4>
                      <p className="text-xs text-accent font-bold uppercase tracking-widest">{m.major}</p>
                    </div>
                  </div>
                )) : <div className="col-span-2 text-center py-32 opacity-20 italic uppercase font-black">Your Herd is Empty</div>}
              </div>
            ) : currentUser ? (
              <div className="max-w-lg mx-auto space-y-8 animate-in slide-in-from-bottom-8">
                <div className="relative rounded-[3rem] overflow-hidden aspect-[3.5/5] border-[12px] border-card shadow-2xl bg-card">
                  {currentUser.photo ? <img src={currentUser.photo} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-accent flex items-center justify-center"><UserIcon size={120} className="text-black opacity-80" /></div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 p-10 flex flex-col justify-end">
                    <h3 className="text-6xl font-black italic uppercase tracking-tighter leading-none mb-2 text-white">{currentUser.name}</h3>
                    <span className="flex items-center gap-3 text-accent font-black uppercase text-sm tracking-widest"><GraduationCap size={20} /> {currentUser.major}</span>
                  </div>
                </div>
                <div className="bg-card rounded-[2.5rem] p-10 border border-border space-y-6">
                  <div><h4 className="text-[10px] text-muted font-black uppercase tracking-[0.3em] mb-3 flex items-center gap-2"><Sparkles size={14} /> The Vibe</h4><p className="text-2xl italic opacity-90 font-medium">&ldquo;{currentUser.bio || 'Silence is my vibe...'}&rdquo;</p></div>
                  {currentInterests.length > 0 && <div className="flex flex-wrap gap-2 pt-4 border-t border-border">{currentInterests.map((tag, i) => <span key={`${tag}-${i}`} className="bg-background text-foreground px-5 py-2.5 rounded-full text-[10px] font-black uppercase border border-border">{tag}</span>)}</div>}
                </div>
                <div className="flex gap-4">
                  <button onClick={() => handleLike(currentUser.id)} className="flex-[2] bg-accent text-black font-black py-7 rounded-[2rem] text-3xl uppercase italic hover:scale-105 transition-all">Add to Herd</button>
                  <button onClick={() => setCurrentIndex(prev => prev + 1)} className="flex-1 bg-card text-muted font-black py-7 rounded-[2rem] text-2xl uppercase italic border-2 border-border hover:text-foreground transition-all">Skip</button>
                </div>
              </div>
            ) : (
              <div className="text-center py-40 bg-card/30 rounded-[3rem] border-4 border-dashed border-border"><Sparkles size={80} className="mx-auto mb-6 text-accent opacity-50" /><h3 className="text-4xl font-black uppercase italic tracking-widest opacity-30">Out of Buddies</h3></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}