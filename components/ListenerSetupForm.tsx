"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { User, GraduationCap, Heart, Loader2, Camera } from "lucide-react";

export default function ListenerSetupForm({ onComplete }: { onComplete: () => void }) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    major: "",
    bio: "",
    interests: ""
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      let profileImageUrl = "";

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, imageFile, {
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        
        profileImageUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase.from("listeners").insert([{
        id: user.id,
        ...formData,
        profileImageUrl: profileImageUrl
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
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 transition-colors duration-300">
      <div className="w-full max-w-lg space-y-8">
        <header className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="w-24 h-24 bg-card rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden border-2 border-border">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-muted" />
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 bg-accent p-2 rounded-xl cursor-pointer hover:brightness-110 transition-colors shadow-lg border-2 border-background">
              <Camera size={18} className="text-white" />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageChange} 
              />
            </label>
          </div>

          <h1 className="text-5xl font-black italic uppercase tracking-tighter">Fan Profile</h1>
          <p className="text-muted font-bold uppercase tracking-widest text-[10px] mt-2">Join the UT Underground</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="group relative">
            <input 
              required 
              placeholder="FULL NAME" 
              className="w-full bg-card border border-border p-5 rounded-2xl focus:border-accent outline-none transition-all font-bold uppercase placeholder:text-muted text-foreground"
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="group relative text-accent">
            <GraduationCap className="absolute right-5 top-5 opacity-20" />
            <input 
              required 
              placeholder="MAJOR (E.G. RTF, CS)" 
              className="w-full bg-card border border-border p-5 rounded-2xl focus:border-accent outline-none transition-all font-bold uppercase placeholder:text-muted text-foreground"
              onChange={e => setFormData({...formData, major: e.target.value})}
            />
          </div>

          <textarea 
            required
            placeholder="TELL US ABOUT YOUR VIBE..." 
            className="w-full bg-card border border-border p-5 rounded-2xl h-32 focus:border-accent outline-none transition-all font-medium placeholder:text-muted text-foreground resize-none"
            onChange={e => setFormData({...formData, bio: e.target.value})}
          />

          <div className="group relative">
            <Heart className="absolute right-5 top-5 opacity-20 text-red-500" />
            <input 
              placeholder="GENRES YOU LOVE (INDIE, TRAP...)" 
              className="w-full bg-card border border-border p-5 rounded-2xl focus:border-accent outline-none transition-all font-bold uppercase placeholder:text-muted text-foreground"
              onChange={e => setFormData({...formData, interests: e.target.value})}
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-foreground text-background font-black py-5 rounded-2xl hover:bg-accent hover:text-white transition-all uppercase italic tracking-tighter text-xl disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" /> : "Start Swiping"}
          </button>
        </form>
      </div>
    </div>
  );
}
