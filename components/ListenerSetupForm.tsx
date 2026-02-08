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

  // Handle Image Selection and Preview
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

      // 1. Upload Image to Supabase Storage if a file was selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, imageFile, {
            upsert: true // This allows users to update/overwrite their photo
          });

        if (uploadError) throw uploadError;

        // 2. Get the public URL for the uploaded image
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        
        profileImageUrl = publicUrlData.publicUrl;
      }

      // 3. Insert into listeners table with the image URL
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
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-8">
        <header className="text-center">
          {/* PROFILE PHOTO UPLOAD SECTION */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="w-24 h-24 bg-zinc-900 rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden border-2 border-zinc-800">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-zinc-700" />
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 bg-orange-600 p-2 rounded-xl cursor-pointer hover:bg-orange-500 transition-colors shadow-lg border-2 border-black">
              <Camera size={18} />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageChange} 
              />
            </label>
          </div>

          <h1 className="text-5xl font-black italic uppercase tracking-tighter">Fan Profile</h1>
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