"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

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

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("listeners").insert([{
      id: user?.id,
      name: formData.name,
      major: formData.major,
      bio: formData.bio,
      interests: formData.interests
    }]);

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-orange-500">Listener Profile</h2>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Join the Stampede herd</p>
        </div>

        <div className="space-y-4">
          <input 
            required 
            placeholder="Full Name" 
            className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl focus:border-orange-500 outline-none transition-all"
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
          <input 
            required 
            placeholder="Major (e.g. Radio-TV-Film)" 
            className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl focus:border-orange-500 outline-none transition-all"
            onChange={e => setFormData({...formData, major: e.target.value})}
          />
          <textarea 
            required
            placeholder="Tell us about yourself..." 
            className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl h-32 focus:border-orange-500 outline-none transition-all resize-none"
            onChange={e => setFormData({...formData, bio: e.target.value})}
          />
          <input 
            placeholder="Favorite Genres / Artists" 
            className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl focus:border-orange-500 outline-none transition-all"
            onChange={e => setFormData({...formData, interests: e.target.value})}
          />
        </div>

        <button 
          disabled={loading}
          className="w-full bg-orange-600 font-black py-4 rounded-2xl hover:bg-orange-500 transition-all flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : "COMPLETE SETUP"}
        </button>
      </form>
    </div>
  );
}