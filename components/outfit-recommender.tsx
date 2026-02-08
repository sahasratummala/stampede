'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, Sparkles, Sun, CheckCircle, AlertCircle, ThermometerSun, Search, ChevronDown, Calendar, MapPin, X } from 'lucide-react';

interface EventType {
  id: string;
  title?: string;
  artist?: string;
  venue: string;
  date: string;
  genre?: string;
  vibe?: string;
  image?: string;
  link?: string;
}

interface OutfitRecommenderProps {
  events?: EventType[];
}

const OutfitRecommender: React.FC<OutfitRecommenderProps> = ({ events = [] }) => {
  // --- STATE ---
  const [upcomingEvents, setUpcomingEvents] = useState<EventType[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  const [mode, setMode] = useState<'upload' | 'feed'>('upload');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<any>(null);
  const [outfitFeed, setOutfitFeed] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // --- 0. BROWSER TITLE FIX ---
  useEffect(() => {
    document.title = "Fit Check | Stampede";
  }, []);

  // --- 1. INITIALIZE EVENTS FROM PROP ---
  useEffect(() => {
    if (events && events.length > 0) {
      const formattedEvents = (events as any[]).map((evt) => ({
        ...evt,
        artist: evt.title,
      })) as EventType[];

      setUpcomingEvents(formattedEvents);
      setSelectedEvent(formattedEvents[0]);
      setIsLoadingEvents(false);
    } else {
      const fallbackEvents: EventType[] = [
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
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Could not access camera. Please allow permissions.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
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
      ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      stopCamera();
      setUploadedImage(dataUrl);
      analyzeOutfit(dataUrl);
    }
  };

  // --- IMAGE UPLOAD & ANALYSIS ---
  const compressImage = (file: File) => new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target!.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = scaleSize < 1 ? MAX_WIDTH : img.width;
        canvas.height = scaleSize < 1 ? img.height * scaleSize : img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
    };
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
      const currentWeather = await getWeather();
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

  const analyzeOutfit = async (imageData: string) => {
    if (!selectedEvent) return;
    setLoading(true); setAnalysis(null); setMode('upload');
    try {
      const currentWeather = await getWeather();
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

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300 font-sans pb-32">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold text-[var(--foreground)]">Fit Check</h1>
          <Sparkles className="w-8 h-8 text-purple-500" />
        </div>
        <p className="text-[var(--muted-foreground)]">
          Get AI-powered outfit recommendations for your next concert
        </p>
      </div>

      {/* Event Selector */}
      <div className="max-w-5xl mx-auto px-4 mb-6">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between hover:bg-[var(--accent)] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-purple-500" />
              <div className="text-left">
                <div className="font-semibold text-[var(--foreground)]">
                  {selectedEvent?.artist || 'Select Event'}
                </div>
                <div className="text-sm text-[var(--muted-foreground)] flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  {selectedEvent?.venue}
                  {selectedEvent?.date && ` • ${new Date(selectedEvent.date).toLocaleDateString()}`}
                </div>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute z-50 w-full mt-2 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg max-h-80 overflow-y-auto">
              {upcomingEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => {
                    setSelectedEvent(event);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full p-4 text-left hover:bg-[var(--accent)] transition-colors border-b border-[var(--border)] last:border-b-0"
                >
                  <div className="font-semibold text-[var(--foreground)]">{event.artist}</div>
                  <div className="text-sm text-[var(--muted-foreground)] flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    {event.venue}
                    {event.date && ` • ${new Date(event.date).toLocaleDateString()}`}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Weather Card */}
      {weather && (
        <div className="max-w-5xl mx-auto px-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sun className="w-6 h-6 text-yellow-500" />
                <div>
                  <div className="font-semibold text-[var(--foreground)]">
                    {weather.temp}°F • {weather.condition}
                  </div>
                  <div className="text-sm text-[var(--muted-foreground)]">
                    Event day forecast
                  </div>
                </div>
              </div>
              <ThermometerSun className="w-8 h-8 text-orange-500 opacity-50" />
            </div>
          </div>
        </div>
      )}

      {/* Mode Toggle */}
      <div className="max-w-5xl mx-auto px-4 mb-6">
        <div className="flex gap-2 bg-[var(--card)] border border-[var(--border)] rounded-xl p-1">
          <button
            onClick={() => setMode('upload')}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              mode === 'upload'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Check My Fit
          </button>
          <button
            onClick={fetchOutfitFeed}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              mode === 'feed'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            <Search className="w-4 h-4 inline mr-2" />
            Get Ideas
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4">
        {mode === 'upload' && !uploadedImage && !isCameraOpen && (
          <div className="bg-[var(--card)] border-2 border-dashed border-[var(--border)] rounded-xl p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <Camera className="w-16 h-16 text-[var(--muted-foreground)]" />
              <div>
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                  Upload Your Outfit
                </h3>
                <p className="text-[var(--muted-foreground)] mb-6">
                  Take a photo or upload an image to get AI feedback
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={startCamera}
                  className="px-6 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors flex items-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  Open Camera
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-[var(--accent)] text-[var(--foreground)] border border-[var(--border)] rounded-lg font-medium hover:bg-[var(--accent-hover)] transition-colors flex items-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Upload Photo
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* Camera View */}
        {isCameraOpen && (
          <div className="bg-[var(--card)] rounded-xl overflow-hidden">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-t-xl"
              />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                <button
                  onClick={capturePhoto}
                  className="px-8 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
                >
                  Capture Photo
                </button>
                <button
                  onClick={stopCamera}
                  className="px-8 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {mode === 'upload' && uploadedImage && (
          <div className="space-y-6">
            <div className="bg-[var(--card)] rounded-xl overflow-hidden border border-[var(--border)]">
              <img src={uploadedImage} alt="Your outfit" className="w-full max-h-96 object-contain bg-black" />
            </div>

            {loading && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[var(--muted-foreground)]">Analyzing your fit...</p>
                </div>
              </div>
            )}

            {analysis && !loading && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  {analysis.verdict === 'approved' ? (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-yellow-500" />
                  )}
                  <h3 className="text-2xl font-bold text-[var(--foreground)]">
                    {analysis.verdict === 'approved' ? 'Fit Approved! 🔥' : 'Could Be Better 🤔'}
                  </h3>
                </div>

                <div className="prose prose-invert max-w-none">
                  <p className="text-[var(--foreground)] whitespace-pre-wrap">{analysis.feedback}</p>
                </div>

                <button
                  onClick={() => {
                    setUploadedImage(null);
                    setAnalysis(null);
                  }}
                  className="w-full mt-6 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
                >
                  Try Another Outfit
                </button>
              </div>
            )}
          </div>
        )}

        {/* Outfit Feed */}
        {mode === 'feed' && (
          <div>
            {loading && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[var(--muted-foreground)]">Generating outfit ideas...</p>
                </div>
              </div>
            )}

            {!loading && outfitFeed.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {outfitFeed.map((outfit, idx) => (
                  <div key={idx} className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                    <img
                      src={outfit.url}
                      alt={outfit.description || `Outfit ${idx + 1}`}
                      className="w-full h-80 object-cover"
                    />
                    {outfit.description && (
                      <div className="p-4">
                        <p className="text-sm text-[var(--muted-foreground)]">{outfit.description}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!loading && outfitFeed.length === 0 && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-12 text-center">
                <p className="text-[var(--muted-foreground)]">No outfit ideas found. Try again!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutfitRecommender;
