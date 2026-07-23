"use client";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Music, User, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";

export default function RoleSelection() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const setRole = async (role: "artist" | "listener") => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      const { error } = await supabase.from("profiles").upsert([
        {
          id: user.id,
          role: role,
          email: user.email,
          updated_at: new Date(),
        },
      ]);

      if (error) throw error;

      router.push("/profile?new=1");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Error setting role:", message);
      alert("Failed to set role: " + message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-orange-500 w-12 h-12" />
        <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px] mt-4">
          Claiming your spot in the herd...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white">
      <div className="max-w-md w-full space-y-12">
        <header className="text-center space-y-4">
          <div className="flex justify-center">
            <Sparkles className="text-orange-600 animate-pulse" size={32} />
          </div>
          <h2 className="text-5xl font-black uppercase italic tracking-tighter">Choose Your Side</h2>
          <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px]">
            Austin Underground <span className="text-white mx-2">/</span> Stampede
          </p>
        </header>

        <div className="flex flex-col gap-6">
          <button
            onClick={() => setRole("artist")}
            className="w-full bg-zinc-950 border-2 border-zinc-900 p-8 rounded-[2.5rem] hover:border-orange-600 hover:bg-orange-600/5 group transition-all flex items-center gap-6 shadow-2xl text-left"
          >
            <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 shadow-lg shadow-orange-600/20">
              <Music className="text-white" size={32} />
            </div>
            <div>
              <span className="block font-black uppercase italic text-2xl leading-none">Artist</span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Share Your Sound</span>
            </div>
          </button>

          <button
            onClick={() => setRole("listener")}
            className="w-full bg-zinc-950 border-2 border-zinc-900 p-8 rounded-[2.5rem] hover:border-white hover:bg-white/5 group transition-all flex items-center gap-6 shadow-2xl text-left"
          >
            <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 border border-white/5">
              <User className="text-white" size={32} />
            </div>
            <div>
              <span className="block font-black uppercase italic text-2xl leading-none text-white">Listener</span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Find the Vibe</span>
            </div>
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-center text-zinc-600 text-[9px] font-bold px-10 leading-relaxed uppercase tracking-[0.2em]">
            This choice defines your dashboard. <br />You can change this later in settings.
          </p>
        </div>
      </div>
    </div>
  );
}
