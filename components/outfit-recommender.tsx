'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, Sparkles, Sun, CheckCircle, AlertCircle, ThermometerSun, Search, ChevronDown, Calendar, MapPin, X } from 'lucide-react';

const OutfitRecommender = ({ events = [] }) => {

  // --- STATE ---
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  const [mode, setMode] = useState('upload'); // 'upload' or 'feed'
  const [uploadedImage, setUploadedImage] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState(null);
  const [outfitFeed, setOutfitFeed] = useState([]);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // --- 0. BROWSER TITLE FIX ---
  useEffect(() => {
    document.title = "Fit Check | Stampede";
  }, []);

  // --- 1. INITIALIZE EVENTS FROM PROP ---
  useEffect(() => {
    if (events && events.length > 0) {
      // Map 'title' to 'artist' for API compatibility
      const formattedEvents = events.map(evt => ({
        ...evt,
        artist: evt.title,
      }));

      setUpcomingEvents(formattedEvents);
      setSelectedEvent(formattedEvents[0]);
      setIsLoadingEvents(false);
    } else {
      const fallbackEvents = [
        { id: 'f1', artist: "No Events Found", venue: "Check Calendar", date: new Date().toISOString().split('T')[0], genre: "pop", vibe: "casual" }
      ];
      setUpcomingEvents(fallbackEvents);
      setSelectedEvent(fallbackEvents[0]);
      setIsLoadingEvents(false);
    }
  }, [events]);

  // --- 2. FETCH WEATHER WHEN EVENT CHANGES ---
  useEffect(() => {
    const fetchEventWeather = async () => {
      if (!selectedEvent || !selectedEvent.date) return;
      try {
        const wRes = await fetch(`/api/weather?date=${selectedEvent.date}`);
        if (wRes.ok) {
          const weatherData = await wRes.json();
          setWeather(weatherData);
        }
      } catch (e) {
        console.error("Weather fetch failed", e);
      }
    };
    fetchEventWeather();
  }, [selectedEvent]);

  // --- API HANDLERS ---
  const getWeather = async () => {
    if (weather) return weather;
    try {
      const eventDate = selectedEvent?.date || new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/weather?date=${eventDate}`);
      if (!response.ok) throw new Error('Weather fetch failed');
      return await response.json();
    } catch (error) {
      return null;
    }
  };

  // --- CAMERA HANDLERS ---
  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Could not access camera. Please allow permissions.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      stopCamera();
      setUploadedImage(dataUrl);
      analyzeOutfit(dataUrl);
    }
  };

  // --- COMPRESSION HELPER ---
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1024;
          const scaleSize = MAX_WIDTH / img.width;
          if (scaleSize < 1) {
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
          } else {
            canvas.width = img.width;
            canvas.height = img.height;
          }
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
      };
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      const compressedDataUrl = await compressImage(file);
      setUploadedImage(compressedDataUrl);
      analyzeOutfit(compressedDataUrl);
    }
  };

  const fetchOutfitFeed = async () => {
    if (!selectedEvent) return;
    setOutfitFeed([]); setLoading(true); setMode('feed'); setUploadedImage(null);
    try {
      let currentWeather = await getWeather();
      const response = await fetch('/api/outfit-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artist: selectedEvent.artist,
          weather: currentWeather
        })
      });
      const data = await response.json();
      setOutfitFeed(data.images || []);
    } catch (error) { console.error("Feed error:", error); } finally { setLoading(false); }
  };

  const analyzeOutfit = async (imageData) => {
    if (!selectedEvent) return;
    setLoading(true); setAnalysis(null); setMode('upload');
    try {
      let currentWeather = await getWeather();
      const response = await fetch('/api/analyze-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageData,
          artist: selectedEvent.artist,
          venue: selectedEvent.venue,
          weather: currentWeather,
        })
      });
      const result = await response.json();
      setAnalysis(result);
    } catch (error) { setAnalysis({ error: 'Failed to analyze outfit.' }); } finally { setLoading(false); }
  };

  // --- SUB-COMPONENTS ---

  const EventSelector = () => {
    if (isLoadingEvents) return <div className="h-24 bg-[var(--card)] rounded-xl animate-pulse mb-8" />;
    if (!selectedEvent) return null;

    return (
      <div className="relative mb-8 z-50">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-sm flex items-center justify-between hover:border-[var(--accent)] transition-all text-left group"
        >
          <div className="flex-1 min-w-0">
            {/* Top Label */}
            <p className="text-sm font-bold text-[var(--muted)] uppercase tracking-wider mb-2 group-hover:text-[var(--accent)] transition-colors">
              I'm going to see
            </p>

            {/* Main Title */}
            <div className="font-bold text-[var(--foreground)] text-3xl flex items-center gap-2 line-clamp-1 mb-3">
              {selectedEvent.artist}
            </div>

            {/* METADATA LINE: Date | Venue | Weather */}
            <div className="text-sm text-[var(--muted)] flex items-center gap-2 flex-wrap font-medium">

              {/* DATE */}
              <Calendar className="w-4 h-4 text-[var(--accent)]" />
              <span>
                {new Date(selectedEvent.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>

              <span className="text-[var(--border)]">|</span>

              {/* VENUE */}
              <MapPin className="w-4 h-4 text-[var(--accent)]" />
              <span>{selectedEvent.venue}</span>

              {/* WEATHER (Moved Here) */}
              {weather && (
                <>
                  <span className="text-[var(--border)]">|</span>
                  <Sun className="w-4 h-4 text-[var(--accent)]" />
                  <span>
                    {weather.temp}°F {weather.condition}
                  </span>
                </>
              )}
            </div>
          </div>
          <ChevronDown className={`w-6 h-6 text-[var(--muted)] transition-transform ${isDropdownOpen ? 'rotate-180' : ''} flex-shrink-0 ml-4`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--card)] rounded-xl shadow-xl border border-[var(--border)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-96 overflow-y-auto z-[60]">
            {upcomingEvents.map((evt) => (
              <button
                key={evt.id}
                onClick={() => {
                  setSelectedEvent(evt);
                  setIsDropdownOpen(false);
                  setUploadedImage(null);
                  setAnalysis(null);
                  setMode('upload');
                  setOutfitFeed([]);
                }}
                className={`w-full p-6 text-left hover:border-l-8 hover:border-[var(--accent)] border-b border-[var(--border)] transition-all ${selectedEvent.id === evt.id ? 'bg-[var(--background)]' : ''}`}
              >
                <div className="font-bold text-[var(--foreground)] text-xl">{evt.artist}</div>
                <div className="text-sm text-[var(--muted)] mt-1">
                  {evt.venue} • {new Date(evt.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const AnalysisResults = () => {
    if (!analysis) return null;
    if (analysis.error) return <div className="bg-red-50 p-6 rounded-xl text-red-800 border border-red-200 text-center text-lg">{analysis.error}</div>;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-[var(--card)] rounded-2xl p-8 shadow-xl border-t-8 border-[var(--accent)]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-3xl text-[var(--accent)] tracking-tighter uppercase">Overall Feedback</h3>
            <div className="flex gap-1 bg-[var(--background)] p-2 rounded-lg">
              {[...Array(5)].map((_, i) => (
                <Sparkles key={i} className={`w-8 h-8 ${i < analysis.rating ? 'fill-[var(--accent)] text-[var(--accent)]' : 'text-[var(--border)]'}`} />
              ))}
            </div>
          </div>
          <p className="text-[var(--foreground)] text-xl leading-relaxed font-medium">{analysis.overallFeedback}</p>
        </div>

        {analysis.weatherVerdict && (
          <div className="bg-blue-50/10 border border-blue-200/30 rounded-xl p-6 flex items-start gap-5">
            <div className="bg-blue-100/20 p-3 rounded-full shrink-0 text-blue-400">
              <ThermometerSun className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-blue-400 text-base uppercase tracking-wider mb-2">Weather Analysis</h4>
              <p className="text-[var(--foreground)] text-lg font-medium leading-normal">{analysis.weatherVerdict}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-emerald-50/10 border border-emerald-100/30 rounded-xl p-6">
            <h4 className="font-bold text-emerald-500 mb-4 flex items-center gap-2 uppercase text-sm tracking-wider">
              <CheckCircle className="w-5 h-5" /> What to Keep
            </h4>
            <ul className="space-y-3">
              {analysis.whatWorks?.map((item, idx) => (
                <li key={idx} className="text-base text-[var(--foreground)] flex items-start gap-3">
                  <span className="mt-2 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-orange-50/10 border border-orange-100/30 rounded-xl p-6">
            <h4 className="font-bold text-[var(--accent)] mb-4 flex items-center gap-2 uppercase text-sm tracking-wider">
              <AlertCircle className="w-5 h-5" /> Possible Changes
            </h4>
            <ul className="space-y-3">
              {analysis.suggestions?.map((item, idx) => (
                <li key={idx} className="text-base text-[var(--foreground)] flex items-start gap-3">
                  <span className="mt-2 w-2 h-2 rounded-full bg-[var(--accent)] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const OutfitFeed = () => (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-bold text-[var(--foreground)] text-4xl tracking-tight">
          Trending for <span className="text-[var(--accent)] italic">{selectedEvent?.artist}</span>
        </h3>
        <button onClick={() => { setOutfitFeed([]); setMode('upload'); }} className="text-[var(--muted)] hover:text-[var(--foreground)] p-2">
          <X className="w-8 h-8" />
        </button>
      </div>

      <div className="columns-2 md:columns-3 lg:columns-3 gap-6 space-y-6">
        {outfitFeed.map((img, idx) => (
          <a key={idx} href={img.link} target="_blank" rel="noopener noreferrer" className="break-inside-avoid inline-block w-full mb-6 group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 bg-[var(--card)]">
            <img src={img.src || img.thumbnail} alt={img.title} loading="lazy" className="w-full h-auto object-cover transition-opacity duration-700 opacity-0 data-[loaded=true]:opacity-100" onLoad={(e) => e.target.setAttribute('data-loaded', 'true')} onError={(e) => { e.target.style.display = 'none'; }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
              <p className="text-white text-sm font-bold line-clamp-2 leading-snug">{img.title}</p>
              <div className="flex items-center gap-1 text-white/70 text-xs mt-2 uppercase tracking-wider">
                <span>{img.source}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300 font-sans pb-32">
      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* --- HEADER --- */}
        <div className="mb-6 text-center lg:text-left">
          <h2 className="text-4xl md:text-[6xl] font-black italic uppercase tracking-tighter leading-[0.8] text-[var(--foreground)] transition-colors">
            FIT CHECK
          </h2>
        </div>

        {/* --- MAIN GRID LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

          {/* --- LEFT COLUMN: CONTROLS (Sticky) --- */}
          <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-8">
            <EventSelector />

            {/* Action Card */}
            <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-3 shadow-sm">
              <div className="p-8 space-y-6">
                <div onClick={() => fileInputRef.current?.click()} className="group cursor-pointer rounded-2xl border-4 border-dashed border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--background)] p-10 text-center transition-all duration-200">
                  <Upload className="w-12 h-12 mx-auto text-[var(--muted)] group-hover:text-[var(--accent)] mb-4 transition-colors" />
                  <p className="font-bold text-[var(--foreground)] text-xl">Upload from Gallery</p>
                  <p className="text-sm text-[var(--muted)] mt-1">JPG or PNG</p>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </div>

                <button onClick={startCamera} className="w-full bg-[var(--accent)] text-black font-black text-lg py-5 rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-3 uppercase tracking-wide hover:brightness-110">
                  <Camera className="w-6 h-6" />
                  SNAP PHOTO
                </button>
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: RESULTS / FEED --- */}
          <div className="lg:col-span-7">

            {/* A. Loading State */}
            {loading && (
              <div className="h-[500px] flex flex-col items-center justify-center bg-[var(--card)] rounded-3xl border border-[var(--border)] shadow-sm">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-[6px] border-[var(--border)] border-t-[var(--accent)]"></div>
                <p className="mt-6 text-[var(--foreground)] font-bold text-2xl animate-pulse">
                  {mode === 'feed' ? 'Curating Looks...' : 'Consulting the Stylist...'}
                </p>
              </div>
            )}

            {/* B. Analysis Results (When Uploaded) */}
            {!loading && mode === 'upload' && uploadedImage && (
              <div className="space-y-8">
                <div className="relative group rounded-3xl overflow-hidden shadow-2xl border-8 border-[var(--card)] bg-[var(--background)]">
                  <img src={uploadedImage} alt="Your outfit" className="w-full h-auto max-h-[700px] object-contain mx-auto" />
                  <button onClick={() => { setUploadedImage(null); setAnalysis(null); }} className="absolute top-6 right-6 bg-black/60 backdrop-blur-md text-white rounded-full p-3 hover:bg-[var(--accent)] transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <AnalysisResults />
              </div>
            )}

            {/* C. Outfit Feed */}
            {!loading && mode === 'feed' && outfitFeed.length > 0 && <OutfitFeed />}

            {/* D. Empty State (Get Inspiration CTA) */}
            {!loading && !uploadedImage && outfitFeed.length === 0 && (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center border-4 border-dashed border-[var(--border)] rounded-3xl bg-[var(--card)]/50 p-16 text-center group hover:border-[var(--accent)]/50 transition-colors">
                <div className="bg-[var(--card)] p-8 rounded-full shadow-sm mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-16 h-16 text-[var(--accent)]" />
                </div>
                <h3 className="text-5xl font-black italic tracking-tighter text-[var(--muted)] mb-4 uppercase opacity-50">Need Ideas?</h3>
                <p className="text-[var(--muted)] text-xl max-w-md font-medium mb-10 leading-relaxed">
                  Not sure what to wear? Let us curate a list of trending outfits for {selectedEvent?.artist || 'the event'}.
                </p>
                <button onClick={fetchOutfitFeed} className="px-10 py-5 bg-[var(--card)] text-[var(--foreground)] font-bold text-lg rounded-xl border-2 border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] shadow-sm hover:shadow-xl transition-all flex items-center gap-4">
                  <Search className="w-6 h-6" />
                  GET INSPIRATION
                </button>
              </div>
            )}
          </div>
        </div>

        {/* --- LIVE CAMERA MODAL --- */}
        {isCameraOpen && (
          <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center animate-in fade-in duration-200">
            <button onClick={stopCamera} className="absolute top-8 right-8 text-white bg-white/20 p-4 rounded-full backdrop-blur-md z-10 hover:bg-white/30 transition-colors">
              <X className="w-8 h-8" />
            </button>
            <div className="w-full h-full relative flex items-center justify-center bg-black">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover md:max-w-md md:h-auto md:rounded-2xl md:aspect-[3/4]" />
            </div>
            <div className="absolute bottom-12 left-0 right-0 flex justify-center pb-safe">
              <button onClick={capturePhoto} className="w-24 h-24 bg-white rounded-full border-4 border-stone-300 shadow-2xl flex items-center justify-center active:scale-90 transition-transform duration-100">
                <div className="w-20 h-20 bg-white rounded-full border-2 border-stone-200 ring-1 ring-black/5"></div>
              </button>
            </div>
            <p className="absolute bottom-40 text-white/90 text-base font-bold bg-black/50 px-6 py-2 rounded-full backdrop-blur-md">
              Position outfit in frame
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutfitRecommender;