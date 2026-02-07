"use client";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Music, User } from "lucide-react";

export default function RoleSelection() {
  const router = useRouter();

  const setRole = async (role: "artist" | "listener") => {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Save role to a 'profiles' table in Supabase
    await supabase.from("profiles").insert([{ id: user?.id, role }]);

    if (role === "artist") router.push("/onboarding/artist");
    else router.push("/onboarding/listener");
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white gap-8">
      <h2 className="text-3xl font-black uppercase tracking-tighter">Who are you?</h2>
      <div className="flex gap-4 w-full max-w-md">
        <button onClick={() => setRole('artist')} className="flex-1 bg-zinc-900 border border-zinc-800 p-10 rounded-3xl hover:border-orange-500 flex flex-col items-center gap-4 transition-all">
          <Music className="text-orange-500" size={48} />
          <span className="font-black uppercase italic">Artist</span>
        </button>
        <button onClick={() => setRole('listener')} className="flex-1 bg-zinc-900 border border-zinc-800 p-10 rounded-3xl hover:border-orange-500 flex flex-col items-center gap-4 transition-all">
          <User className="text-zinc-500" size={48} />
          <span className="font-black uppercase italic">Listener</span>
        </button>
      </div>
    </div>
  );
}