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

  // --- EventSelector / AnalysisResults / OutfitFeed remain unchanged ---
  // They now work with typed upcomingEvents and selectedEvent

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300 font-sans pb-32">
      {/* ... rest of your component remains unchanged ... */}
      {/* Just make sure to pass typed upcomingEvents, selectedEvent etc. */}
    </div>
  );
};

export default OutfitRecommender;

