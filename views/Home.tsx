
import React, { useEffect, useState } from 'react';
import { getUpcomingEvents, getArtistInfo } from '../services/geminiService';
import { ConcertEvent } from '../types';
import GroundingSources from '../components/GroundingSources';

const Home: React.FC = () => {
  const [moodyEvents, setMoodyEvents] = useState<ConcertEvent[]>([]);
  const [butlerEvents, setButlerEvents] = useState<ConcertEvent[]>([]);
  const [moodyGrounding, setMoodyGrounding] = useState<any[]>([]);
  const [butlerGrounding, setButlerGrounding] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Moody' | 'Butler'>('Moody');
  const [selectedArtist, setSelectedArtist] = useState<{name: string, info: string, sources: any[]} | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [moodyRes, butlerRes] = await Promise.all([
        getUpcomingEvents('Moody Center'),
        getUpcomingEvents('Butler School of Music')
      ]);
      setMoodyEvents(moodyRes.events);
      setMoodyGrounding(moodyRes.grounding);
      setButlerEvents(butlerRes.events);
      setButlerGrounding(butlerRes.grounding);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleLearnMore = async (artist: string) => {
    setSelectedArtist({ name: artist, info: 'Loading artist profile...', sources: [] });
    const info = await getArtistInfo(artist);
    setSelectedArtist({ name: artist, info: info.text || 'No info found.', sources: info.sources });
  };

  const currentEvents = activeTab === 'Moody' ? moodyEvents : butlerEvents;
  const currentGrounding = activeTab === 'Moody' ? moodyGrounding : butlerGrounding;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden mb-12 h-[350px] shadow-2xl">
        <img 
          src={activeTab === 'Moody' ? "https://picsum.photos/1200/600?concert" : "https://picsum.photos/1200/600?classical"} 
          className="w-full h-full object-cover brightness-[0.4]"
          alt="Venue"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
          <span className="bg-burnt-orange text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">UT Student Exclusive</span>
          <h2 className="text-6xl font-bebas text-white mb-2 tracking-wide">
            {activeTab === 'Moody' ? 'The Moody Experience' : 'Butler School of Music'}
          </h2>
          <p className="text-white/80 max-w-xl text-lg">
            {activeTab === 'Moody' ? 'World-class stadium shows, right here on campus.' : 'Bates Recital Hall & more. Discover the future of classical and jazz.'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex bg-gray-100 p-1.5 rounded-2xl border">
          <button 
            onClick={() => setActiveTab('Moody')}
            className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center ${activeTab === 'Moody' ? 'bg-white text-burnt-orange shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <i className="fas fa-stadium mr-2"></i> Moody Center
          </button>
          <button 
            onClick={() => setActiveTab('Butler')}
            className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center ${activeTab === 'Butler' ? 'bg-white text-burnt-orange shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <i className="fas fa-music mr-2"></i> Butler School of Music
          </button>
        </div>
      </div>

      {/* Event Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-2xl"></div>)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {currentEvents.map(event => (
              <div key={event.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col group">
                <div className="relative h-40 overflow-hidden">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 text-white">
                    <p className="text-[10px] font-black uppercase tracking-tighter opacity-80">{event.date}</p>
                    <h4 className="font-bebas text-xl tracking-wide">{event.artist}</h4>
                  </div>
                </div>
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-burnt-orange uppercase mb-1 block">{event.category}</span>
                    <p className="text-gray-600 text-xs line-clamp-3 mb-4">{event.description}</p>
                  </div>
                  <div className="space-y-2">
                    <button 
                      onClick={() => handleLearnMore(event.artist)}
                      className="w-full py-2 bg-gray-50 hover:bg-burnt-orange/10 text-gray-700 hover:text-burnt-orange border border-gray-200 rounded-lg text-xs font-bold transition"
                    >
                      Artist Info & Descriptions
                    </button>
                    <button className="w-full py-2 bg-charcoal text-white rounded-lg text-xs font-bold hover:bg-black transition">
                      Student Tickets
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 mb-10">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Event Search Results Source</h4>
            <GroundingSources sources={currentGrounding} />
          </div>
        </>
      )}

      {/* Artist Info Modal */}
      {selectedArtist && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col animate-scale-in">
            <div className="p-6 border-b flex justify-between items-center bg-burnt-orange text-white">
              <h3 className="text-3xl font-bebas tracking-wider">{selectedArtist.name}</h3>
              <button onClick={() => setSelectedArtist(null)} className="hover:rotate-90 transition-transform">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-8 overflow-y-auto">
              <div className="prose prose-burnt-orange max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedArtist.info}</p>
              </div>
              <GroundingSources sources={selectedArtist.sources} />
            </div>
            <div className="p-6 bg-gray-50 border-t flex justify-end">
              <button 
                onClick={() => setSelectedArtist(null)}
                className="px-6 py-2 bg-white border border-gray-300 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-100 transition"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
