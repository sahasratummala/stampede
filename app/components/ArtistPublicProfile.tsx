"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Instagram, 
  Music, 
  Youtube, 
  Globe, 
  Calendar, 
  MapPin, 
  Heart, 
  Check, 
  PlayCircle, 
  Headphones,
  ExternalLink,
  Loader2
} from "lucide-react";

export default function ArtistPublicProfile({ userId }: { userId: string }) {
  const [artist, setArtist] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentLoggedInId, setCurrentLoggedInId] = useState<string | null>(null);

  useEffect(() => {
    async function loadFullProfile() {
      try {
        setLoading(true);
        
        // 1. Fetch Current User
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setCurrentLoggedInId(user.id);

        // 2. Fetch Artist Metadata
        const { data: art } = await supabase
          .from('artists')
          .select('*')
          .eq('id', userId)
          .single();
        
        // 3. Fetch Media Posts
        const { data: pst } = await supabase
          .from('posts')
          .select('*')
          .eq('artist_id', userId)
          .order('created_at', { ascending: false });

        // 4. Fetch Upcoming Shows
        const { data: evt } = await supabase
          .from('events')
          .select('*')
          .eq('artist_id', userId)
          .order('event_date', { ascending: true });

        setArtist(art);
        setPosts(pst || []);
        setEvents(evt || []);

        // 5. Check if current user likes this artist
        if (user) {
          const { data: follow } = await supabase
            .from('follows')
            .select('*')
            .eq('follower_id', user.id)
            .eq('artist_id', userId)
            .single();
          if (follow) setIsFollowing(true);
        }
      } catch (err) {
        console.error("Profile Load Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFullProfile();
  }, [userId]);

  const toggleFollow = async () => {
    if (!currentLoggedInId) return alert("Login to save artists!");

    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', currentLoggedInId).eq('artist_id', userId);
      setIsFollowing(false);
    } else {
      await supabase.from('follows').insert([{ follower_id: currentLoggedInId, artist_id: userId }]);
      setIsFollowing(true);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="animate-spin text-orange-500" size={40} />
    </div>
  );

  if (!artist) return <div className="p-20 text-center text-zinc-500 font-black uppercase tracking-widest">Artist not found.</div>;

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      {/* HERO HEADER */}
      <div className="h-[40vh] relative overflow-hidden">
        <img 
          src={artist.coverImageUrl || "https://images.unsplash.com/photo-1501386761578-eac5c94b800a"} 
          className="w-full h-full object-cover opacity-60" 
          alt="cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className="flex flex-col md:flex-row items-end gap-6">
            <img 
              src={artist.profileImageUrl} 
              className="w-40 h-40 rounded-[2.5rem] border-8 border-black shadow-2xl object-cover bg-zinc-900" 
              alt="profile"
            />
            <div className="pb-2">
              <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">{artist.name}</h1>
              <p className="text-orange-500 font-bold uppercase tracking-[0.4em] text-xs mt-4">{artist.genre}</p>
            </div>
          </div>
          
          {/* BUTTON WRAPPING FIX: Hide if it is the artist's own profile */}
          {currentLoggedInId !== userId && (
            <button 
              onClick={toggleFollow}
              className={`px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3 transition-all transform active:scale-95 ${
                isFollowing ? 'bg-zinc-800 text-zinc-400 border border-white/5' : 'bg-white text-black hover:bg-orange-500 hover:text-white shadow-xl'
              }`}
            >
              {isFollowing ? <Check size={18}/> : <Heart size={18}/>}
              {isFollowing ? 'Profile Liked' : 'Like Artist'}
            </button>
          )}
        </div>

        {/* SOCIAL HANDLES */}
        <div className="flex flex-wrap gap-4 mb-16">
          {artist.instagram && (
            <a href={artist.instagram.startsWith('http') ? artist.instagram : `https://instagram.com/${artist.instagram.replace('@','')}`} target="_blank" className="bg-zinc-900 border border-white/5 p-5 rounded-3xl hover:border-pink-500 transition-all group">
              <Instagram size={24} className="group-hover:text-pink-500" />
            </a>
          )}
          {artist.spotify && (
            <a href={artist.spotify} target="_blank" className="bg-zinc-900 border border-white/5 p-5 rounded-3xl hover:border-green-500 transition-all group">
              <Music size={24} className="group-hover:text-green-500" />
            </a>
          )}
          {artist.soundcloud && (
            <a href={artist.soundcloud} target="_blank" className="bg-zinc-900 border border-white/5 p-5 rounded-3xl hover:border-orange-500 transition-all group">
              <Globe size={24} className="group-hover:text-orange-500" />
            </a>
          )}
          {artist.youtube && (
            <a href={artist.youtube} target="_blank" className="bg-zinc-900 border border-white/5 p-5 rounded-3xl hover:border-red-500 transition-all group">
              <Youtube size={24} className="group-hover:text-red-500" />
            </a>
          )}
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h3 className="text-zinc-500 font-black uppercase text-[10px] tracking-[0.3em] mb-4 italic">The Narrative</h3>
              <p className="text-zinc-400 leading-relaxed font-medium">{artist.bio}</p>
            </div>

            <div>
              <h3 className="text-orange-500 font-black uppercase text-[10px] tracking-[0.3em] mb-6 italic">Upcoming Shows</h3>
              {events.length === 0 ? (
                <p className="text-zinc-700 text-xs font-bold uppercase italic tracking-widest">No scheduled appearances.</p>
              ) : (
                <div className="space-y-4">
                  {events.map(event => (
                    <div key={event.id} className="bg-zinc-900/40 p-6 rounded-[2rem] border border-white/5 relative z-0">
                      <p className="font-black italic uppercase text-xl leading-none mb-3">{event.name}</p>
                      <div className="flex flex-col gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-2"><Calendar size={14} className="text-orange-500"/> {event.event_date}</span>
                        <span className="flex items-center gap-2"><MapPin size={14} className="text-orange-500"/> {event.location}</span>
                      </div>
                      {event.message && <p className="mt-4 pt-4 border-t border-white/5 text-zinc-400 text-[11px] italic">"{event.message}"</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-orange-500 font-black uppercase text-[10px] tracking-[0.3em] mb-6 italic">Latest Drops</h3>
            {posts.length === 0 ? (
              <div className="h-64 border-2 border-dashed border-zinc-900 rounded-[3rem] flex items-center justify-center">
                <p className="text-zinc-700 text-xs font-black uppercase">No media deployed.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {posts.map(post => (
                  <div key={post.id} className="flex items-center gap-6 bg-zinc-900/30 p-6 rounded-[2.5rem] border border-white/5 hover:bg-zinc-900 transition-all group">
                    <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-orange-500 shadow-inner group-hover:scale-110 transition-transform">
                      {post.media_type === 'video' ? <PlayCircle size={32} /> : <Headphones size={32} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-black italic uppercase tracking-tight leading-none mb-1">{post.title}</p>
                      <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{post.media_type}</p>
                    </div>
                    <a href={post.media_url} target="_blank" className="p-4 bg-orange-600 rounded-2xl text-white hover:bg-orange-500 transition-all shadow-lg shadow-orange-600/20">
                      <ExternalLink size={20} />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}