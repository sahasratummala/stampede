"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Camera, Music, Instagram, Youtube, Globe, Save } from "lucide-react";

interface ArtistProfileCreatorProps {
  initialData?: any;
  onComplete: () => void;
}

export default function ArtistProfileCreator({ initialData, onComplete }: ArtistProfileCreatorProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    bio: initialData?.bio || "",
    genre: initialData?.genre || "",
    profileImageUrl: initialData?.profileImageUrl || "",
    coverImageUrl: initialData?.coverImageUrl || "",
    instagram: initialData?.instagram || "",
    spotify: initialData?.spotify || "",
    soundcloud: initialData?.soundcloud || "",
    youtube: initialData?.youtube || "",
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "profileImageUrl" | "coverImageUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `artists/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("artist-assets")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("artist-assets").getPublicUrl(filePath);
      setFormData((prev) => ({ ...prev, [field]: data.publicUrl }));
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("artists")
        .upsert({
          id: user.id,
          ...formData,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) throw error;
      onComplete();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter">Setup Artist Profile</h1>
          <p className="text-muted font-bold uppercase tracking-widest text-xs mt-2">Create your presence in the herd</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* IMAGE UPLOADS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-accent tracking-widest">Profile Image (Square)</label>
              <div 
                className="h-48 bg-card rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer"
                onClick={() => document.getElementById('profileInput')?.click()}
              >
                {formData.profileImageUrl ? (
                  <img src={formData.profileImageUrl} className="w-full h-full object-cover" />
                ) : (
                  <Camera className="text-muted group-hover:text-accent transition-colors" size={32} />
                )}
                <input id="profileInput" type="file" className="hidden" onChange={(e) => handleUpload(e, 'profileImageUrl')} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-accent tracking-widest">Cover Banner (Wide)</label>
              <div 
                className="h-48 bg-card rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer"
                onClick={() => document.getElementById('coverInput')?.click()}
              >
                {formData.coverImageUrl ? (
                  <img src={formData.coverImageUrl} className="w-full h-full object-cover" />
                ) : (
                  <Camera className="text-muted group-hover:text-accent transition-colors" size={32} />
                )}
                <input id="coverInput" type="file" className="hidden" onChange={(e) => handleUpload(e, 'coverImageUrl')} />
              </div>
            </div>
          </div>

          {/* BASIC INFO */}
          <div className="space-y-4 bg-card p-8 rounded-[2.5rem] border border-border">
            <input
              placeholder="Artist / Band Name"
              className="w-full bg-background border border-border p-4 rounded-2xl focus:border-accent outline-none font-bold text-foreground placeholder:text-muted"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <input
              placeholder="Genre (e.g. Indie Rock / Jazz)"
              className="w-full bg-background border border-border p-4 rounded-2xl focus:border-accent outline-none text-foreground placeholder:text-muted"
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              required
            />
            <textarea
              placeholder="Your Narrative / Bio"
              className="w-full bg-background border border-border p-4 rounded-2xl focus:border-accent outline-none h-32 resize-none text-foreground placeholder:text-muted"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              required
            />
          </div>

          {/* SOCIAL HANDLES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-card p-8 rounded-[2.5rem] border border-border">
            <div className="relative">
              <Instagram className="absolute left-4 top-4 text-muted" size={18} />
              <input
                placeholder="Instagram Handle (no @)"
                className="w-full bg-background border border-border p-4 pl-12 rounded-2xl text-sm focus:border-accent outline-none text-foreground placeholder:text-muted"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              />
            </div>
            <div className="relative">
              <Music className="absolute left-4 top-4 text-muted" size={18} />
              <input
                placeholder="Spotify Link"
                className="w-full bg-background border border-border p-4 pl-12 rounded-2xl text-sm focus:border-accent outline-none text-foreground placeholder:text-muted"
                value={formData.spotify}
                onChange={(e) => setFormData({ ...formData, spotify: e.target.value })}
              />
            </div>
            <div className="relative">
              <Globe className="absolute left-4 top-4 text-muted" size={18} />
              <input
                placeholder="Soundcloud Link"
                className="w-full bg-background border border-border p-4 pl-12 rounded-2xl text-sm focus:border-accent outline-none text-foreground placeholder:text-muted"
                value={formData.soundcloud}
                onChange={(e) => setFormData({ ...formData, soundcloud: e.target.value })}
              />
            </div>
            <div className="relative">
              <Youtube className="absolute left-4 top-4 text-muted" size={18} />
              <input
                placeholder="YouTube Link"
                className="w-full bg-background border border-border p-4 pl-12 rounded-2xl text-sm focus:border-accent outline-none text-foreground placeholder:text-muted"
                value={formData.youtube}
                onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-background font-black py-5 rounded-[2rem] hover:bg-accent hover:text-white transition-all uppercase italic text-xl flex items-center justify-center gap-3 shadow-xl"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save size={24} />}
            {loading ? "Deploying..." : "Launch Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
