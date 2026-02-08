"use client";
import { useState, useEffect } from "react";
import { Heart, X, Music, Loader2, Sparkles } from "lucide-react"; // Added Sparkles for AI vibe
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ArtistDiscovery() {
  const router = useRouter();
  const [artists, setArtists] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAiSorting, setIsAiSorting] = useState(false);
  const [direction, setDirection] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      setLoading(true);
      
      // 1. Get User
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      // 2. Fetch Listener Profile & All Artists
      const { data: listenerData } = await supabase.from('listeners').select('*').eq('id', user?.id).single();
      const { data: allArtists } = await supabase.from('artists').select('*');

      if (allArtists && listenerData) {
        setIsAiSorting(true);
        try {
          // 3. Call our AI Route
          const response = await fetch("/api/recommend", {
            method: "POST",
            body: JSON.stringify({ listener: listenerData, artists: allArtists }),
          });
          const rankedIds = await response.json();

          // 4. Sort artists based on the AI's list
          const sortedArtists = [...allArtists].sort((a, b) => {
            return rankedIds.indexOf(a.id) - rankedIds.indexOf(b.id);
          });

          // Reverse it because the "stack" shows the LAST item first in the UI
          setArtists(sortedArtists.reverse());
          setCurrentIndex(sortedArtists.length - 1);
        } catch (err) {
          console.error("AI Sort failed, using default order", err);
          setArtists(allArtists);
          setCurrentIndex(allArtists.length - 1);
        }
      }
      setIsAiSorting(false);
      setLoading(false);
    }
    init();
  }, []);

  // ... (Keep handleSwipe the same as your previous version)
  const handleSwipe = async (dir: 'left' | 'right') => {
    const currentArtist = artists[currentIndex];
    setDirection(dir);
    if (dir === 'right' && currentArtist?.id && currentUserId) {
      const { error } = await supabase.from('follows').insert([{ follower_id: currentUserId, artist_id: currentArtist.id }]);
      if (error && error.code !== '23505') console.error(error.message);
    }
    setTimeout(() => {
      setDirection(null);
      setCurrentIndex(prev => prev - 1);
    }, 400);
  };

  if (loading || isAiSorting) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
      <div className="flex items-center gap-2">
        <Sparkles className="text-orange-500 animate-pulse" size={16} />
        <p className="text-orange-500 font-black italic tracking-widest uppercase text-xs">
          {isAiSorting ? "AI Ranking Your Vibe..." : "Syncing Stampede..."}
        </p>
      </div>
    </div>
  );

  if (currentIndex < 0) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-zinc-500 font-bold uppercase tracking-widest gap-4">
      <Music size={40} className="text-zinc-800" />
      <p>No more artists in Austin today.</p>
      <button onClick={() => window.location.reload()} className="text-orange-500 text-xs mt-4 underline">Refresh Feed</button>
    </div>
  );

  const artist = artists[currentIndex];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-10 px-4">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-4xl font-black italic text-orange-500 tracking-tighter uppercase leading-none">Discover</h1>
        <div className="flex items-center gap-1 mt-2">
            <Sparkles size={10} className="text-zinc-500" />
            <span className="text-[8px] text-zinc-500 font-black uppercase tracking-[0.3em]">AI Personalization Active</span>
        </div>
      </div>
      
      {/* ... (Keep the Card UI and Swipe buttons the same as before) */}
      <div className="relative w-full max-w-[400px] h-[600px]">
        <div className={`absolute inset-0 bg-zinc-900 rounded-[3rem] overflow-hidden border border-white/10 transition-all duration-500 transform 
          ${direction === 'left' ? '-translate-x-[150%] rotate-[-20deg] opacity-0' : direction === 'right' ? 'translate-x-[150%] rotate-[20deg] opacity-0' : ''}`}>
          
          <img src={artist.coverImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="Cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          
          <div className="absolute bottom-0 p-8 w-full">
            <div className="flex items-center gap-4 mb-4">
              <img src={artist.profileImageUrl} className="w-20 h-20 rounded-2xl border-4 border-black object-cover" alt="Profile" />
              <div>
                <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">{artist.name}</h2>
                <p className="text-orange-500 font-bold text-[10px] uppercase tracking-widest">{artist.genre}</p>
              </div>
            </div>
            <p className="text-zinc-400 text-sm line-clamp-3 mb-6 font-medium leading-relaxed">{artist.bio}</p>
            <button onClick={() => router.push(`/artist/${artist.id}`)} className="w-full bg-white/10 backdrop-blur-md border border-white/20 py-4 rounded-2xl font-black uppercase text-xs hover:bg-white hover:text-black transition-all">View Full Profile</button>
          </div>
        </div>
      </div>

      <div className="flex gap-6 mt-10">
        <button onClick={() => handleSwipe('left')} className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center text-red-500 border border-white/5 hover:scale-110 active:scale-95 transition-all"><X size={32}/></button>
        <button onClick={() => handleSwipe('right')} className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-orange-600 shadow-xl shadow-orange-500/20 hover:scale-110 active:scale-95 transition-all"><Heart size={32} fill="currentColor"/></button>
      </div>
    </div>
  );
}