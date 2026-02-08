"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, MapPin, Calendar, Clock, MessageSquare, Plus } from "lucide-react";

export default function EventCreator({ artistId }: { artistId: string }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location || !date) return alert("Fill out the required fields!");

    setLoading(true);
    // Explicitly logging the data we are sending
    const payload = {
      artist_id: artistId,
      name: name,
      location: location,
      event_date: date,
      event_time: time,
      message: message
    };

    const { error } = await supabase.from("events").insert([payload]);

    if (error) {
      console.error("Supabase Error Details:", error);
      alert(`Error: ${error.message || "Check console for details"}`);
    } else {
      alert("Performance Scheduled!");
      window.location.reload();
    }
    setLoading(false);
  };

  return (
    <div className="bg-zinc-950 p-8 rounded-[2.5rem] border border-white/5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="VENUE OR EVENT NAME *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-black border border-white/10 p-5 rounded-2xl font-bold text-xs uppercase tracking-widest text-white focus:border-orange-500 outline-none"
          />
          <input
            type="text"
            placeholder="LOCATION (E.G. AUSTIN, TX) *"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-black border border-white/10 p-5 rounded-2xl font-bold text-xs uppercase tracking-widest text-white focus:border-orange-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Calendar className="absolute left-5 top-5 text-zinc-600" size={16} />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-black border border-white/10 p-5 pl-12 rounded-2xl font-bold text-xs uppercase tracking-widest text-white focus:border-orange-500 outline-none"
              style={{ colorScheme: 'dark' }}
            />
          </div>
          <div className="relative">
            <Clock className="absolute left-5 top-5 text-zinc-600" size={16} />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-black border border-white/10 p-5 pl-12 rounded-2xl font-bold text-xs uppercase tracking-widest text-white focus:border-orange-500 outline-none"
              style={{ colorScheme: 'dark' }}
            />
          </div>
        </div>

        <textarea
          placeholder="ADD A MESSAGE (E.G. 'TICKETS AT THE DOOR', '21+ ONLY')"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="w-full bg-black border border-white/10 p-5 rounded-2xl font-bold text-xs uppercase tracking-widest text-white focus:border-orange-500 outline-none resize-none"
        />

        <button
          disabled={loading}
          className="w-full bg-orange-600 text-white font-black py-5 rounded-2xl hover:bg-orange-500 transition-all uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : (
            <><Plus size={16} />Schedule Performance</>
          )}
        </button>
      </form>
    </div>
  );
}