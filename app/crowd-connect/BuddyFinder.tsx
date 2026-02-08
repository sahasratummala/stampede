'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Users, Heart, User as UserIcon, X, GraduationCap, 
  Loader2, Plus, Camera, Sparkles, Music, Send, ChevronLeft
} from 'lucide-react';
import { supabase } from "@/lib/supabase";

// --- SUB-COMPONENT: PROFILE EDITOR ---
const ProfileEditor = ({ formData, setFormData, handleSaveProfile, isSaving }: any) => {
  const [newInterest, setNewInterest] = useState('');
  const [uploading, setUploading] = useState(false);

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData({ ...formData, interests: [...formData.interests, newInterest.trim()] });
      setNewInterest('');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      setUploading(true);
      const file = e.target.files[0];
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      setFormData({ ...formData, photo: data.publicUrl });
    } catch (error: any) {
      console.error("Upload error:", error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center animate-in fade-in duration-500 max-w-xl mx-auto">
      <div className="w-full space-y-8 text-center">
        <div className="relative inline-block">
          <div className="w-40 h-40 bg-card rounded-[2.5rem] flex items-center justify-center shadow-2xl mx-auto overflow-hidden border-4 border-border">
            {formData.photo ? (
              <img src={formData.photo} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              <div className="w-full h-full bg-accent flex items-center justify-center">
                <UserIcon size={60} className="text-black" />
              </div>
            )}
            {uploading && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Loader2 className="animate-spin text-accent" /></div>}
          </div>
          <label className="absolute -bottom-2 -right-2 bg-accent p-3 rounded-2xl cursor-pointer hover:brightness-110 transition-all shadow-xl border-4 border-background">
            <Camera className="w-6 h-6 text-white" />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        </div>

        <div className="space-y-4 text-left">
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted ml-2">Full Name</label>
          <input type="text" placeholder="YOUR NAME" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-card border-2 border-border rounded-2xl px-6 py-5 font-bold text-foreground outline-none focus:border-accent transition-all uppercase placeholder:text-muted" />
          
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted ml-2">Major</label>
          <div className="relative">
            <input type="text" placeholder="WHAT DO YOU STUDY?" value={formData.major} onChange={(e) => setFormData({...formData, major: e.target.value})} className="w-full bg-card border-2 border-border rounded-2xl px-6 py-5 font-bold text-foreground outline-none focus:border-accent transition-all uppercase placeholder:text-muted" />
            <GraduationCap className="absolute right-5 top-1/2 -translate-y-1/2 text-accent" />
          </div>

          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted ml-2">Bio / Vibe</label>
          <textarea rows={3} placeholder="TELL THE HERD ABOUT YOURSELF..." value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full bg-card border-2 border-border rounded-2xl px-6 py-5 font-bold text-foreground outline-none focus:border-accent transition-all uppercase resize-none placeholder:text-muted" />
          
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted ml-2">Music Genres</label>
          <div className="bg-card border-2 border-border rounded-2xl px-6 py-5">
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.interests.map((tag: string, i: number) => (
                <span key={i} className="bg-accent text-black px-4 py-2 rounded-full text-[10px] font-black uppercase flex items-center gap-2">
                  {tag} <X className="w-3 h-3 cursor-pointer" onClick={() => setFormData({...formData, interests: formData.interests.filter((t: string) => t !== tag)})} />
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={newInterest} onChange={(e) => setNewInterest(e.target.value)} placeholder="ADD GENRE..." className="flex-1 bg-transparent border-b border-border py-2 outline-none focus:border-accent text-sm text-foreground placeholder:text-muted" />
              <button onClick={addInterest} className="text-accent hover:scale-110 transition-transform"><Plus /></button>
            </div>
          </div>
        </div>

        <button onClick={handleSaveProfile} disabled={isSaving} className="w-full bg-accent text-white font-black py-6 rounded-2xl text-xl uppercase italic transition-all flex items-center justify-center gap-3 hover:brightness-110 shadow-xl active:scale-95">
          {isSaving ? <Loader2 className="animate-spin" /> : "Save Profile & Start Swiping"}
        </button>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function CrowdConnect() {
  const [view, setView] = useState<'connect' | 'matches' | 'profile' | 'chat'>('connect');
  const [buddies, setBuddies] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Chat State
  const [chatBuddy, setChatBuddy] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [msgInput, setMsgInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '', major: '', bio: '', photo: '', interests: [] as string[]
  });

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await fetchMyProfile(user.id);
        await fetchMatches(user.id);
        await fetchBuddies(user.id);
      }
    };
    init();
  }, []);

  // Real-time Chat Subscription
  useEffect(() => {
    if (view === 'chat' && chatBuddy && userId) {
      fetchMessages();
      const channel = supabase.channel('realtime-chat')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          if ((payload.new.sender_id === userId && payload.new.receiver_id === chatBuddy.id) ||
              (payload.new.sender_id === chatBuddy.id && payload.new.receiver_id === userId)) {
            setMessages(prev => [...prev, payload.new]);
          }
        }).subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [view, chatBuddy]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchMessages = async () => {
    if (!chatBuddy || !userId) return;
    const { data } = await supabase.from('messages').select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${chatBuddy.id}),and(sender_id.eq.${chatBuddy.id},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  const sendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim() || !userId || !chatBuddy) return;
    const { error } = await supabase.from('messages').insert({ sender_id: userId, receiver_id: chatBuddy.id, content: msgInput.trim() });
    if (!error) setMsgInput('');
  };

// --- INSIDE YOUR MAIN CrowdConnect COMPONENT ---

const fetchMyProfile = async (uid: string) => {
  const { data, error } = await supabase
    .from('buddies')
    .select('*')
    .eq('id', uid)
    .single();

  if (data) {
    // THIS LINE PRE-FILLS THE FORM
    setFormData({
      name: data.name || '',
      major: data.major || '',
      bio: data.bio || '',
      photo: data.photo || '',
      interests: data.interests || []
    });
  }
};

// Update your init to make sure data is ready before rendering
useEffect(() => {
  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      // Fetch profile first so formData is ready for the editor
      await fetchMyProfile(user.id); 
      await fetchMatches(user.id);
      await fetchBuddies(user.id);
    }
  };
  init();
}, []);

// ADD THIS: Refresh data when user clicks "My Profile" tab to ensure it's up to date
useEffect(() => {
  if (view === 'profile' && userId) {
    fetchMyProfile(userId);
  }
}, [view]);

  const fetchBuddies = async (uid: string) => {
    setIsLoading(true);
    const { data: matched } = await supabase.from('buddy_matches').select('target_id').eq('user_id', uid);
    const matchedIds = matched?.map(m => m.target_id) || [];
    const { data, error } = await supabase.from('buddies').select('*').neq('id', uid)
      .not('id', 'in', `(${matchedIds.length > 0 ? matchedIds.join(',') : '00000000-0000-0000-0000-000000000000'})`);
    if (data) setBuddies(data);
    setIsLoading(false);
  };

  const fetchMatches = async (uid: string) => {
    const { data } = await supabase.from('buddy_matches').select(`target_id, buddies!buddy_matches_target_id_fkey (*)`).eq('user_id', uid);
    if (data) setMatches(data.map(m => m.buddies).filter(Boolean));
  };

  const handleSaveProfile = async () => {
    if (!userId) return;
    setIsSaving(true);
    const { error } = await supabase.from('buddies').upsert({ id: userId, ...formData, updated_at: new Date().toISOString() });
    if (!error) { await fetchBuddies(userId); setView('connect'); setCurrentIndex(0); }
    setIsSaving(false);
  };

  const handleLike = async (targetId: string) => {
    if (!userId) return;
    const { error } = await supabase.from('buddy_matches').insert({ user_id: userId, target_id: targetId });
    if (!error) await fetchMatches(userId);
    setCurrentIndex(prev => prev + 1);
  };

  const currentUser = useMemo(() => buddies[currentIndex], [buddies, currentIndex]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 font-sans selection:bg-accent selection:text-black transition-colors duration-300">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: var(--card);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--muted);
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-7xl font-black italic uppercase tracking-tighter mb-16">CROWD CONNECT</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Navigation */}
          <div className="lg:col-span-4">
            <div className="bg-card/50 rounded-3xl border border-border p-2 sticky top-24 backdrop-blur-xl">
              {[
                { id: 'connect', label: 'Connect', icon: Users }, 
                { id: 'matches', label: 'Matches', icon: Heart }, 
                { id: 'profile', label: 'My Profile', icon: UserIcon }
              ].map(item => (
                <button key={item.id} onClick={() => setView(item.id as any)} className={`flex items-center gap-4 w-full px-8 py-5 rounded-2xl font-black uppercase italic transition-all ${view === item.id || (view === 'chat' && item.id === 'matches') ? 'bg-accent text-black translate-x-2' : 'text-muted hover:text-foreground hover:bg-card'}`}>
                  <item.icon size={22} strokeWidth={3} /> {item.label}
                  {item.id === 'matches' && matches.length > 0 && <span className="ml-auto bg-foreground/20 px-2 py-0.5 rounded-lg text-[10px]">{matches.length}</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8">
            {isLoading ? (
              <div className="flex justify-center py-40"><Loader2 className="animate-spin text-accent" size={60} /></div>
            ) : view === 'profile' ? (
              <ProfileEditor formData={formData} setFormData={setFormData} handleSaveProfile={handleSaveProfile} isSaving={isSaving} />
            ) : view === 'chat' && chatBuddy ? (
              <div className="bg-card rounded-[2.5rem] border border-border overflow-hidden flex flex-col h-[600px] animate-in slide-in-from-right-4">
                <div className="p-6 border-b border-border flex items-center gap-4">
                  <button onClick={() => setView('matches')} className="text-muted hover:text-foreground"><ChevronLeft size={24} /></button>
                  <div className="w-10 h-10 rounded-full bg-accent overflow-hidden">
                    {chatBuddy.photo ? <img src={chatBuddy.photo} className="w-full h-full object-cover" /> : <UserIcon className="m-auto mt-2 text-black" size={20} />}
                  </div>
                  <h4 className="font-black uppercase italic text-lg">{chatBuddy.name}</h4>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-4 py-3 rounded-2xl font-bold uppercase text-xs tracking-wider ${msg.sender_id === userId ? 'bg-accent text-black' : 'bg-card border border-border text-foreground'}`}>{msg.content}</div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={sendChat} className="p-6 border-t border-border flex gap-3">
                  <input type="text" value={msgInput} onChange={(e) => setMsgInput(e.target.value)} placeholder="SEND MESSAGE..." className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm font-bold uppercase outline-none focus:border-accent text-foreground placeholder:text-muted" />
                  <button type="submit" className="bg-accent text-black p-3 rounded-xl hover:scale-105 transition-all"><Send size={20}/></button>
                </form>
              </div>
            ) : view === 'matches' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {matches.length > 0 ? matches.map(m => (
                  <div key={m.id} onClick={() => { setChatBuddy(m); setView('chat'); }} className="bg-card p-6 rounded-[2rem] border border-border flex items-center gap-6 cursor-pointer hover:border-accent transition-all group">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-accent flex-shrink-0">
                      {m.photo ? <img src={m.photo} className="w-full h-full object-cover" /> : <UserIcon size={40} className="m-auto mt-5 text-black" />}
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
                  {currentUser.photo ? <img src={currentUser.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-accent flex items-center justify-center"><UserIcon size={120} className="text-black opacity-80" /></div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 p-10 flex flex-col justify-end">
                    <h3 className="text-6xl font-black italic uppercase tracking-tighter leading-none mb-2 text-white">{currentUser.name}</h3>
                    <span className="flex items-center gap-3 text-accent font-black uppercase text-sm tracking-widest"><GraduationCap size={20}/> {currentUser.major}</span>
                  </div>
                </div>
                <div className="bg-card rounded-[2.5rem] p-10 border border-border space-y-6">
                  <div><h4 className="text-[10px] text-muted font-black uppercase tracking-[0.3em] mb-3 flex items-center gap-2"><Sparkles size={14} /> The Vibe</h4><p className="text-2xl italic opacity-90 font-medium">"{currentUser.bio || 'Silence is my vibe...'}"</p></div>
                  {currentUser.interests?.length > 0 && <div className="flex flex-wrap gap-2 pt-4 border-t border-border">{currentUser.interests.map((tag: string, i: number) => <span key={i} className="bg-background text-foreground px-5 py-2.5 rounded-full text-[10px] font-black uppercase border border-border">{tag}</span>)}</div>}
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
