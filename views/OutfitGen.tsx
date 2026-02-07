
import React, { useState, useRef } from 'react';
import { analyzeOutfit, getOutfitTrends } from '../services/geminiService';
import { OutfitSuggestion } from '../types';
import GroundingSources from '../components/GroundingSources';

const OutfitGen: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [artist, setArtist] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<OutfitSuggestion | null>(null);
  const [trends, setTrends] = useState<{text: string, sources: any[]} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!artist) return;
    setLoading(true);
    setError(null);
    try {
      const trendPromise = getOutfitTrends(artist);
      let analysisPromise = null;
      
      if (image) {
        const base64 = image.split(',')[1];
        analysisPromise = analyzeOutfit(base64, artist);
      }

      const [trendRes, analysisRes] = await Promise.all([trendPromise, analysisPromise]);
      
      setTrends(trendRes);
      if (analysisRes) setSuggestion(analysisRes);
    } catch (e: any) {
      if (e.message === 'QUOTA_EXCEEDED') {
        setError("Rate limit exceeded. Please wait a moment and try again.");
      } else {
        setError("Something went wrong while generating recommendations.");
      }
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bebas text-burnt-orange mb-4 tracking-wider">Mood Style Engine</h2>
        <p className="text-gray-600">Combine your wardrobe with real-time tour trends to find the perfect concert fit.</p>
      </div>

      {error && (
        <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
          <i className="fas fa-exclamation-circle text-lg"></i>
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Step 1 & 2: Input */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h3 className="font-bebas text-2xl text-gray-900 mb-4 tracking-wide">1. Event Context</h3>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Artist or Tour Name</label>
            <input 
              type="text" 
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="e.g. Billie Eilish Hit Me Hard Tour"
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-burnt-orange focus:border-transparent outline-none text-sm"
            />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h3 className="font-bebas text-2xl text-gray-900 mb-4 tracking-wide">2. Your Closet (Optional)</h3>
            <div 
              className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[200px] cursor-pointer hover:border-burnt-orange transition group"
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept="image/*" />
              {image ? (
                <img src={image} className="w-full h-40 object-cover rounded-xl" alt="Preview" />
              ) : (
                <>
                  <i className="fas fa-camera text-3xl text-gray-300 group-hover:text-burnt-orange transition mb-3"></i>
                  <p className="text-xs text-center text-gray-500 font-medium">Upload what you're planning to wear for personalized AI advice</p>
                </>
              )}
            </div>
          </div>

          <button 
            disabled={!artist || loading}
            onClick={handleAnalyze}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition flex items-center justify-center ${
              !artist || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-burnt-orange hover:bg-orange-700'
            }`}
          >
            {loading ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-search mr-2"></i>}
            {loading ? 'Fetching Trends...' : 'Search Trends & Get Ideas'}
          </button>
        </div>

        {/* Results: Trends & Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {!trends && !suggestion ? (
            <div className="bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 h-full min-h-[400px] flex flex-col items-center justify-center text-gray-400 p-10 text-center">
              <i className="fas fa-wand-magic-sparkles text-5xl mb-6 opacity-20"></i>
              <h4 className="text-xl font-bold mb-2">The Style Engine is Ready</h4>
              <p className="text-sm max-w-xs">Enter an artist to see what fans are wearing and get personalized outfit improvements.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 h-full">
              {/* Trends Box */}
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col animate-fade-in">
                <div className="mb-6">
                  <span className="text-[10px] font-black text-burnt-orange uppercase tracking-[0.2em] mb-2 block">Real-Time Search Results</span>
                  <h3 className="text-3xl font-bebas text-gray-900 tracking-wide">{artist} Trend Report</h3>
                </div>
                <div className="flex-grow">
                  <p className="text-sm text-gray-600 leading-relaxed italic mb-6">"{trends?.text}"</p>
                  <GroundingSources sources={trends?.sources || []} />
                </div>
              </div>

              {/* Suggestions Box */}
              <div className="bg-burnt-orange/5 p-8 rounded-3xl border border-burnt-orange/10 shadow-sm flex flex-col animate-fade-in delay-100">
                <div className="mb-6">
                  <span className="text-[10px] font-black text-burnt-orange uppercase tracking-[0.2em] mb-2 block">AI Tailored Advice</span>
                  <h3 className="text-3xl font-bebas text-gray-900 tracking-wide">The Recommended Look</h3>
                </div>
                {suggestion ? (
                  <div className="space-y-4 flex-grow">
                    <p className="text-lg font-bold text-burnt-orange">{suggestion.vibe}</p>
                    <p className="text-sm text-gray-700">{suggestion.description}</p>
                    <div className="bg-white/50 p-4 rounded-xl border border-burnt-orange/20">
                      <h4 className="text-xs font-bold mb-2 uppercase tracking-widest text-gray-500">Must-Have Items</h4>
                      <ul className="grid grid-cols-1 gap-1">
                        {suggestion.items.map((it, i) => (
                          <li key={i} className="text-xs flex items-start">
                            <i className="fas fa-plus text-[10px] mt-1 mr-2 text-burnt-orange"></i>
                            {it}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex-grow flex items-center justify-center text-center p-6 bg-white/30 rounded-2xl border border-dashed border-burnt-orange/20">
                    <p className="text-xs text-burnt-orange font-medium">Upload a photo to get specific advice for your current look!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutfitGen;
