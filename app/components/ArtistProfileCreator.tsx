"use client";
import { useState } from "react";
import { Upload, Music, X, Save, Eye, ImageIcon, Loader2, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ArtistProfileCreator() {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [artistData, setArtistData] = useState({
    name: "",
    bio: "",
    genre: "",
    profileImageUrl: "",
    coverImageUrl: "",
  });

  // --- IMAGE UPLOAD LOGIC ---
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${type}/${fileName}`;

      // 1. Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('artist-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get the public URL
      const { data } = supabase.storage.from('artist-assets').getPublicUrl(filePath);
      
      setArtistData(prev => ({ 
        ...prev, 
        [type === 'profile' ? 'profileImageUrl' : 'coverImageUrl']: data.publicUrl 
      }));

    } catch (error: any) {
      console.error('Error:', error.message);
      alert('Upload failed! Make sure your bucket "artist-assets" is Public.');
    } finally {
      setUploading(false);
    }
  };

  // --- SAVE PROFILE LOGIC ---
  const saveProfile = async () => {
    if (!artistData.name || !artistData.genre) {
      alert("Name and Genre are required!");
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('artists')
        .insert([artistData]);

      if (error) throw error;
      alert("Artist Profile Synced to Supabase! 🎸");
    } catch (error: any) {
      alert("Database error: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-6xl font-black tracking-tighter text-orange-500 italic">STAMPEDE</h1>
          <p className="text-zinc-500 uppercase tracking-widest text-xs mt-2 font-bold">Artist Onboarding v1.0</p>
        </header>

        {/* Cover Image Upload Area */}
        <div className="relative h-56 bg-zinc-900 rounded-3xl border-2 border-dashed border-zinc-800 flex items-center justify-center overflow-hidden group hover:border-orange-500 transition-all mb-8">
          {artistData.coverImageUrl ? (
            <img src={artistData.coverImageUrl} className="w-full h-full object-cover" alt="Cover" />
          ) : (
            <div className="text-center">
              <Upload className="mx-auto text-zinc-700 mb-2" />
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Upload Cover Art</p>
            </div>
          )}
          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleUpload(e, 'cover')} />
          {uploading && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" /></div>}
        </div>

        {/* Profile Pic & Basic Details */}
        <div className="flex flex-col md:flex-row gap-8 items-end mb-8 px-4">
          <div className="relative w-32 h-32 rounded-2xl bg-zinc-900 border-2 border-zinc-800 shadow-2xl overflow-hidden shrink-0">
            {artistData.profileImageUrl ? (
              <img src={artistData.profileImageUrl} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              <ImageIcon className="absolute inset-0 m-auto text-zinc-800 w-8 h-8" />
            )}
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleUpload(e, 'profile')} />
          </div>

          <div className="flex-1 space-y-4 w-full">
            <input 
              placeholder="ARTIST / BAND NAME" 
              className="w-full bg-transparent border-b-2 border-zinc-800 py-2 text-2xl font-bold focus:border-orange-500 outline-none transition-colors"
              onChange={(e) => setArtistData({...artistData, name: e.target.value})}
            />
            <input 
              placeholder="GENRE (E.G. HYPERPOP, INDIE)" 
              className="w-full bg-transparent border-b-2 border-zinc-800 py-2 text-sm uppercase tracking-widest focus:border-orange-500 outline-none transition-colors"
              onChange={(e) => setArtistData({...artistData, genre: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-6 px-4">
          <textarea 
            placeholder="TELL YOUR STORY..." 
            className="w-full bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl focus:ring-1 focus:ring-orange-500 outline-none h-32 text-zinc-300"
            onChange={(e) => setArtistData({...artistData, bio: e.target.value})}
          />

          <button 
            onClick={saveProfile}
            disabled={saving || uploading}
            className="w-full bg-orange-600 hover:bg-orange-500 py-5 rounded-2xl font-black text-lg uppercase tracking-[0.2em] transition-all disabled:opacity-50"
          >
            {saving ? "SYNCING..." : "DEPLOY TO STAMPEDE"}
          </button>
        </div>
      </div>
    </div>
  );
}