"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Play, MapPin, Loader2, Star, 
  Instagram, Music as MusicIcon, Youtube, Globe,
  Video as VideoIcon, Music2
} from "lucide-react";
import MediaPostCreator from "./MediaPostCreator";

interface ProfileProps {
  userId: string; 
}

export default function ArtistPublicProfile({ userId }: ProfileProps) {
  const [artist, setArtist] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    async function fetchArtistData() {
      setLoading(true);
      
      // 1. Get current logged in user to see if they own this profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id === userId) setIsOwner(true);

      // 2. Fetch Artist Info
      const { data: artistData } = await supabase
        .from('artists')
        .select('*')
        .eq('id', userId) 
        .single();

      // 3. Fetch Artist Posts (Media)
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('artist_id', userId)
        .order('created_at', { ascending: false });

      if (artistData) setArtist(artistData);
      if (postsData) setPosts(postsData);
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
      <div className="relative h-96">
        <img src={artist.coverImageUrl} className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
        
        <div className="absolute bottom-0 max-w-7xl mx-auto px-6 w-full flex flex-col md:flex-row items-center md:items-end gap-6 pb-10">
          <img src={artist.profileImageUrl} className="w-48 h-48 rounded-[2.5rem] border-8 border-zinc-950 shadow-2xl object-cover" />
          <div className="text-center md:text-left mb-4">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <h1 className="text-7xl font-black tracking-tighter uppercase italic leading-none">{artist.name}</h1>
              <Star className="text-orange-500 fill-orange-500" size={24} />
            </div>
            <p className="text-orange-500 font-black uppercase tracking-[0.3em] text-sm">{artist.genre} • Austin, TX</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column: Bio & Posts */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* MEDIA POST CREATOR (Only shows for owner) */}
          {isOwner && (
            <section className="animate-in fade-in slide-in-from-top-4 duration-700">
               <MediaPostCreator artistId={userId} />
            </section>
          )}

          <section>
            <h2 className="text-zinc-500 font-black uppercase tracking-widest text-xs mb-6">Latest Drops</h2>
            <div className="grid grid-cols-1 gap-6">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <div key={post.id} className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem] group">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      {post.media_type === 'video' ? <VideoIcon size={18} className="text-orange-500" /> : <Music2 size={18} className="text-orange-500" />}
                      {post.title}
                    </h3>
                    {post.media_type === 'video' ? (
                      <video controls className="w-full rounded-2xl border border-white/10 shadow-2xl">
                        <source src={post.media_url} type="video/mp4" />
                      </video>
                    ) : (
                      <audio controls className="w-full mt-2 custom-audio-player">
                        <source src={post.media_url} />
                      </audio>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-zinc-900/20 border border-dashed border-zinc-800 p-12 rounded-[2rem] text-center">
                  <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">No media posted yet.</p>
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-zinc-500 font-black uppercase tracking-widest text-xs mb-4">About</h2>
            <div className="bg-zinc-900/30 p-8 rounded-[2rem] border border-white/5">
              <p className="text-zinc-300 text-xl leading-relaxed italic">{artist.bio}</p>
            </div>
          </section>
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-6">
          <div className="bg-zinc-900/80 p-8 rounded-[2.5rem] border border-white/5 sticky top-24">
            <h3 className="text-zinc-500 font-black uppercase text-xs mb-6 tracking-widest">Connect</h3>
            
            <div className="space-y-4">
              {/* Display Social Links Dynamically */}
              {artist.instagram && (
                <a href={`https://instagram.com/${artist.instagram}`} target="_blank" className="flex items-center gap-4 text-zinc-300 hover:text-orange-500 transition-colors font-bold bg-black/40 p-4 rounded-2xl border border-white/5">
                  <Instagram size={20} /> Instagram
                </a>
              )}
              {artist.spotify && (
                <a href={artist.spotify} target="_blank" className="flex items-center gap-4 text-zinc-300 hover:text-green-500 transition-colors font-bold bg-black/40 p-4 rounded-2xl border border-white/5">
                  <MusicIcon size={20} /> Spotify
                </a>
              )}
              {artist.soundcloud && (
                <a href={`https://soundcloud.com/${artist.soundcloud}`} target="_blank" className="flex items-center gap-4 text-zinc-300 hover:text-orange-600 transition-colors font-bold bg-black/40 p-4 rounded-2xl border border-white/5">
                  <Globe size={20} /> SoundCloud
                </a>
              )}
              {artist.youtube && (
                <a href={artist.youtube} target="_blank" className="flex items-center gap-4 text-zinc-300 hover:text-red-500 transition-colors font-bold bg-black/40 p-4 rounded-2xl border border-white/5">
                  <Youtube size={20} /> YouTube
                </a>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
              <div className="flex items-center gap-3 text-zinc-400 text-sm">
                <MapPin size={16} className="text-orange-500" /> Based in Austin, TX
              </div>
              <div className="flex items-center gap-3 text-zinc-400 text-sm">
                <Star size={16} className="text-orange-500" fill="currentColor" /> UT Austin Verified
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}