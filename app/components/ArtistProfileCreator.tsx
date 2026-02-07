"use client";
import { useState, useEffect } from "react";
import { Upload, ImageIcon, Loader2, Instagram, Music as MusicIcon, Youtube, Globe } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface CreatorProps {
  onComplete?: () => void;
  initialData?: any; // Pass this if we are EDITING
}

export default function ArtistProfileCreator({ onComplete, initialData }: CreatorProps) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [artistData, setArtistData] = useState({
    name: initialData?.name || "",
    bio: initialData?.bio || "",
    genre: initialData?.genre || "",
    profileImageUrl: initialData?.profileImageUrl || "",
    coverImageUrl: initialData?.coverImageUrl || "",
    instagram: initialData?.instagram || "",
    spotify: initialData?.spotify || "",
    soundcloud: initialData?.soundcloud || "",
    youtube: initialData?.youtube || ""
  });

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${type}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('artist-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('artist-assets').getPublicUrl(filePath);
      
      setArtistData(prev => ({ 
        ...prev, 
        [type === 'profile' ? 'profileImageUrl' : 'coverImageUrl']: data.publicUrl 
      }));
    } catch (error: any) {
      alert('Upload failed! Ensure bucket is public.');
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = async () => {
    if (!artistData.name || !artistData.genre) return alert("Name and Genre are required!");

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Use UPSERT: It updates if ID exists, or inserts if it doesn't
      const { error } = await supabase
        .from('artists')
        .upsert([{
          id: user.id,
          ...artistData,
          updated_at: new Date()
        }]);

      if (error) throw error;
      if (onComplete) onComplete();
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-20">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-5xl font-black tracking-tighter text-orange-500 italic uppercase">Stampede Studio</h1>
          <p className="text-zinc-500 uppercase tracking-widest text-[10px] mt-2 font-bold italic">
            {initialData ? "Refining your legacy" : "Establishing your presence"}
          </p>
        </header>

        {/* Cover Upload */}
        <div className="relative h-48 bg-zinc-900 rounded-[2rem] border-2 border-dashed border-zinc-800 flex items-center justify-center overflow-hidden hover:border-orange-500 transition-all mb-8">
          {artistData.coverImageUrl ? (
            <img src={artistData.coverImageUrl} className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="text-center opacity-40"><Upload className="mx-auto mb-2" /><p className="text-[10px] font-bold">COVER ART</p></div>
          )}
          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleUpload(e, 'cover')} />
          {uploading && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" /></div>}
        </div>

        {/* Profile Pic & Identity */}
        <div className="flex flex-col md:flex-row gap-8 items-end mb-12 px-4">
          <div className="relative w-32 h-32 rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl overflow-hidden shrink-0">
            {artistData.profileImageUrl ? (
              <img src={artistData.profileImageUrl} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="absolute inset-0 m-auto text-zinc-800 w-8 h-8" />
            )}
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleUpload(e, 'profile')} />
          </div>
          <div className="flex-1 space-y-4 w-full">
            <input value={artistData.name} placeholder="STAGE NAME" className="w-full bg-transparent border-b border-zinc-800 py-2 text-3xl font-black italic focus:border-orange-500 outline-none uppercase" onChange={(e) => setArtistData({...artistData, name: e.target.value})} />
            <input value={artistData.genre} placeholder="GENRE" className="w-full bg-transparent border-b border-zinc-800 py-2 text-xs font-bold tracking-widest focus:border-orange-500 outline-none uppercase text-orange-500" onChange={(e) => setArtistData({...artistData, genre: e.target.value})} />
          </div>
        </div>

        {/* Bio */}
        <div className="px-4 mb-8">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Artist Bio</label>
          <textarea value={artistData.bio} placeholder="Your story..." className="w-full bg-zinc-900/50 border border-white/5 p-6 rounded-3xl focus:ring-1 focus:ring-orange-500 outline-none h-32 text-zinc-300" onChange={(e) => setArtistData({...artistData, bio: e.target.value})} />
        </div>

        {/* Social Handles (Optional) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-zinc-900/50 p-3 rounded-2xl border border-white/5">
              <Instagram size={18} className="text-zinc-500" />
              <input value={artistData.instagram} placeholder="Instagram" className="bg-transparent outline-none text-sm flex-1" onChange={(e) => setArtistData({...artistData, instagram: e.target.value})} />
            </div>
            <div className="flex items-center gap-3 bg-zinc-900/50 p-3 rounded-2xl border border-white/5">
              <MusicIcon size={18} className="text-zinc-500" />
              <input value={artistData.spotify} placeholder="Spotify Link" className="bg-transparent outline-none text-sm flex-1" onChange={(e) => setArtistData({...artistData, spotify: e.target.value})} />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-zinc-900/50 p-3 rounded-2xl border border-white/5">
              <Globe size={18} className="text-zinc-500" />
              <input value={artistData.soundcloud} placeholder="SoundCloud" className="bg-transparent outline-none text-sm flex-1" onChange={(e) => setArtistData({...artistData, soundcloud: e.target.value})} />
            </div>
            <div className="flex items-center gap-3 bg-zinc-900/50 p-3 rounded-2xl border border-white/5">
              <Youtube size={18} className="text-zinc-500" />
              <input value={artistData.youtube} placeholder="YouTube" className="bg-transparent outline-none text-sm flex-1" onChange={(e) => setArtistData({...artistData, youtube: e.target.value})} />
            </div>
          </div>
        </div>

        <button onClick={saveProfile} disabled={saving || uploading} className="w-full bg-orange-600 hover:bg-orange-500 py-6 rounded-3xl font-black text-xl uppercase tracking-widest transition-all shadow-xl shadow-orange-600/20">
          {saving ? "SYNCING..." : "DEPLOY UPDATES"}
        </button>
      </div>
    </div>
  );
}