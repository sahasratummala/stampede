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

      const { error: uploadError } = await supabase.storage
        .from('artist-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('artist-assets')
        .getPublicUrl(filePath);

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
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card p-8 rounded-[2.5rem] border border-border">
      <h3 className="text-xl font-black italic uppercase mb-6 flex items-center gap-2 text-foreground">
        <Plus className="text-accent" /> New Media Drop
      </h3>
      <form onSubmit={handleUpload} className="space-y-4">
        <input 
          type="text" 
          placeholder="TRACK OR VIDEO TITLE" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-background border border-border p-5 rounded-2xl font-bold text-xs uppercase tracking-widest text-foreground focus:border-accent outline-none placeholder:text-muted"
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
            className="flex items-center justify-center gap-3 w-full bg-background border-2 border-dashed border-border p-10 rounded-2xl cursor-pointer hover:border-accent transition-all"
          >
            {file ? (
               <span className="text-accent font-bold text-xs uppercase">{file.name}</span>
            ) : (
               <>
                <Video size={20} className="text-muted" />
                <Music size={20} className="text-muted" />
                <span className="text-muted font-bold text-xs uppercase">Select Video or Audio</span>
               </>
            )}
          </label>
        </div>
        <button 
          disabled={loading}
          className="w-full bg-foreground text-background font-black py-5 rounded-2xl hover:bg-accent hover:text-white transition-all uppercase text-xs tracking-[0.2em] flex items-center justify-center"
        >
          {loading ? <Loader2 className="animate-spin" /> : "DEPLOY DROP"}
        </button>
      </form>
    </div>
  );
}
