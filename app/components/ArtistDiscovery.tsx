"use client";
import { useState, useEffect } from "react";
import { Heart, X, Music, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ArtistDiscovery() {
  const router = useRouter();
  const [artists, setArtists] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setArtists(data);
        setCurrentIndex(data.length - 1);
      }
      setLoading(false);
    }
    init();
  }, []);

  const handleSwipe = async (dir: 'left' | 'right') => {
  const currentArtist = artists[currentIndex];
  setDirection(dir);
  
  if (dir === 'right' && currentArtist?.id && currentUserId) {
    const { error } = await supabase
      .from('follows')
      .insert([{ 
        follower_id: currentUserId, 
        artist_id: currentArtist.id 
      }]);
    
    if (error) {
      // If it's a duplicate, just ignore it and log it
      if (error.code === '23505') {
        console.log("Already following this artist.");
      } else {
        console.error("Error saving follow:", error.message);
      }
    } else {
      console.log(`Successfully followed ${currentArtist.name}`);
    }
  }

  setTimeout(() => {
    setDirection(null);
    setCurrentIndex(prev => prev - 1);
  }, 400);
};

  if (loading) return <div className="min-h-screen bg-black flex flex-col items-center justify-center"><Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" /><p className="text-orange-500 font-black italic tracking-widest uppercase text-xs">Syncing Stampede...</p></div>;
  if (currentIndex < 0) return <div className="min-h-screen bg-black flex flex-col items-center justify-center text-zinc-500 font-bold uppercase tracking-widest gap-4"><Music size={40} className="text-zinc-800" /><p>No more artists in Austin today.</p><button onClick={() => window.location.reload()} className="text-orange-500 text-xs mt-4 underline">Refresh Feed</button></div>;

  const artist = artists[currentIndex];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-10 px-4">
      <h1 className="text-4xl font-black italic text-orange-500 mb-8 tracking-tighter uppercase">Discover</h1>
      
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