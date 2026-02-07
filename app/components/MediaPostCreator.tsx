"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Video, Music, Plus, Loader2 } from "lucide-react";

export default function MediaPostCreator({ artistId }: { artistId: string }) {
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'audio') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const filePath = `posts/${artistId}/${Date.now()}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('artist-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('artist-assets').getPublicUrl(filePath);

      await supabase.from('posts').insert([{
        artist_id: artistId,
        title: title || "New Track/Video",
        media_url: urlData.publicUrl,
        media_type: type
      }]);

      alert("Content Posted! 🚀");
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-zinc-900/50 p-6 rounded-[2rem] border border-white/5 mb-10">
      <h3 className="text-sm font-black uppercase italic tracking-widest text-orange-500 mb-4">Post New Content</h3>
      <input 
        placeholder="Title of this piece..." 
        className="w-full bg-black border border-zinc-800 p-4 rounded-xl mb-4 outline-none focus:border-orange-500 text-sm"
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center justify-center gap-2 bg-zinc-800 p-4 rounded-xl cursor-pointer hover:bg-zinc-700 transition-all">
          <Video size={18} className="text-orange-500" />
          <span className="text-[10px] font-black uppercase tracking-widest">Add Video</span>
          <input type="file" accept="video/*" className="hidden" onChange={(e) => handleMediaUpload(e, 'video')} />
        </label>
        <label className="flex items-center justify-center gap-2 bg-zinc-800 p-4 rounded-xl cursor-pointer hover:bg-zinc-700 transition-all">
          <Music size={18} className="text-orange-500" />
          <span className="text-[10px] font-black uppercase tracking-widest">Add Audio</span>
          <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleMediaUpload(e, 'audio')} />
        </label>
      </div>
      {uploading && <div className="mt-4 flex items-center gap-2 text-zinc-500 text-xs italic"><Loader2 className="animate-spin" size={14}/> Processing media...</div>}
    </div>
  );
}