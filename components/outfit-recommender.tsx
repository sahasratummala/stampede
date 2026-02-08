'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, Sparkles, Sun, Search, ChevronDown, Calendar, X, CheckCircle, AlertCircle, ThermometerSun } from 'lucide-react';

// --- TYPES ---
interface Event {
  id: string | number;
  artist?: string;
  title?: string;
  venue: string;
  date: string;
  genre?: string;
  vibe?: string;
}

interface OutfitRecommenderProps {
  events?: Event[];
}

const OutfitRecommender = ({ events = [] }: OutfitRecommenderProps) => {
  const UT_ORANGE = "bg-[#BF5700]";
  const UT_ORANGE_TEXT = "text-[#BF5700]";

  // --- STATE ---
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [mode, setMode] = useState<'upload' | 'feed'>('upload');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<any>(null); // Weather state restored
  const [outfitFeed, setOutfitFeed] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // --- INITIALIZATION ---
  useEffect(() => {
    // 1. Setup Events
    if (events && events.length > 0) {
      const formatted = events.map(e => ({
        ...e,
        artist: e.artist || e.title || "Special Event"
      }));
      setUpcomingEvents(formatted);
      setSelectedEvent(formatted[0]);
    } else {
      const fallbacks: Event[] = [
        { id: 'f1', artist: "No Events Found", venue: "Check Calendar", date: "TBA", genre: "pop", vibe: "casual" }
      ];
      setUpcomingEvents(fallbacks);
      setSelectedEvent(fallbacks[0]);
    }

    // 2. Fetch Weather Immediately on Load
    getWeather().then(data => {
      if(data) setWeather(data);
    });
  }, [events]);

  // --- API HANDLERS ---
  const getWeather = async () => {
    try {
      const response = await fetch('/api/weather');
      return response.ok ? await response.json() : null;
    } catch { return null; }
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera access denied");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      stopCamera();
      setUploadedImage(dataUrl);
      analyzeOutfit(dataUrl);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setUploadedImage(url);
        analyzeOutfit(url);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchOutfitFeed = async () => {
    if (!selectedEvent) return;
    setLoading(true);
    setMode('feed');
    try {
      // Ensure we have weather
      let currentWeather = weather;
      if (!currentWeather) {
          currentWeather = await getWeather();
          setWeather(currentWeather);
      }

      const res = await fetch('/api/outfit-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            artist: selectedEvent.artist,
            weather: currentWeather 
        })
      });
      const data = await res.json();
      setOutfitFeed(data.images || []);
    } finally { setLoading(false); }
  };

  const analyzeOutfit = async (imageData: string) => {
    setLoading(true);
    setMode('upload');
    setAnalysis(null); // Clear previous analysis

    try {
      // Ensure we have weather
      let currentWeather = weather;
      if (!currentWeather) {
          currentWeather = await getWeather();
          setWeather(currentWeather);
      }

      const res = await fetch('/api/analyze-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            image: imageData, 
            artist: selectedEvent?.artist,
            venue: selectedEvent?.venue,
            weather: currentWeather
        })
      });
      setAnalysis(await res.json());
    } catch {
      setAnalysis({ error: "Analysis failed" });
    } finally { setLoading(false); }
  };

  // --- SUB-COMPONENT: DETAILED RESULTS ---
  const AnalysisResults = () => {
    if (!analysis) return null;
    if (analysis.error) return <div className="bg-red-50 p-4 rounded-xl text-red-800 border border-red-200 text-center">{analysis.error}</div>;

    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-white rounded-2xl p-6 shadow-xl border-t-4 border-[#BF5700]">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-black text-2xl ${UT_ORANGE_TEXT} tracking-tighter`}>OVERALL FEEDBACK</h3>
            {/* Star Rating */}
            <div className="flex gap-1 bg-stone-50 p-2 rounded-lg">
              {[...Array(5)].map((_, i) => (
                <Sparkles key={i} className={`w-5 h-5 ${i < (analysis.rating || 0) ? 'fill-[#BF5700] text-[#BF5700]' : 'text-stone-200'}`} />
              ))}
            </div>
          </div>
          <p className="text-stone-700 text-lg leading-relaxed font-medium">{analysis.overallFeedback}</p>
        </div>

        {/* Weather Verdict */}
        {analysis.weatherVerdict && (
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 flex items-start gap-4">
            <div className="bg-blue-100 p-2 rounded-full shrink-0 text-blue-600">
              <ThermometerSun className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-blue-900 text-sm uppercase tracking-wider mb-1">Weather Analysis</h4>
              <p className="text-blue-800 font-medium leading-snug">{analysis.weatherVerdict}</p>
            </div>
          </div>
        )}

        {/* Keep vs Change Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* What to Keep */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5">
            <h4 className="font-bold text-emerald-800 mb-3 flex items-center gap-2 uppercase text-xs tracking-wider">
              <CheckCircle className="w-4 h-4" /> What to Keep
            </h4>
            <ul className="space-y-2">
              {analysis.whatWorks?.map((item: string, idx: number) => (
                <li key={idx} className="text-sm text-emerald-900 flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* What to Change */}
          <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-5">
            <h4 className={`font-bold ${UT_ORANGE_TEXT} mb-3 flex items-center gap-2 uppercase text-xs tracking-wider`}>
              <AlertCircle className="w-4 h-4" /> Possible Changes
            </h4>
            <ul className="space-y-2">
              {analysis.suggestions?.map((item: string, idx: number) => (
                <li key={idx} className="text-sm text-stone-800 flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#BF5700] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // --- UI COMPONENTS ---
  const EventSelector = () => (
    <div className="relative mb-6 z-50">
      <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full bg-white border border-stone-200 rounded-xl p-4 shadow-sm flex items-center justify-between hover:border-[#BF5700] transition-all">
        <div>
          <p className="text-xs font-bold text-stone-400 uppercase mb-1">I'm going to see</p>
          <div className="font-bold text-stone-800 text-lg">{selectedEvent?.artist}</div>
          <div className="text-xs text-stone-500 mt-1 flex items-center gap-2">
            <Calendar className="w-3 h-3" /> {selectedEvent?.date}
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>
      {isDropdownOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-stone-100 max-h-60 overflow-y-auto">
          {upcomingEvents.map((evt) => (
            <button key={evt.id} onClick={() => { setSelectedEvent(evt); setIsDropdownOpen(false); }} className="w-full p-4 text-left hover:bg-stone-50 border-b last:border-0">
              <div className="font-bold text-sm">{evt.artist}</div>
              <div className="text-xs text-stone-500">{evt.venue}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase mb-10 text-black">FIT CHECK</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-5 space-y-6">
            <EventSelector />
            
            {/* Upload Box */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4">
              <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer border-2 border-dashed border-stone-200 rounded-2xl p-6 text-center hover:border-[#BF5700] transition-all">
                <Upload className="mx-auto mb-2 text-stone-300" />
                <p className="font-bold text-stone-600">Upload Gallery</p>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleImageUpload} />
              </div>
              <button onClick={startCamera} className={`w-full ${UT_ORANGE} text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2`}>
                <Camera className="w-5 h-5" /> SNAP PHOTO
              </button>
            </div>

            {/* Weather Widget (Restored) */}
            {weather && (
                <div className="bg-white border border-stone-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm animate-in fade-in">
                    <div className="bg-orange-50 p-3 rounded-full text-[#BF5700]">
                        <Sun className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Current Weather</p>
                        <p className="font-bold text-stone-800 text-lg">
                            {weather.temp}°F <span className="text-stone-300 font-normal">|</span> {weather.condition}
                        </p>
                    </div>
                </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-7">
            {loading ? (
              <div className="h-96 flex flex-col items-center justify-center bg-white rounded-3xl border">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-stone-200 border-t-[#BF5700]" />
              </div>
            ) : uploadedImage ? (
              <div className="space-y-6">
                <div className="relative">
                    <img src={uploadedImage} className="w-full rounded-3xl shadow-xl" alt="Preview" />
                    <button onClick={() => setUploadedImage(null)} className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2"><X /></button>
                </div>
                {/* Full Analysis Component */}
                <AnalysisResults />
              </div>
            ) : mode === 'feed' && outfitFeed.length > 0 ? (
                <div className="columns-2 gap-4">
                    {outfitFeed.map((f, i) => (
                        <div key={i} className="mb-4 break-inside-avoid">
                            <img src={f.src || f.thumbnail} className="rounded-xl w-full" alt={f.title} />
                        </div>
                    ))}
                </div>
            ) : (
              <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl bg-stone-50/50 p-12 text-center">
                <Sparkles className="w-12 h-12 text-stone-200 mb-4" />
                <h3 className="text-2xl font-black text-stone-300 uppercase">Need Ideas?</h3>
                <button onClick={fetchOutfitFeed} className="mt-6 px-8 py-3 bg-white border-2 rounded-xl font-bold hover:border-[#BF5700] transition-all">GET INSPIRATION</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isCameraOpen && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center">
          <video ref={videoRef} autoPlay playsInline className="w-full max-w-md aspect-[3/4] object-cover rounded-2xl" />
          <div className="absolute bottom-10 flex gap-4">
              <button onClick={capturePhoto} className="w-20 h-20 bg-white rounded-full border-8 border-stone-300" />
          </div>
          <button onClick={stopCamera} className="absolute top-10 right-10 text-white bg-white/20 p-2 rounded-full"><X /></button>
        </div>
      )}
    </div>
  );
};

export default OutfitRecommender;
