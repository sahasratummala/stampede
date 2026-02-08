"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Loader2, 
  User, 
  LogOut, 
  Pencil, 
  LayoutDashboard, 
  ChevronDown, 
  ChevronUp, 
  Music,
  Calendar // Added icon for events
} from "lucide-react";
import { useRouter } from "next/navigation";

import ArtistProfileCreator from "../components/ArtistProfileCreator"; 
import ArtistPublicProfile from "../components/ArtistPublicProfile";
import ListenerSetupForm from "../components/ListenerSetupForm";
import MediaPostCreator from "../components/MediaPostCreator";
import EventCreator from "../components/EventCreator"; // Restored Import

export default function SmartProfile() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false); 
  
  const [followedArtists, setFollowedArtists] = useState<any[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const router = useRouter();

  const checkUser = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push("/login");
      return;
    }
    setUser(user);

    const { data: userProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!userProfile) {
      router.push("/onboarding/role");
      return;
    }
    setRole(userProfile.role);

    const table = userProfile.role === "artist" ? "artists" : "listeners";
    const { data: existingData } = await supabase
      .from(table)
      .select("*")
      .eq("id", user.id)
      .single();

    if (existingData) {
      setHasProfile(true);
      setProfileData(existingData);
      
      if (userProfile.role === "listener") {
        await fetchFollowedArtists(user.id);
      }
    }
    setLoading(false);
  };

  const fetchFollowedArtists = async (userId: string) => {
    try {
      const { data: follows, error: followError } = await supabase
        .from('follows')
        .select('artist_id')
        .eq('follower_id', userId);

      if (followError) throw followError;

      if (follows && follows.length > 0) {
        const artistIds = follows.map(f => f.artist_id);
        const { data: artists, error: artistError } = await supabase
          .from('artists')
          .select('id, name, profileImageUrl, genre')
          .in('id', artistIds);

        if (artistError) throw artistError;
        setFollowedArtists(artists || []);
      }
    } catch (err) {
      console.error("Error fetching followed artists:", err);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-orange-500 w-12 h-12" />
      <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-4">Syncing...</p>
    </div>
  );

  if (role === "artist") {
    if (isEditing) {
      return (
        <ArtistProfileCreator 
          initialData={profileData} 
          onComplete={() => {
            setIsEditing(false);
            checkUser(); 
          }} 
        />
      );
    }

    return hasProfile ? (
      <div className="relative bg-black min-h-screen overflow-x-hidden">
         <section className="relative z-0 border-b border-white/5 pb-16">
            <ArtistPublicProfile userId={user.id} /> 
         </section>
         
         <section className="max-w-4xl mx-auto px-6 py-24 relative z-10 bg-black">
            <div className="flex items-center gap-4 mb-10">
               <div className="bg-orange-600 p-3 rounded-2xl shadow-lg shadow-orange-600/20">
                  <LayoutDashboard size={24} className="text-white" />
               </div>
               <div>
                  <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-white">Artist Studio</h2>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Manage your herd's content</p>
               </div>
            </div>
            
            {/* STUDIO TOOLS */}
            <div className="grid grid-cols-1 gap-12">
               <MediaPostCreator artistId={user.id} />
               
               <div className="border-t border-white/5 pt-12">
                  <div className="flex items-center gap-3 mb-6">
                    <Calendar className="text-orange-500" size={20} />
                    <h3 className="text-xl font-black italic uppercase text-white">Tour Dates</h3>
                  </div>
                  <EventCreator artistId={user.id} />
               </div>
            </div>
         </section>

         <div className="fixed top-6 right-6 z-[100] flex items-center gap-3">
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-white text-black p-4 rounded-full hover:bg-orange-500 hover:text-white transition-all shadow-2xl flex items-center justify-center"
            >
              <Pencil size={20} />
            </button>
            <button 
              onClick={handleSignOut} 
              className="bg-zinc-900/80 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10 text-white text-[10px] font-black tracking-widest hover:bg-red-600 transition-all uppercase"
            >
              Logout
            </button>
         </div>
      </div>
    ) : (
      <ArtistProfileCreator onComplete={checkUser} />
    );
  }

  if (role === "listener") {
    return hasProfile ? (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-zinc-950 rounded-[3.5rem] p-12 border border-white/5 relative shadow-2xl">
          <button onClick={handleSignOut} className="absolute top-10 right-10 text-zinc-600 hover:text-white transition-colors">
            <LogOut size={24} />
          </button>
          
          <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl shadow-orange-600/20">
            <User size={48} className="text-white" />
          </div>
          
          <h1 className="text-6xl font-black italic uppercase tracking-tighter mb-2">{profileData.name}</h1>
          <p className="text-orange-500 font-bold uppercase tracking-[0.3em] text-xs mb-6">{profileData.major}</p>
          <p className="text-zinc-400 text-xl leading-relaxed mb-10 font-medium italic opacity-80">{profileData.bio}</p>
          
          <div className="mb-10 bg-black/40 rounded-3xl border border-white/5 overflow-hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-900/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Music size={14} className="text-orange-500" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Your Liked Artists ({followedArtists.length})
                </span>
              </div>
              {isMenuOpen ? <ChevronUp size={16} className="text-zinc-600" /> : <ChevronDown size={16} className="text-zinc-600" />}
            </button>

            {isMenuOpen && (
              <div className="px-4 pb-4 max-h-60 overflow-y-auto custom-scrollbar">
                {followedArtists.length === 0 ? (
                  <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest p-4 text-center">No artists liked yet.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {followedArtists.map((artist) => (
                      <div 
                        key={artist.id}
                        onClick={() => router.push(`/artist/${artist.id}`)}
                        className="flex items-center gap-4 p-3 bg-zinc-900/50 rounded-2xl border border-white/5 hover:border-orange-500/50 transition-all cursor-pointer group"
                      >
                        <img 
                          src={artist.profileImageUrl} 
                          className="w-10 h-10 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all" 
                          alt="" 
                        />
                        <div className="flex-1">
                          <p className="text-xs font-black uppercase tracking-tight group-hover:text-orange-500 transition-colors">{artist.name}</p>
                          <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">{artist.genre}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button 
            onClick={() => router.push("/discover")}
            className="w-full bg-white text-black font-black py-5 rounded-[2rem] hover:bg-orange-500 hover:text-white transition-all uppercase italic text-2xl tracking-tight shadow-xl shadow-white/5"
          >
            Start Discovering
          </button>
        </div>
      </div>
    ) : (
      <ListenerSetupForm onComplete={checkUser} />
    );
  }

  return null;
}