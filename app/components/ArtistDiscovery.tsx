"use client";
import { useState, useEffect } from "react";
import { Heart, X, Music, MapPin, Star, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase"; // Your new Supabase client
import { useRouter } from "next/navigation";

export default function ArtistDiscovery() {
  const router = useRouter();
  const [artists, setArtists] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState<string | null>(null);

  // 1. Fetch from Supabase instead of Firebase
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const { data, error } = await supabase
          .from('artists')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setArtists(data || []);
        setCurrentIndex((data?.length || 1) - 1);
        setLoading(false);
      } catch (error) {
        console.error("Supabase Error:", error);
        setLoading(false);
      }
    };
    fetchArtists();
  }, []);

  const handleSwipe = async (dir: 'left' | 'right') => {
    setDirection(dir);
    
    // If Liked (Right), we could add logic here to update a "likes" count in Supabase
    if (dir === 'right') {
      const currentArtist = artists[currentIndex];
      console.log("Liked:", currentArtist.name);
      // Optional: Add a 'likes' increment logic here later
    }

    // Move to next card after animation
    setTimeout(() => {
      setDirection(null);
      setCurrentIndex(prev => prev - 1);
    }, 300);
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
      <p className="text-zinc-500 font-bold tracking-widest uppercase text-xs">Loading the Stampede...</p>
    </div>
  );

  const currentArtist = artists[currentIndex];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden flex flex-col items-center py-10">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-black bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent italic">
          DISCOVER
        </h1>
        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-bold">UT Austin Music Scene</p>
      </header>

      {/* Card Deck */}
      <div className="relative w-[90vw] max-w-[400px] h-[600px]">
        {currentIndex >= 0 ? (
          <div 
            className={`absolute inset-0 bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl transition-all duration-300 transform 
              ${direction === 'left' ? '-translate-x-[150%] rotate-[-20deg] opacity-0' : ''}
              ${direction === 'right' ? 'translate-x-[150%] rotate-[20deg] opacity-0' : ''}
            `}
          >
            {/* Cover Image */}
            <img 
              src={currentArtist.coverImageUrl || "https://images.unsplash.com/photo-1493225255756-d9584f8606e9"} 
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

            {/* Profile Content */}
            <div className="absolute bottom-0 w-full p-8 space-y-4">
              <div className="flex items-center gap-4">
                <img src={currentArtist.profileImageUrl} className="w-20 h-20 rounded-2xl border-4 border-black shadow-xl object-cover" />
                <div>
                  <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">{currentArtist.name}</h2>
                  <span className="text-orange-500 font-bold text-xs uppercase tracking-widest">{currentArtist.genre}</span>
                </div>
              </div>
              
              <p className="text-zinc-300 text-sm line-clamp-3 font-medium leading-relaxed">
                {currentArtist.bio}
              </p>

              <div className="flex items-center gap-4 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                <span className="flex items-center gap-1"><MapPin size={12}/> Austin</span>
                <span className="flex items-center gap-1"><Star size={12} fill="currentColor"/> Pro Artist</span>
              </div>

              <button 
                onClick={() => router.push(`/artist/${currentArtist.id}`)}
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all"
              >
                View Full Profile
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-10">
            <Music className="text-zinc-800 w-20 h-20 mb-4" />
            <h2 className="text-2xl font-bold">The herd has passed.</h2>
            <p className="text-zinc-500 text-sm mb-6">You've seen all the artists for today!</p>
            <button onClick={() => window.location.reload()} className="text-orange-500 font-bold uppercase tracking-widest text-xs">Start Over</button>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex gap-6 mt-10">
        <button 
          onClick={() => handleSwipe('left')}
          className="w-20 h-20 bg-zinc-900 border border-white/5 rounded-full flex items-center justify-center text-red-500 hover:scale-110 active:scale-95 transition-all shadow-xl"
        >
          <X size={32} />
        </button>
        <button 
          onClick={() => handleSwipe('right')}
          className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-orange-600 hover:scale-110 active:scale-95 transition-all shadow-xl shadow-orange-500/20"
        >
          <Heart size={32} fill="currentColor" />
        </button>
      </div>
    </div>
  );
}