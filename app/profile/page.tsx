"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, User, LogOut, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

import ArtistProfileCreator from "../components/ArtistProfileCreator"; 
import ArtistPublicProfile from "../components/ArtistPublicProfile";
import ListenerSetupForm from "../components/ListenerSetupForm";

export default function SmartProfile() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false); // New state for editing mode
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
      <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-4">Authenticating...</p>
    </div>
  );

  // --- ARTIST FLOW ---
  if (role === "artist") {
    // If the pencil was clicked, show the creator in "Edit Mode"
    if (isEditing) {
      return (
        <ArtistProfileCreator 
          initialData={profileData} 
          onComplete={() => {
            setIsEditing(false);
            checkUser(); // Refresh data after edit
          }} 
        />
      );
    }

    return hasProfile ? (
      <div className="relative bg-black min-h-screen">
         <ArtistPublicProfile userId={user.id} /> 
         
         {/* Action Buttons Container */}
         <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
            {/* THE PENCIL (EDIT) BUTTON */}
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-white text-black p-3 rounded-full hover:bg-orange-500 hover:text-white transition-all shadow-xl flex items-center justify-center"
              title="Edit Profile"
            >
              <Pencil size={18} />
            </button>

            {/* LOGOUT BUTTON */}
            <button 
              onClick={handleSignOut} 
              className="bg-zinc-900/90 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/10 text-white text-xs font-black tracking-widest hover:bg-red-600 transition-all uppercase"
            >
              Logout
            </button>
         </div>
      </div>
    ) : (
      <ArtistProfileCreator onComplete={checkUser} />
    );
  }

  // --- LISTENER FLOW ---
  if (role === "listener") {
    return hasProfile ? (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-10">
        <div className="max-w-2xl w-full bg-zinc-900 rounded-[3rem] p-12 border border-white/5 relative">
          <button onClick={handleSignOut} className="absolute top-8 right-8 text-zinc-500 hover:text-white"><LogOut /></button>
          <div className="w-20 h-20 bg-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-600/20">
            <User size={40} className="text-white" />
          </div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-2">{profileData.name}</h1>
          <p className="text-orange-500 font-bold uppercase tracking-widest text-sm mb-6">{profileData.major}</p>
          <p className="text-zinc-400 text-lg leading-relaxed mb-8">{profileData.bio}</p>
          <button 
            onClick={() => router.push("/discover")}
            className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-orange-500 hover:text-white transition-all uppercase italic"
          >
            Go to Discover Feed
          </button>
        </div>
      </div>
    ) : (
      <ListenerSetupForm onComplete={checkUser} />
    );
  }

  return null;
}