"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Instagram, Music, Youtube, Globe, Calendar, 
  MapPin, Heart, Check, PlayCircle, Headphones,
  ExternalLink, Loader2
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
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setCurrentLoggedInId(user.id);

        const { data: art } = await supabase.from('artists').select('*').eq('id', userId).single();
        const { data: pst } = await supabase.from('posts').select('*').eq('artist_id', userId).order('created_at', { ascending: false });
        const { data: evt } = await supabase.from('events').select('*').eq('artist_id', userId).order('event_date', { ascending: true });

        setArtist(art);
        setPosts(pst || []);
        setEvents(evt || []);

        if (user) {
          const { data: follow } = await supabase.from('follows').select('*').eq('follower_id', user.id).eq('artist_id', userId).single();
          if (follow) setIsFollowing(true);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
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

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" size={40} /></div>;
  if (!artist) return <div className="p-20 text-center text-zinc-500 font-black uppercase tracking-widest italic">Artist not found.</div>;

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      <div className="h-[40vh] relative overflow-hidden">
        <img src={artist.coverImageUrl || "https://images.unsplash.com/photo-1501386761578-eac5c94b800a"} className="w-full h-full object-cover opacity-60" alt="cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className="flex flex-col md:flex-row items-end gap-6">
            <img src={artist.profileImageUrl} className="w-40 h-40 rounded-[2.5rem] border-8 border-black shadow-2xl object-cover bg-zinc-900" alt="profile" />
            <div className="pb-2">
              <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">{artist.name}</h1>
              <p className="text-orange-500 font-bold uppercase tracking-[0.4em] text-xs mt-4">{artist.genre}</p>
            </div>
          </div>
          
          {currentLoggedInId !== userId && (
            <button onClick={toggleFollow} className={`px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3 transition-all transform active:scale-95 ${isFollowing ? 'bg-zinc-800 text-zinc-400 border border-white/5' : 'bg-white text-black hover:bg-orange-500 hover:text-white shadow-xl'}`}>
              {isFollowing ? <Check size={18}/> : <Heart size={18}/>}
              {isFollowing ? 'Profile Liked' : 'Like Artist'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h3 className="text-zinc-500 font-black uppercase text-[10px] tracking-[0.3em] mb-4 italic">The Narrative</h3>
              <p className="text-zinc-400 leading-relaxed font-medium">{artist.bio}</p>
            </div>

            <div>
              <h3 className="text-orange-500 font-black uppercase text-[10px] tracking-[0.3em] mb-6 italic">Upcoming Shows</h3>
              {events.length === 0 ? <p className="text-zinc-700 text-xs font-bold uppercase italic tracking-widest">No scheduled appearances.</p> : (
                <div className="space-y-6">
                  {events.map(event => (
                    <div key={event.id} className="bg-zinc-900/40 p-6 rounded-[2rem] border border-white/5 flex justify-between items-center group hover:border-orange-500/50 transition-all">
                      <div>
                        <p className="font-black italic uppercase text-xl leading-none mb-2">{event.name}</p>
                        <span className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest"><MapPin size={14} className="text-orange-500"/> {event.location}</span>
                      </div>
                      <div className="bg-orange-600 rounded-2xl p-3 flex flex-col items-center min-w-[70px] shadow-lg shadow-orange-900/40">
                         <span className="text-[10px] font-black uppercase text-orange-200 opacity-80">2026</span>
                         <span className="text-xl font-black text-white leading-none">{event.event_date.split('-')[2] || '??'}</span>
                      </div>
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
               <div className="grid grid-cols-1 gap-8">
                 {posts.map(post => (
                   <div key={post.id} className="bg-zinc-900/30 rounded-[2.5rem] border border-white/5 overflow-hidden group hover:border-orange-500/30 transition-all">
                     
                     <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                       {post.media_type === 'video' ? (
                         <video 
                           src={post.media_url} 
                           controls 
                           className="w-full h-full object-contain"
                           poster={artist.coverImageUrl}
                         />
                       ) : (
                         <div className="flex flex-col items-center gap-4">
                           <Headphones size={48} className="text-orange-500 animate-pulse" />
                           <a href={post.media_url} target="_blank" className="px-6 py-2 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all">
                             Open Audio Link
                           </a>
                         </div>
                       )}
                     </div>

                     <div className="p-6 flex items-center justify-between bg-gradient-to-b from-zinc-900/50 to-black">
                       <div>
                         <p className="text-lg font-black italic uppercase tracking-tight leading-none mb-1">{post.title}</p>
                         <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest flex items-center gap-2">
                           {post.media_type === 'video' ? <PlayCircle size={12}/> : <Music size={12}/>}
                           {post.media_type}
                         </p>
                       </div>
                       <a href={post.media_url} target="_blank" className="p-4 bg-zinc-800 rounded-2xl text-white hover:text-orange-500 transition-all">
                         <ExternalLink size={18} />
                       </a>
                     </div>
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