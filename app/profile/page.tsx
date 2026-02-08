"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, User, LogOut, Pencil, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";

import ArtistProfileCreator from "../components/ArtistProfileCreator"; 
import ArtistPublicProfile from "../components/ArtistPublicProfile";
import ListenerSetupForm from "../components/ListenerSetupForm";
import MediaPostCreator from "../components/MediaPostCreator";

export default function SmartProfile() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false); 
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
    }
    setLoading(false);
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

  // --- ARTIST VIEW ---
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
         {/* SECTION 1: PUBLIC PREVIEW */}
         <section className="relative z-0 border-b border-white/5 pb-16">
            <ArtistPublicProfile userId={user.id} /> 
         </section>
         
         {/* SECTION 2: ARTIST STUDIO (DASHBOARD) */}
         <section className="max-w-4xl mx-auto px-6 py-24 relative z-10 bg-black">
            <div className="flex items-center gap-4 mb-10">
               <div className="bg-orange-600 p-3 rounded-2xl shadow-lg shadow-orange-600/20">
                  <LayoutDashboard size={24} className="text-white" />
               </div>
               <div>
                  <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Artist Studio</h2>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Manage your herd's content</p>
               </div>
            </div>
            
            <MediaPostCreator artistId={user.id} />
         </section>

         {/* FIXED CONTROLS */}
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

  // --- LISTENER VIEW ---
  if (role === "listener") {
    return hasProfile ? (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-zinc-950 rounded-[3.5rem] p-12 border border-white/5 relative shadow-2xl">
          <button onClick={handleSignOut} className="absolute top-10 right-10 text-zinc-600 hover:text-white transition-colors"><LogOut size={24} /></button>
          
          <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl shadow-orange-600/20">
            <User size={48} className="text-white" />
          </div>
          
          <h1 className="text-6xl font-black italic uppercase tracking-tighter mb-2">{profileData.name}</h1>
          <p className="text-orange-500 font-bold uppercase tracking-[0.3em] text-xs mb-8">{profileData.major}</p>
          <p className="text-zinc-400 text-xl leading-relaxed mb-10 font-medium">{profileData.bio}</p>
          
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