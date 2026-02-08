"use client";
import { useState, useEffect } from "react";
import { Heart, X, Music, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ArtistDiscovery() {
  const router = useRouter();
  const [artists, setArtists] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [isAiSorting, setIsAiSorting] = useState(false);
  const [direction, setDirection] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      const { data: listenerData } = await supabase.from('listeners').select('*').eq('id', user?.id).single();
      const { data: allArtists } = await supabase.from('artists').select('*');

      if (allArtists && listenerData) {
        setIsAiSorting(true);
        try {
          const response = await fetch("/api/recommend", {
            method: "POST",
            body: JSON.stringify({ listener: listenerData, artists: allArtists }),
          });
          
          const data = await response.json();
          const rawText = data.text || "";
          let rankedIds: string[] = [];

          if (rawText) {
            try {
              const cleaned = rawText.replace(/```json|```/g, "").trim();
              const parsed = JSON.parse(cleaned);
              rankedIds = Array.isArray(parsed) ? parsed : [];
            } catch (e) {
              rankedIds = rawText.split(',').map((s: string) => s.trim());
            }
          }

          const sortedArtists = [...allArtists].sort((a, b) => {
            const indexA = rankedIds.indexOf(a.id);
            const indexB = rankedIds.indexOf(b.id);
            const posA = indexA === -1 ? 999 : indexA;
            const posB = indexB === -1 ? 999 : indexB;
            return posA - posB;
          });

          const reversed = sortedArtists.reverse();
          setArtists(reversed);
          setCurrentIndex(reversed.length - 1);
        } catch (err) {
          console.error("Discovery Error:", err);
          setArtists(allArtists);
          setCurrentIndex(allArtists.length - 1);
        }
      }
      setIsAiSorting(false);
      setLoading(false);
    }
    init();
  }, []);

  const handleSwipe = async (dir: 'left' | 'right') => {
    if (currentIndex < 0) return;
    const currentArtist = artists[currentIndex];
    setDirection(dir);

    if (dir === 'right' && currentArtist?.id && currentUserId) {
      await supabase.from('follows').insert([{ follower_id: currentUserId, artist_id: currentArtist.id }]);
    }

    setTimeout(() => {
      setDirection(null);
      setCurrentIndex(prev => prev - 1);
    }, 400);
  };

  if (loading || isAiSorting) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center transition-colors duration-300">
      <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
      <div className="flex items-center gap-2">
        <Sparkles className="text-accent animate-pulse" size={16} />
        <p className="text-accent font-black italic tracking-widest uppercase text-xs">
          {isAiSorting ? "AI Ranking Your Vibe..." : "Syncing Stampede..."}
        </p>
      </div>
    </div>
  );

  if (currentIndex < 0 || !artists[currentIndex]) return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center text-muted font-bold uppercase tracking-widest gap-4 transition-colors duration-300">
      <Music size={40} className="text-muted opacity-30" />
      <p>No more artists in Austin today.</p>
      <button onClick={() => window.location.reload()} className="text-accent text-xs underline hover:brightness-110">Refresh</button>
    </div>
  );

  const artist = artists[currentIndex];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-10 px-4 transition-colors duration-300">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-4xl font-black italic text-accent tracking-tighter uppercase leading-none">Discover</h1>
        <div className="flex items-center gap-1 mt-2">
            <Sparkles size={10} className="text-muted" />
            <span className="text-[8px] text-muted font-black uppercase tracking-[0.3em]">AI Personalization Active</span>
        </div>
      </div>
      
      <div className="relative w-full max-w-[400px] h-[600px]">
        <div key={artist.id} className={`absolute inset-0 bg-card rounded-[3rem] overflow-hidden border border-border transition-all duration-500 transform 
          ${direction === 'left' ? '-translate-x-[150%] rotate-[-20deg] opacity-0' : direction === 'right' ? 'translate-x-[150%] rotate-[20deg] opacity-0' : ''}`}>
          
          <img src={artist.coverImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          
          <div className="absolute bottom-0 p-8 w-full">
            <div className="flex items-center gap-4 mb-4">
              <img src={artist.profileImageUrl} className="w-20 h-20 rounded-2xl border-4 border-background object-cover bg-card" alt="" />
              <div>
                <h2 className="text-3xl font-black tracking-tighter uppercase leading-none text-foreground">{artist.name}</h2>
                <p className="text-accent font-bold text-[10px] uppercase tracking-widest">{artist.genre}</p>
              </div>
            </div>
            <p className="text-muted text-sm line-clamp-3 mb-6 font-medium leading-relaxed">{artist.bio}</p>
            <button onClick={() => router.push(`/artist/${artist.id}`)} className="w-full bg-foreground/10 backdrop-blur-md border border-border py-4 rounded-2xl font-black uppercase text-xs hover:bg-foreground hover:text-background transition-all">View Full Profile</button>
          </div>
        </div>
      </div>

<div className="flex gap-6 mt-10">
  {/* Pass / Skip Button */}
  <button 
    onClick={() => handleSwipe('left')} 
    className="w-20 h-20 bg-card rounded-full flex items-center justify-center text-muted border border-border hover:text-red-500 hover:border-red-500/30 transition-all shadow-lg"
  >
    <X size={32}/>
  </button>

  {/* Like / Heart Button - NOW MATCHES SKIP BUTTON STYLE */}
  <button 
    onClick={() => handleSwipe('right')} 
    className="w-20 h-20 bg-card rounded-full flex items-center justify-center text-accent border border-border hover:border-accent/50 hover:shadow-xl hover:shadow-accent/10 transition-all active:scale-95"
  >
    <Heart size={32} fill="currentColor"/>
  </button>
</div>
    </div>
  );
}
