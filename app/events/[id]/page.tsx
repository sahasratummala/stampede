"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // Use this instead of useRouter
import OutfitRecommender from '@/components/outfit-recommender';

export default function EventDetailPage() {
  // useParams() gets the "id" from the folder name [id]
  const params = useParams();
  const eventId = params.id;
  
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      // Fetch from your internal API
      const response = await fetch('/api/get-events');
      const data = await response.json();
      
      // Find the specific event matching the ID in the URL
      const foundEvent = data.events.find((e: any) => e.id === eventId);
      setEvent(foundEvent);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse">Loading Event...</div>;
  if (!event) return <div className="p-20 text-center">Event not found.</div>;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header Section */}
      <div className="bg-[#BF5700] p-12 text-white">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter">
            {event.artist}
          </h1>
          <p className="text-xl font-bold opacity-90 mt-2">{event.venue}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
            <h2 className="text-2xl font-bold mb-4">The Vibe</h2>
            <p className="text-stone-600">This {event.genre} show at {event.venue} is going to be legendary.</p>
          </div>

          {/* Outfit Recommender Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden">
             <div className="bg-stone-900 p-4 text-white text-center font-bold tracking-widest uppercase text-sm">
                FitCheck Stylist Enabled
             </div>
             <div className="p-2">
                <OutfitRecommender event={event} />
             </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-stone-200">
            <h3 className="font-bold text-stone-400 uppercase text-xs mb-4">Event Info</h3>
            <p className="font-bold text-lg">{event.date}</p>
            <button className="w-full mt-4 bg-stone-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-colors">
              Get Tickets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}