"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Video, Music, Plus } from "lucide-react";

export default function MediaPostCreator({ artistId }: { artistId: string }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return alert("Add a title and a file!");

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${artistId}/${fileName}`;

      // 1. Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('artist-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('artist-assets')
        .getPublicUrl(filePath);

      // 3. Save to Posts table
      const { error: postError } = await supabase
        .from('posts')
        .insert([{
          artist_id: artistId,
          title: title,
          media_url: publicUrl,
          media_type: file.type.startsWith('video') ? 'video' : 'audio'
        }]);

      if (postError) throw postError;

      alert("Drop Deployed Successfully!");
      window.location.reload(); // Refreshes to show the new video immediately

    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-950 p-8 rounded-[2.5rem] border border-white/5">
      <h3 className="text-xl font-black italic uppercase mb-6 flex items-center gap-2">
        <Plus className="text-orange-500" /> New Media Drop
      </h3>
      <form onSubmit={handleUpload} className="space-y-4">
        <input 
          type="text" 
          placeholder="TRACK OR VIDEO TITLE" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-black border border-white/10 p-5 rounded-2xl font-bold text-xs uppercase tracking-widest text-white focus:border-orange-500 outline-none"
        />
        
        <div className="relative">
          <input 
            type="file" 
            accept="video/*,audio/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
            id="media-upload"
          />
          <label 
            htmlFor="media-upload"
            className="flex items-center justify-center gap-3 w-full bg-zinc-900 border-2 border-dashed border-white/10 p-10 rounded-2xl cursor-pointer hover:border-orange-500/50 transition-all"
          >
            {file ? (
               <span className="text-orange-500 font-bold text-xs uppercase">{file.name}</span>
            ) : (
               <>
                <Video size={20} className="text-zinc-500" />
                <Music size={20} className="text-zinc-500" />
                <span className="text-zinc-500 font-bold text-xs uppercase">Select Video or Audio</span>
               </>
            )}
          </label>
        </div>

        <button 
          disabled={loading}
          className="w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-orange-500 hover:text-white transition-all uppercase text-xs tracking-[0.2em] flex items-center justify-center"
        >
          {loading ? <Loader2 className="animate-spin" /> : "DEPLOY DROP"}
        </button>
      </form>
    </div>
  );
}