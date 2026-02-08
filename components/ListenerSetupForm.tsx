"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { User, GraduationCap, Heart, Loader2 } from "lucide-react";

export default function ListenerSetupForm({ onComplete }: { onComplete: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    major: "",
    bio: "",
    interests: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase.from("listeners").insert([{
        id: user.id,
        ...formData
      }]);

      if (error) throw error;
      onComplete();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-8">
        <header className="text-center">
          <div className="w-20 h-20 bg-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-orange-600/20">
            <User size={40} strokeWidth={3} />
          </div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter italic">Fan Profile</h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-2">Join the UT Underground</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="group relative">
            <input 
              required 
              placeholder="FULL NAME" 
              className="w-full bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl focus:border-orange-500 outline-none transition-all font-bold uppercase placeholder:text-zinc-700"
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="group relative text-orange-500">
            <GraduationCap className="absolute right-5 top-5 opacity-20" />
            <input 
              required 
              placeholder="MAJOR (E.G. RTF, CS)" 
              className="w-full bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl focus:border-orange-500 outline-none transition-all font-bold uppercase placeholder:text-zinc-700"
              onChange={e => setFormData({...formData, major: e.target.value})}
            />
          </div>

          <textarea 
            required
            placeholder="TELL US ABOUT YOUR VIBE..." 
            className="w-full bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl h-32 focus:border-orange-500 outline-none transition-all font-medium placeholder:text-zinc-700 resize-none"
            onChange={e => setFormData({...formData, bio: e.target.value})}
          />

          <div className="group relative">
            <Heart className="absolute right-5 top-5 opacity-20 text-red-500" />
            <input 
              placeholder="GENRES YOU LOVE (INDIE, TRAP...)" 
              className="w-full bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl focus:border-orange-500 outline-none transition-all font-bold uppercase placeholder:text-zinc-700"
              onChange={e => setFormData({...formData, interests: e.target.value})}
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-orange-500 hover:text-white transition-all uppercase italic tracking-tighter text-xl disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" /> : "Start Swiping"}
          </button>
        </form>
      </div>
    </div>
  );
}