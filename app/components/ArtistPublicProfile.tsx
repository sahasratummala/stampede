"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Play, Heart, Bell, BellOff, Share2, 
  MapPin, Calendar, Loader2, Star 
} from "lucide-react";

interface ProfileProps {
  userId: string; // This prop makes it "Smart"
}

export default function ArtistPublicProfile({ userId }: ProfileProps) {
  const [artist, setArtist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    async function fetchArtistData() {
      setLoading(true);
      // Fetch only the profile belonging to the passed userId
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .eq('id', userId) 
        .single();

      if (!error) setArtist(data);
      setLoading(false);
    }
    fetchArtistData();
  }, [userId]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
    </div>
  );

  if (!artist) return <div className="p-20 text-center text-zinc-500">Profile not found.</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      {/* Hero Section */}
      <div className="relative h-80">
        <img 
          src={artist.coverImageUrl} 
          className="w-full h-full object-cover opacity-60" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
        
        <div className="absolute bottom-0 max-w-7xl mx-auto px-6 w-full flex items-end gap-6 pb-6">
          <img 
            src={artist.profileImageUrl} 
            className="w-40 h-40 rounded-2xl border-4 border-black shadow-2xl object-cover" 
          />
          <div className="mb-2">
            <h1 className="text-6xl font-black tracking-tighter uppercase italic">{artist.name}</h1>
            <p className="text-orange-500 font-bold uppercase tracking-widest text-sm">{artist.genre}</p>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-zinc-500 font-black uppercase tracking-widest text-xs mb-4">About</h2>
            <div className="bg-zinc-900/50 p-8 rounded-[2rem] border border-white/5">
              <p className="text-zinc-300 text-xl leading-relaxed">{artist.bio}</p>
            </div>
          </section>
          
          {/* Add a "Create Posting" button only if viewing own profile */}
          <section className="pt-4">
             <button className="bg-orange-600 hover:bg-orange-500 text-white font-black px-6 py-4 rounded-2xl flex items-center gap-2 transition-all">
                <Calendar size={20} />
                CREATE NEW POSTING / SHOW
             </button>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900/80 p-6 rounded-[2rem] border border-white/5">
            <h3 className="text-zinc-500 font-black uppercase text-xs mb-4 tracking-widest">Artist Details</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-zinc-300 font-bold">
                <MapPin className="text-orange-500" size={18} /> Austin, TX
              </div>
              <div className="flex items-center gap-3 text-zinc-300 font-bold">
                <Star className="text-orange-500" size={18} fill="currentColor" /> Verified UT Artist
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}