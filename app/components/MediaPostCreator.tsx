"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Video, Music, Calendar, MapPin, Loader2, Plus, Clock, MessageSquare, Trash2 } from "lucide-react";

export default function MediaPostCreator({ artistId }: { artistId: string }) {
  const [uploading, setUploading] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);
  const [eventData, setEventData] = useState({
    name: "",
    date: "",
    time: "",
    location: "",
    message: ""
  });

  // --- 1. MEDIA UPLOAD LOGIC (Video/Audio) ---
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'audio') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      
      // Create path: posts/artistId/timestamp-filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `posts/${artistId}/${fileName}`;

      // Upload to your 'artist-assets' bucket
      const { error: uploadError } = await supabase.storage
        .from('artist-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get Public URL
      const { data: urlData } = supabase.storage.from('artist-assets').getPublicUrl(filePath);

      // Save record to 'posts' table
      const { error: dbError } = await supabase.from('posts').insert([{
        artist_id: artistId,
        title: file.name.split('.')[0], // Use filename as title
        media_url: urlData.publicUrl,
        media_type: type
      }]);

      if (dbError) throw dbError;

      alert(`${type.toUpperCase()} posted successfully! 🚀`);
      window.location.reload(); // Refresh to show new content
    } catch (err: any) {
      console.error(err);
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // --- 2. SHOW/PERFORMANCE LOGIC ---
  const saveEvent = async () => {
    if (!eventData.name || !eventData.date || !eventData.location) {
      alert("Please fill in the Name, Date, and Location!");
      return;
    }

    try {
      setSavingEvent(true);
      const { error } = await supabase.from('events').insert([{
        artist_id: artistId,
        name: eventData.name,
        event_date: eventData.date,
        event_time: eventData.time,
        location: eventData.location,
        message: eventData.message
      }]);

      if (error) throw error;

      alert("Show added to your calendar! 📅");
      setEventData({ name: "", date: "", time: "", location: "", message: "" }); // Reset form
      window.location.reload();
    } catch (err: any) {
      alert("Error saving show: " + err.message);
    } finally {
      setSavingEvent(false);
    }
  };

  return (
    <div className="space-y-8 bg-zinc-900/30 p-8 rounded-[3rem] border border-white/5 backdrop-blur-sm">
      
      {/* SECTION: MEDIA DROPS */}
      <section>
        <header className="mb-6">
          <h3 className="text-orange-500 font-black uppercase text-xs tracking-[0.3em] italic">Latest Drops</h3>
          <p className="text-zinc-500 text-[10px] font-bold uppercase mt-1">Upload Music or Videos for your fans</p>
        </header>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Video Upload Button */}
          <label className="relative flex flex-col items-center justify-center gap-3 bg-black border border-zinc-800 p-8 rounded-[2rem] cursor-pointer hover:border-orange-500/50 hover:bg-zinc-900 transition-all group">
            <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Video className="text-orange-500" size={24} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">Post Video</span>
            <input 
              type="file" 
              accept="video/*" 
              className="hidden" 
              onChange={(e) => handleMediaUpload(e, 'video')} 
              disabled={uploading}
            />
          </label>

          {/* Audio Upload Button */}
          <label className="relative flex flex-col items-center justify-center gap-3 bg-black border border-zinc-800 p-8 rounded-[2rem] cursor-pointer hover:border-orange-500/50 hover:bg-zinc-900 transition-all group">
            <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Music className="text-orange-500" size={24} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">Post Audio</span>
            <input 
              type="file" 
              accept="audio/*" 
              className="hidden" 
              onChange={(e) => handleMediaUpload(e, 'audio')} 
              disabled={uploading}
            />
          </label>
        </div>
        {uploading && (
          <div className="mt-4 flex items-center justify-center gap-2 text-orange-500 font-bold italic text-xs animate-pulse">
            <Loader2 className="animate-spin" size={14} /> UPLOADING TO STAMPEDE...
          </div>
        )}
      </section>

      <div className="h-px bg-white/5 w-full" />

      {/* SECTION: SHOWS / PERFORMANCES */}
      <section>
        <header className="mb-6">
          <h3 className="text-orange-500 font-black uppercase text-xs tracking-[0.3em] italic">Schedule a Show</h3>
          <p className="text-zinc-500 text-[10px] font-bold uppercase mt-1">Let fans know where you're playing next</p>
        </header>

        <div className="space-y-4">
          <div className="relative">
            <input 
              placeholder="Show Name (e.g. Live at Hole in the Wall)" 
              value={eventData.name}
              className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-sm focus:border-orange-500 outline-none transition-all"
              onChange={e => setEventData({...eventData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <input 
                type="date" 
                value={eventData.date}
                className="w-full bg-black border border-zinc-800 p-4 pl-12 rounded-2xl text-sm text-zinc-400 focus:border-orange-500 outline-none transition-all"
                onChange={e => setEventData({...eventData, date: e.target.value})}
              />
            </div>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <input 
                type="time" 
                value={eventData.time}
                className="w-full bg-black border border-zinc-800 p-4 pl-12 rounded-2xl text-sm text-zinc-400 focus:border-orange-500 outline-none transition-all"
                onChange={e => setEventData({...eventData, time: e.target.value})}
              />
            </div>
          </div>

          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
            <input 
              placeholder="Location / Venue" 
              value={eventData.location}
              className="w-full bg-black border border-zinc-800 p-4 pl-12 rounded-2xl text-sm focus:border-orange-500 outline-none transition-all"
              onChange={e => setEventData({...eventData, location: e.target.value})}
            />
          </div>

          <div className="relative">
            <MessageSquare className="absolute left-4 top-4 text-zinc-600" size={16} />
            <textarea 
              placeholder="Extra Info (e.g. $5 cover, 21+ only)" 
              value={eventData.message}
              className="w-full bg-black border border-zinc-800 p-4 pl-12 rounded-2xl text-sm focus:border-orange-500 outline-none transition-all h-24 resize-none"
              onChange={e => setEventData({...eventData, message: e.target.value})}
            />
          </div>

          <button 
            onClick={saveEvent}
            disabled={savingEvent}
            className="w-full bg-white text-black font-black py-4 rounded-2xl uppercase tracking-widest italic hover:bg-orange-600 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {savingEvent ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            {savingEvent ? "Deploying..." : "Add to Schedule"}
          </button>
        </div>
      </section>
    </div>
  );
}