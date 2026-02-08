"use client";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Music, User, Loader2 } from "lucide-react";
import { useState } from "react";

export default function RoleSelection() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const setRole = async (role: "artist" | "listener") => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      // 1. Save role to the 'profiles' table 
      // We use upsert so if they refresh, it just updates instead of erroring
      const { error } = await supabase
        .from("profiles")
        .upsert([{ 
          id: user.id, 
          role: role,
          email: user.email,
          updated_at: new Date()
        }]);

      if (error) throw error;

      // 2. THE FIX: Always redirect to /profile
      // Our SmartProfile at /profile/page.tsx will detect the role 
      // and show the correct Setup Form.
      router.push("/profile");
      
    } catch (error: any) {
      console.error("Error setting role:", error.message);
      alert("Failed to set role: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-orange-500 w-12 h-12" />
        <p className="text-zinc-500 font-black uppercase tracking-widest text-xs mt-4">Setting your path...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white">
      <div className="max-w-md w-full space-y-12">
        <header className="text-center space-y-2">
          <h2 className="text-5xl font-black uppercase italic tracking-tighter">Choose Your Side</h2>
          <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px]">Austin Underground / Stampede</p>
        </header>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Artist Card */}
          <button 
            onClick={() => setRole('artist')} 
            className="flex-1 bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] hover:border-orange-500 hover:bg-orange-500/5 group transition-all flex flex-col items-center gap-4 shadow-2xl"
          >
            <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-orange-600/20">
              <Music className="text-white" size={32} />
            </div>
            <div className="text-center">
              <span className="block font-black uppercase italic text-xl">Artist</span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Share Your Sound</span>
            </div>
          </button>

          {/* Listener Card */}
          <button 
            onClick={() => setRole('listener')} 
            className="flex-1 bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] hover:border-white hover:bg-white/5 group transition-all flex flex-col items-center gap-4 shadow-2xl"
          >
            <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-white/5">
              <User className="text-white" size={32} />
            </div>
            <div className="text-center">
              <span className="block font-black uppercase italic text-xl">Listener</span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Find the Vibe</span>
            </div>
          </button>
        </div>

        <p className="text-center text-zinc-600 text-[10px] font-medium px-10 leading-relaxed uppercase tracking-widest">
          This choice defines your dashboard. <br />You can change this later in settings.
        </p>
      </div>
    </div>
  );
}