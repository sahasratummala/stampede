import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, Sparkles, Sun, CheckCircle, AlertCircle, ThermometerSun, Search, ChevronDown, Calendar, MapPin, X, ArrowRight } from 'lucide-react';

const OutfitRecommender = ({ event: initialEvent = null } = {}) => {
  // --- CONFIGURATION ---
  const UT_ORANGE = "bg-[#BF5700]";
  const UT_ORANGE_TEXT = "text-[#BF5700]";

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
    document.title = "Fit Check";
  }, []);

  // --- 1. FETCH EVENTS ON LOAD ---
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/get-events');
        const data = await res.json();

        if (data.events && data.events.length > 0) {
          setUpcomingEvents(data.events);
          setSelectedEvent(data.events[0]);
        } else {
          throw new Error("No events found");
        }
      } catch (err) {
        console.warn("Using fallback events:", err);
        const fallbackEvents = [
          { id: 'f1', artist: "Taylor Swift", venue: "Moody Center", date: "Upcoming", genre: "pop", vibe: "sparkly" },
          { id: 'f2', artist: "UT Jazz Orchestra", venue: "Butler School", date: "Feb 20", genre: "jazz", vibe: "smart casual" }
        ];
        setUpcomingEvents(fallbackEvents);
        setSelectedEvent(fallbackEvents[0]);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  // --- API HANDLERS ---
  const getWeather = async () => {
    try {
      const response = await fetch('/api/weather');
      if (!response.ok) throw new Error('Weather fetch failed');
      return await response.json();
    } catch (error) {
      console.error('Weather error:', error);
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
      console.error("Camera error:", err);
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

          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(dataUrl);
        };
      };
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      try {
        const compressedDataUrl = await compressImage(file);
        setUploadedImage(compressedDataUrl);
        analyzeOutfit(compressedDataUrl);
      } catch (error) {
        console.error("Compression failed:", error);
        setLoading(false);
      }
    }
  };

  const fetchOutfitFeed = async () => {
    if (!selectedEvent) return;

    setOutfitFeed([]);
    setLoading(true);
    setMode('feed');
    setUploadedImage(null); // Clear any uploaded image so we see the feed

    try {
      let currentWeather = weather;
      if (!currentWeather) {
        currentWeather = await getWeather();
        setWeather(currentWeather);
      }

      const response = await fetch('/api/outfit-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artist: selectedEvent.artist,
          genre: selectedEvent.genre,
          vibe: selectedEvent.vibe,
          weather: currentWeather
        })
      });

      if (!response.ok) throw new Error('Fetch failed');
      const data = await response.json();
      setOutfitFeed(data.images || []);
    } catch (error) {
      console.error("Feed error:", error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeOutfit = async (imageData) => {
    if (!selectedEvent) return;
    setLoading(true);
    setAnalysis(null);
    setMode('upload');

    try {
      let currentWeather = weather;
      if (!currentWeather) {
        currentWeather = await getWeather();
        setWeather(currentWeather);
      }

      const response = await fetch('/api/analyze-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageData,
          artist: selectedEvent.artist,
          venue: selectedEvent.venue,
          genre: selectedEvent.genre,
          weather: currentWeather,
        })
      });

      if (!response.ok) throw new Error(await response.text());
      const result = await response.json();
      setAnalysis(result);

    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysis({ error: 'Failed to analyze outfit.' });
    } finally {
      setLoading(false);
    }
  };

  // --- SUB-COMPONENTS ---

  const EventSelector = () => {
    if (isLoadingEvents) return <div className="h-20 bg-stone-100 rounded-xl animate-pulse mb-6" />;
    if (!selectedEvent) return null;

    return (
      <div className="relative mb-6 z-50">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full bg-white border border-stone-200 rounded-xl p-4 shadow-sm flex items-center justify-between hover:border-[#BF5700] transition-all text-left group"
        >
          <div>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1 group-hover:text-[#BF5700] transition-colors">I'm going to see</p>
            <div className="font-bold text-stone-800 text-lg flex items-center gap-2 line-clamp-1">
              {selectedEvent.artist}
            </div>
            <div className="text-xs text-stone-500 mt-1 flex items-center gap-2">
              <Calendar className="w-3 h-3" /> {selectedEvent.date}
              <span className="text-stone-300">|</span>
              <MapPin className="w-3 h-3" /> {selectedEvent.venue}
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-stone-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-72 overflow-y-auto">
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
                className={`w-full p-4 text-left hover:bg-stone-50 border-b border-stone-50 transition-colors ${selectedEvent.id === evt.id ? 'bg-orange-50/50' : ''}`}
              >
                <div className="font-bold text-stone-800 text-sm">{evt.artist}</div>
                <div className="text-xs text-stone-500 mt-0.5">{evt.venue} • {evt.date}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const AnalysisResults = () => {
    if (!analysis) return null;
    if (analysis.error) return <div className="bg-red-50 p-4 rounded-xl text-red-800 border border-red-200 text-center">{analysis.error}</div>;

    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-white rounded-2xl p-6 shadow-xl border-t-4 border-[#BF5700]">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-black text-2xl ${UT_ORANGE_TEXT} tracking-tighter`}>OVERALL FEEDBACK</h3>
            <div className="flex gap-1 bg-stone-50 p-2 rounded-lg">
              {[...Array(5)].map((_, i) => (
                <Sparkles key={i} className={`w-6 h-6 ${i < analysis.rating ? 'fill-[#BF5700] text-[#BF5700]' : 'text-stone-200'}`} />
              ))}
            </div>
          </div>
          <p className="text-stone-700 text-lg leading-relaxed font-medium">{analysis.overallFeedback}</p>
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5">
            <h4 className="font-bold text-emerald-800 mb-3 flex items-center gap-2 uppercase text-xs tracking-wider">
              <CheckCircle className="w-4 h-4" /> What to Keep
            </h4>
            <ul className="space-y-2">
              {analysis.whatWorks?.map((item, idx) => (
                <li key={idx} className="text-sm text-emerald-900 flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-5">
            <h4 className={`font-bold ${UT_ORANGE_TEXT} mb-3 flex items-center gap-2 uppercase text-xs tracking-wider`}>
              <AlertCircle className="w-4 h-4" /> Possible Changes
            </h4>
            <ul className="space-y-2">
              {analysis.suggestions?.map((item, idx) => (
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

  const OutfitFeed = () => (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-stone-800 text-2xl">
          Trending for <span className={UT_ORANGE_TEXT}>{selectedEvent?.artist}</span>
        </h3>
        {/* Optional: Close button if you want to reset */}
        <button onClick={() => setOutfitFeed([])} className="text-stone-400 hover:text-stone-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="columns-2 md:columns-3 lg:columns-3 gap-4 space-y-4">
        {outfitFeed.map((img, idx) => (
          <a
            key={idx}
            href={img.link}
            target="_blank"
            rel="noopener noreferrer"
            className="break-inside-avoid inline-block w-full mb-4 group relative rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-stone-200"
          >
            <img
              src={img.src || img.thumbnail}
              alt={img.title}
              loading="lazy"
              className="w-full h-auto object-cover transition-opacity duration-700 opacity-0 data-[loaded=true]:opacity-100"
              onLoad={(e) => e.target.setAttribute('data-loaded', 'true')}
              onError={(e) => { e.target.style.display = 'none'; }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <p className="text-white text-xs font-bold line-clamp-2 leading-snug">{img.title}</p>
              <div className="flex items-center gap-1 text-white/70 text-[10px] mt-2 uppercase tracking-wider">
                <span>{img.source}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 font-sans pb-20">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* --- HEADER --- */}
        <div className="mb-10 text-center lg:text-left">
          <h2 className="text-6xl md:text-7xl lg:text-8xl font-black italic tracking-tighter uppercase leading-none text-black">
            FIT CHECK
          </h2>
        </div>

        {/* --- MAIN GRID LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* --- LEFT COLUMN: CONTROLS (Sticky) --- */}
          <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-6">

            {/* 1. Event Selector */}
            <EventSelector />

            {/* 2. Action Card (UPLOAD ONLY) */}
            <div className="bg-white rounded-3xl border border-stone-200 p-2 shadow-sm">
              <div className="p-6 space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group cursor-pointer rounded-2xl border-2 border-dashed border-stone-200 hover:border-[#BF5700] hover:bg-orange-50/10 p-6 text-center transition-all duration-200"
                >
                  <Upload className="w-8 h-8 mx-auto text-stone-300 group-hover:text-[#BF5700] mb-2 transition-colors" />
                  <p className="font-bold text-stone-600">Upload from Gallery</p>
                  <p className="text-xs text-stone-400">JPG or PNG</p>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </div>

                <button
                  onClick={startCamera}
                  className={`w-full ${UT_ORANGE} text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-900/20 active:scale-95 transition-transform flex items-center justify-center gap-2`}
                >
                  <Camera className="w-5 h-5" />
                  SNAP PHOTO
                </button>
              </div>
            </div>

            {/* Weather Widget */}
            {weather && (
              <div className="bg-white border border-stone-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
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

          {/* --- RIGHT COLUMN: RESULTS / FEED --- */}
          <div className="lg:col-span-7">

            {/* A. Loading State */}
            {loading && (
              <div className="h-96 flex flex-col items-center justify-center bg-white rounded-3xl border border-stone-100 shadow-sm">
                <div className={`inline-block animate-spin rounded-full h-12 w-12 border-[5px] border-stone-200 border-t-[#BF5700]`}></div>
                <p className="mt-4 text-stone-800 font-bold text-lg animate-pulse">
                  {mode === 'feed' ? 'Curating Looks...' : 'Consulting the Stylist...'}
                </p>
              </div>
            )}

            {/* B. Analysis Results (When Uploaded) */}
            {!loading && mode === 'upload' && uploadedImage && (
              <div className="space-y-6">
                <div className="relative group rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-stone-100">
                  <img src={uploadedImage} alt="Your outfit" className="w-full h-auto max-h-[600px] object-contain mx-auto" />
                  <button
                    onClick={() => { setUploadedImage(null); setAnalysis(null); }}
                    className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white rounded-full p-2 hover:bg-[#BF5700] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <AnalysisResults />
              </div>
            )}

            {/* C. Outfit Feed */}
            {!loading && mode === 'feed' && outfitFeed.length > 0 && (
              <OutfitFeed />
            )}

            {/* D. Empty State (Get Inspiration CTA) */}
            {!loading && !uploadedImage && outfitFeed.length === 0 && (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-stone-200 rounded-3xl bg-stone-50/50 p-12 text-center group hover:border-[#BF5700]/50 transition-colors">
                <div className="bg-white p-6 rounded-full shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-10 h-10 text-[#BF5700]" />
                </div>
                <h3 className="text-3xl font-black italic tracking-tighter text-stone-300 mb-2 uppercase">Need Ideas?</h3>
                <p className="text-stone-500 max-w-sm font-medium mb-8">
                  Not sure what to wear? Let us curate a list of trending outfits for {selectedEvent?.artist || 'the event'}.
                </p>
                <button
                  onClick={fetchOutfitFeed}
                  className="px-8 py-4 bg-white text-stone-800 font-bold rounded-xl border-2 border-stone-200 hover:border-[#BF5700] hover:text-[#BF5700] shadow-sm hover:shadow-md transition-all flex items-center gap-3"
                >
                  <Search className="w-5 h-5" />
                  GET INSPIRATION
                </button>
              </div>
            )}

          </div>
        </div>

        {/* --- LIVE CAMERA MODAL (Global Overlay) --- */}
        {isCameraOpen && (
          <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center animate-in fade-in duration-200">
            <button
              onClick={stopCamera}
              className="absolute top-6 right-6 text-white bg-white/20 p-3 rounded-full backdrop-blur-md z-10 hover:bg-white/30 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="w-full h-full relative flex items-center justify-center bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover md:max-w-md md:h-auto md:rounded-2xl md:aspect-[3/4]"
              />
            </div>

            <div className="absolute bottom-12 left-0 right-0 flex justify-center pb-safe">
              <button
                onClick={capturePhoto}
                className="w-20 h-20 bg-white rounded-full border-4 border-stone-300 shadow-2xl flex items-center justify-center active:scale-90 transition-transform duration-100"
              >
                <div className="w-16 h-16 bg-white rounded-full border-2 border-stone-200 ring-1 ring-black/5"></div>
              </button>
            </div>

            <p className="absolute bottom-36 text-white/80 text-sm font-medium bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-sm">
              Position outfit in frame
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutfitRecommender;