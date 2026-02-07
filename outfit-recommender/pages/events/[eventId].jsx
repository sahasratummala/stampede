// pages/events/[eventId].jsx
// Example integration of OutfitRecommender into event detail page

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import OutfitRecommender from '../../components/outfit-recommender';

export default function EventDetailPage() {
  const router = useRouter();
  const { eventId } = router.query;
  
  const [event, setEvent] = useState(null);
  const [artistInfo, setArtistInfo] = useState(null);
  const [showOutfitRec, setShowOutfitRec] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      // Fetch event from your backend or SerpAPI
      const eventResponse = await fetch(`/api/events/${eventId}`);
      const eventData = await eventResponse.json();
      setEvent(eventData);

      // Fetch artist info using SerpAPI
      const artistResponse = await fetch('/api/artist-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistName: eventData.artist })
      });
      const artistData = await artistResponse.json();
      setArtistInfo(artistData);

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch event details:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!event) {
    return <div className="p-8 text-center">Event not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Event Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-start gap-6">
            {event.image && (
              <img 
                src={event.image} 
                alt={event.artist}
                className="w-48 h-48 rounded-lg shadow-lg object-cover"
              />
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{event.artist}</h1>
              <p className="text-xl mb-4">{event.venue}</p>
              <div className="flex gap-4 text-sm">
                <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                <span>🕐 {event.time}</span>
                {artistInfo?.genre && <span>🎵 {artistInfo.genre}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Event Description */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">About This Show</h2>
              <p className="text-gray-700">{event.description}</p>
            </div>

            {/* Artist Info */}
            {artistInfo && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">About {event.artist}</h2>
                <p className="text-gray-700 mb-4">{artistInfo.description}</p>
                {artistInfo.concertStyle && artistInfo.concertStyle.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Concert Vibe</h3>
                    <ul className="space-y-2">
                      {artistInfo.concertStyle.slice(0, 3).map((style, idx) => (
                        <li key={idx} className="text-sm text-gray-600">• {style}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Outfit Recommender Section */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-purple-900">
                    What Should I Wear? 👕
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Get AI-powered outfit recommendations for this show
                  </p>
                </div>
                <button
                  onClick={() => setShowOutfitRec(!showOutfitRec)}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  {showOutfitRec ? 'Hide' : 'Try It Out'}
                </button>
              </div>

              {showOutfitRec && (
                <div className="mt-6 bg-white rounded-lg p-4">
                  <OutfitRecommender 
                    event={event}
                    artistInfo={artistInfo}
                  />
                </div>
              )}

              {/* Quick Outfit Tips Preview */}
              {!showOutfitRec && artistInfo?.recommendations && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {artistInfo.recommendations.styling?.slice(0, 4).map((tip, idx) => (
                    <div key={idx} className="bg-white/60 rounded px-3 py-2 text-sm">
                      ✓ {tip}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Concert Images */}
            {artistInfo?.concertImages && artistInfo.concertImages.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Concert Style Inspo</h2>
                <div className="grid grid-cols-3 gap-4">
                  {artistInfo.concertImages.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.url}
                      alt={img.title}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Quick Info */}
          <div className="space-y-6">
            
            {/* Ticket Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">Ticket Info</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Price Range</p>
                  <p className="font-semibold">{event.priceRange || 'Varies'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold text-green-600">
                    {event.status || 'On Sale'}
                  </p>
                </div>
                <button className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                  Get Tickets
                </button>
              </div>
            </div>

            {/* Find Concert Buddy */}
            <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-2">Going Solo?</h3>
              <p className="text-sm text-gray-700 mb-4">
                Find a concert buddy! Match with other UT students attending this show.
              </p>
              <button className="w-full bg-pink-500 text-white py-2 rounded-lg font-semibold hover:bg-pink-600 transition-colors">
                Find a Buddy 🤝
              </button>
            </div>

            {/* Venue Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">Venue Details</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Location:</strong> Moody Center</p>
                <p><strong>Address:</strong> 2001 Robert Dedman Dr</p>
                <p><strong>Capacity:</strong> 15,000</p>
                <p className="text-gray-600 text-xs mt-3">
                  💡 Tip: Venue has strong AC - bring a light layer!
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
