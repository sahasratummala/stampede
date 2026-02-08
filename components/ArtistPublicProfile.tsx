"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Instagram, Music, Youtube, Globe, Calendar, 
  MapPin, Heart, Check, PlayCircle, Headphones,
  ExternalLink, Loader2, Clock
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

  const getMonthName = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center transition-colors duration-300"><Loader2 className="animate-spin text-accent" size={40} /></div>;
  if (!artist) return <div className="p-20 text-center text-muted font-black uppercase tracking-widest italic">Artist not found.</div>;

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 transition-colors duration-300">
      <div className="h-[40vh] relative overflow-hidden">
        <img src={artist.coverImageUrl || "https://images.unsplash.com/photo-1501386761578-eac5c94b800a"} className="w-full h-full object-cover opacity-60" alt="cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className="flex flex-col md:flex-row items-end gap-6">
            <img src={artist.profileImageUrl} className="w-40 h-40 rounded-[2.5rem] border-8 border-background shadow-2xl object-cover bg-card" alt="profile" />
            <div className="pb-2">
              <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">{artist.name}</h1>
              <p className="text-accent font-bold uppercase tracking-[0.4em] text-xs mt-4">{artist.genre}</p>
            </div>
          </div>
          
          {currentLoggedInId !== userId && (
            <button onClick={toggleFollow} className={`px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3 transition-all transform active:scale-95 ${isFollowing ? 'bg-card text-muted border border-border' : 'bg-foreground text-background hover:bg-accent hover:text-white shadow-xl'}`}>
              {isFollowing ? <Check size={18}/> : <Heart size={18}/>}
              {isFollowing ? 'Profile Liked' : 'Like Artist'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h3 className="text-muted font-black uppercase text-[10px] tracking-[0.3em] mb-4 italic">The Narrative</h3>
              <p className="text-muted leading-relaxed font-medium">{artist.bio}</p>
            </div>

            <div>
              <h3 className="text-accent font-black uppercase text-[10px] tracking-[0.3em] mb-6 italic">Upcoming Shows</h3>
              {events.length === 0 ? <p className="text-muted text-xs font-bold uppercase italic tracking-widest opacity-50">No scheduled appearances.</p> : (
                <div className="space-y-6">
                  {events.map(event => (
                    <div key={event.id} className="bg-card p-6 rounded-[2rem] border border-border flex flex-col gap-4 group hover:border-accent transition-all">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-black italic uppercase text-xl leading-none mb-2">{event.name}</p>
                          <span className="flex flex-wrap items-center gap-2 text-[10px] text-muted font-bold uppercase tracking-widest">
                            <MapPin size={14} className="text-accent"/> {event.location}
                            {event.event_time && (
                              <span className="flex items-center gap-1 ml-2">
                                <Clock size={12} className="text-muted" /> {event.event_time}
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="bg-accent rounded-2xl p-3 flex flex-col items-center min-w-[70px] shadow-lg shadow-accent/40">
                           <span className="text-[10px] font-black uppercase text-white/80">{getMonthName(event.event_date)}</span>
                           <span className="text-xl font-black text-white leading-none">{event.event_date.split('-')[2]}</span>
                        </div>
                      </div>
                      
                      {event.message && (
                        <p className="text-[10px] text-muted font-medium border-t border-border pt-3 italic leading-relaxed">
                          "{event.message}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
             <h3 className="text-accent font-black uppercase text-[10px] tracking-[0.3em] mb-6 italic">Latest Drops</h3>
             {posts.length === 0 ? (
               <div className="h-64 border-2 border-dashed border-border rounded-[3rem] flex items-center justify-center">
                 <p className="text-muted text-xs font-black uppercase opacity-50">No media deployed.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 gap-8">
                 {posts.map(post => (
                   <div key={post.id} className="bg-card rounded-[2.5rem] border border-border overflow-hidden group hover:border-accent transition-all">
                     
                     <div className="relative aspect-video bg-background flex items-center justify-center overflow-hidden">
                       {post.media_type === 'video' ? (
                         <video 
                           src={post.media_url} 
                           controls 
                           className="w-full h-full object-contain"
                           poster={artist.coverImageUrl}
                         />
                       ) : (
                         <div className="flex flex-col items-center gap-4">
                           <Headphones size={48} className="text-accent animate-pulse" />
                           <a href={post.media_url} target="_blank" className="px-6 py-2 bg-foreground text-background rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-accent hover:text-white transition-all">
                             Open Audio Link
                           </a>
                         </div>
                       )}
                     </div>

                     <div className="p-6 flex items-center justify-between bg-gradient-to-b from-card to-background">
                       <div>
                         <p className="text-lg font-black italic uppercase tracking-tight leading-none mb-1">{post.title}</p>
                         <p className="text-[10px] text-muted font-bold uppercase tracking-widest flex items-center gap-2">
                           {post.media_type === 'video' ? <PlayCircle size={12}/> : <Music size={12}/>}
                           {post.media_type}
                         </p>
                       </div>
                       <a href={post.media_url} target="_blank" className="p-4 bg-card rounded-2xl text-foreground hover:text-accent transition-all">
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
