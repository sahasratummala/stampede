"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, Sparkles, Sun, CheckCircle, AlertCircle, ThermometerSun, Search, ChevronDown, Calendar, MapPin, X } from 'lucide-react';

// --- TYPESCRIPT INTERFACES (The "Fix" for the 60 errors) ---
interface ConcertEvent {
  id: string;
  artist: string;
  venue: string;
  date: string;
  genre: string;
  vibe: string;
}

interface WeatherData {
  temp: number;
  condition: string;
  outfitTips?: string[];
}

interface AnalysisResult {
  rating: number;
  overallFeedback: string;
  weatherVerdict?: string;
  whatWorks?: string[];
  suggestions?: string[];
  error?: string;
}

interface OutfitIdea {
  src: string;
  thumbnail: string;
  title: string;
  link: string;
  source: string;
}

const OutfitRecommender = ({ event: initialEvent = null }: { event?: ConcertEvent | null }) => {
  // --- CONFIGURATION ---
  const UT_ORANGE = "bg-[#BF5700]";
  const UT_ORANGE_TEXT = "text-[#BF5700]";

  // --- STATE WITH TYPES ---
  const [upcomingEvents, setUpcomingEvents] = useState<ConcertEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ConcertEvent | null>(initialEvent);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  const [mode, setMode] = useState<'upload' | 'feed'>('upload');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [outfitFeed, setOutfitFeed] = useState<OutfitIdea[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // --- BROWSER TITLE ---
  useEffect(() => {
    document.title = "Outfit Recommender | FitCheck";
  }, []);

  // --- FETCH EVENTS ---
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/get-events');
        const data = await res.json();
        if (data.events?.length > 0) {
          setUpcomingEvents(data.events);
          if (!selectedEvent) setSelectedEvent(data.events[0]);
        }
      } catch (err) {
        const fallback: ConcertEvent[] = [
          { id: 'f1', artist: "Taylor Swift", venue: "Moody Center", date: "Upcoming", genre: "pop", vibe: "sparkly" },
          { id: 'f2', artist: "UT Jazz Orchestra", venue: "Butler School", date: "Feb 20", genre: "jazz", vibe: "smart casual" }
        ];
        setUpcomingEvents(fallback);
        if (!selectedEvent) setSelectedEvent(fallback[0]);
      } finally {
        setIsLoadingEvents(false);
      }
    };
    fetchEvents();
  }, [selectedEvent]);

  const getWeather = async (): Promise<WeatherData | null> => {
    try {
      const response = await fetch('/api/weather');
      return await response.json();
    } catch (error) {
      return null;
    }
  };

  // --- CAMERA LOGIC ---
  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera access denied.");
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
      setLoading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width > 1024 ? 1024 : img.width;
          canvas.height = img.height * (canvas.width / img.width);
          canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setUploadedImage(dataUrl);
          analyzeOutfit(dataUrl);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeOutfit = async (imageData: string) => {
    if (!selectedEvent) return;
    setLoading(true);
    setMode('upload');
    try {
      const curWeather = weather || await getWeather();
      if (curWeather) setWeather(curWeather);
      const response = await fetch('/api/analyze-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData, artist: selectedEvent.artist, venue: selectedEvent.venue, genre: selectedEvent.genre, weather: curWeather })
      });
      setAnalysis(await response.json());
    } catch (error) {
      setAnalysis({ rating: 0, overallFeedback: "Error analyzing image.", error: "Failed" });
    } finally {
      setLoading(false);
    }
  };

  const fetchOutfitFeed = async () => {
    if (!selectedEvent) return;
    setLoading(true);
    setMode('feed');
    try {
      const curWeather = weather || await getWeather();
      if (curWeather) setWeather(curWeather);
      const response = await fetch('/api/outfit-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artist: selectedEvent.artist, genre: selectedEvent.genre, vibe: selectedEvent.vibe, weather: curWeather })
      });
      const data = await response.json();
      setOutfitFeed(data.images || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans pb-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10 text-center lg:text-left">
          <h2 className="text-6xl md:text-7xl lg:text-8xl font-black italic tracking-tighter uppercase leading-none text-black">FIT CHECK</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* LEFT SIDE: CONTROLS */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative z-50">
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full bg-white border border-stone-200 rounded-xl p-4 shadow-sm flex items-center justify-between text-left">
                <div>
                  <p className="text-xs font-bold text-stone-400 uppercase">I am going to see</p>
                  <div className="font-bold text-stone-800 text-lg">{selectedEvent?.artist || "Select Event"}</div>
                </div>
                <ChevronDown className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isDropdownOpen && (
                <div className="absolute top-full w-full bg-white shadow-xl rounded-xl mt-2 overflow-hidden border border-stone-100 max-h-60 overflow-y-auto">
                  {upcomingEvents.map(evt => (
                    <button key={evt.id} className="w-full p-4 text-left hover:bg-orange-50" onClick={() => { setSelectedEvent(evt); setIsDropdownOpen(false); }}>
                      <div className="font-bold">{evt.artist}</div>
                      <div className="text-xs text-stone-500">{evt.venue}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
              <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center hover:border-[#BF5700]">
                <Upload className="mx-auto mb-2 text-stone-300" />
                <p className="font-bold text-stone-600">Upload Gallery</p>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleImageUpload} />
              </div>
              <button onClick={startCamera} className={`w-full ${UT_ORANGE} text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2`}>
                <Camera className="w-5 h-5" /> SNAP PHOTO
              </button>
            </div>

            {weather && (
              <div className="bg-white p-4 rounded-2xl border flex items-center gap-4">
                <Sun className="text-[#BF5700]" />
                <div>
                  <p className="text-xs font-bold text-stone-400 uppercase">Weather</p>
                  <p className="font-bold">{weather.temp}°F | {weather.condition}</p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDE: RESULTS */}
          <div className="lg:col-span-7">
            {loading ? (
              <div className="h-96 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-[#BF5700]"></div>
              </div>
            ) : mode === 'upload' && uploadedImage ? (
              <div className="space-y-6">
                <img src={uploadedImage} alt="Outfit" className="w-full rounded-3xl shadow-xl" />
                {analysis && (
                  <div className="bg-white p-6 rounded-2xl border-t-4 border-[#BF5700] shadow-sm">
                    <h3 className={UT_ORANGE_TEXT + " font-black text-2xl mb-4"}>OVERALL FEEDBACK</h3>
                    <p className="text-stone-700">{analysis.overallFeedback}</p>
                  </div>
                )}
              </div>
            ) : mode === 'feed' ? (
              <div className="columns-2 gap-4">
                {outfitFeed.map((img, i) => (
                  <img key={i} src={img.src} className="w-full mb-4 rounded-xl" alt="Idea" />
                ))}
              </div>
            ) : (
              <div className="text-center p-20 border-2 border-dashed rounded-3xl">
                <Sparkles className="mx-auto mb-4 text-[#BF5700]" />
                <h3 className="text-2xl font-black text-stone-300">Need Ideas?</h3>
                <button onClick={fetchOutfitFeed} className="mt-4 px-6 py-3 border-2 rounded-xl font-bold hover:text-[#BF5700]">GET INSPIRATION</button>
              </div>
            )}
          </div>
        </div>

        {/* CAMERA OVERLAY */}
        {isCameraOpen && (
          <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className="w-full max-w-md h-auto" />
            <div className="flex gap-4 mt-8">
              <button onClick={capturePhoto} className="w-20 h-20 bg-white rounded-full border-4 border-stone-400"></button>
              <button onClick={stopCamera} className="text-white"><X /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutfitRecommender;