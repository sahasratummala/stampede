"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Music, User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

// Import your existing components (ensure the paths are correct)
// app/profile/page.tsx

// Go UP one level out of 'profile', then INTO 'components'
import ArtistProfileCreator from "../components/ArtistProfileCreator"; 
import ArtistPublicProfile from "../components/ArtistPublicProfile";
import ListenerSetupForm from "../components/ListenerSetupForm";

export default function SmartProfile() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      // 1. Get User Role
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

      // 2. Check if Artist or Listener profile exists
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
    }
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

  // --- LOGIC: ARTIST FLOW ---
  if (role === "artist") {
    return hasProfile ? (
      <div className="relative">
         {/* Show the actual profile page */}
         <ArtistPublicProfile artistId={user.id} /> 
         <button onClick={handleSignOut} className="fixed top-4 right-4 z-50 bg-zinc-900 p-2 rounded-full border border-white/10 text-white hover:text-red-500">
           <LogOut size={20} />
         </button>
      </div>
    ) : (
      /* Show the setup form if they haven't finished it */
      <ArtistProfileCreator onComplete={() => window.location.reload()} />
    );
  }

  // --- LOGIC: LISTENER FLOW ---
  if (role === "listener") {
    return hasProfile ? (
      <div className="min-h-screen bg-black text-white p-10">
        <div className="max-w-2xl mx-auto bg-zinc-900 rounded-[3rem] p-12 border border-white/5">
          <div className="flex justify-between items-start mb-8">
            <div className="w-20 h-20 bg-orange-600 rounded-2xl flex items-center justify-center">
              <User size={40} className="text-white" />
            </div>
            <button onClick={handleSignOut} className="text-zinc-500 hover:text-white transition-colors"><LogOut /></button>
          </div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-2">{profileData.name}</h1>
          <p className="text-orange-500 font-bold uppercase tracking-widest text-sm mb-6">{profileData.major}</p>
          <p className="text-zinc-400 text-lg leading-relaxed mb-8">{profileData.bio}</p>
          
          <div className="bg-black/50 p-6 rounded-2xl border border-white/5">
            <h3 className="text-xs font-black uppercase text-zinc-500 tracking-widest mb-4">Music Interests</h3>
            <p className="text-zinc-300">{profileData.interests}</p>
          </div>

          <button 
            onClick={() => router.push("/discover")}
            className="w-full mt-10 bg-white text-black font-black py-4 rounded-2xl hover:bg-orange-500 hover:text-white transition-all uppercase italic"
          >
            Go to Discover Feed
          </button>
        </div>
      </div>
    ) : (
      <ListenerSetupForm onComplete={() => window.location.reload()} />
    );
  }

  return null;
}