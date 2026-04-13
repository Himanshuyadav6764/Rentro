"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown, Search, Crosshair, X, MapPinIcon } from 'lucide-react';

interface LocationData {
  address: string;
  lat: number | null;
  lng: number | null;
}

export default function LocationSelector() {
  const [location, setLocation] = useState<LocationData>({ address: "Select Location", lat: null, lng: null });
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const API_KEY = "YOUR_API_KEY"; // Placeholder

  useEffect(() => {
    const saved = localStorage.getItem('user_location');
    if (saved) {
      setLocation(JSON.parse(saved));
    } else {
      detectLocation();
    }

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (location.lat) {
      localStorage.setItem('user_location', JSON.stringify(location));
    }
  }, [location]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 2) {
        fetchSuggestions(searchQuery);
      } else {
        setSuggestions([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const detectLocation = async () => {
    setIsLoading(true);
    setStatus("Detecting...");
    
    if (!navigator.geolocation) {
      fallbackToIP();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await reverseGeocode(latitude, longitude);
      },
      (error) => {
        console.warn("Geolocation permission denied, falling back to IP...");
        fallbackToIP();
      }
    );
  };

  const fallbackToIP = async () => {
    try {
      const resp = await fetch('https://ipapi.co/json/');
      const data = await resp.json();
      if (data.latitude) {
        await reverseGeocode(data.latitude, data.longitude);
      }
    } catch (e) {
      setStatus("Location Denied");
    } finally {
      setIsLoading(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // If no real API key, fallback to a readable coordinate string so it doesn't hang
      if (API_KEY === "YOUR_API_KEY") {
        console.warn("Using mock address: OpenCage API key is missing.");
        setLocation({ address: `Campus (${lat.toFixed(2)}, ${lng.toFixed(2)})`, lat, lng });
        setStatus(null);
        return;
      }

      const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${API_KEY}`);
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const area = result.components.suburb || result.components.neighbourhood || result.components.city || "Unknown Area";
        setLocation({ address: area, lat, lng });
        setStatus(null);
      } else {
        throw new Error("No results found");
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
      // Fallback to coordinates if API fails
      setLocation({ address: `Area (${lat.toFixed(1)}, ${lng.toFixed(1)})`, lat, lng });
      setStatus("Using Coordinates");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestions = async (query: string) => {
    try {
      const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${API_KEY}`);
      const data = await response.json();
      setSuggestions(data.results || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectSuggestion = (res: any) => {
    const area = res.components.suburb || res.components.neighbourhood || res.components.city || res.formatted;
    setLocation({
      address: area,
      lat: res.geometry.lat,
      lng: res.geometry.lng
    });
    setSearchQuery("");
    setSuggestions([]);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button 
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-3 text-slate-400 group hover:opacity-80 transition-all text-left"
      >
        <div className="bg-brand/10 p-2.5 rounded-2xl group-hover:bg-brand/20 transition-colors shrink-0 shadow-sm border border-brand/5">
          <MapPin className="w-5 h-5 text-brand" />
        </div>
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1 opacity-50">Current Location</p>
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-[15px] font-black text-slate-800 truncate">
              {isLoading ? "Detecting..." : location.address}
            </span>
            <ChevronDown className={`w-4 h-4 text-brand transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </button>

      {isDropdownOpen && (
        <div className="absolute top-16 left-0 w-full md:w-[350px] bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-50 z-[100] p-5 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-4 px-1">
             <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Select Area</h4>
             <button onClick={() => setIsDropdownOpen(false)} className="text-slate-300 hover:text-slate-500"><X size={16} /></button>
          </div>
          <div className="relative mb-4">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl flex items-center h-12 px-4 focus-within:ring-4 ring-brand/5 transition-all">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-[13px] font-bold text-slate-700"
              />
            </div>
          </div>
          <button 
            onClick={detectLocation}
            className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-brand/5 border border-dashed border-slate-200 transition-all group mb-4"
          >
            <Crosshair size={18} className="text-brand" />
            <span className="text-[13px] font-black text-brand">Use GPS Location</span>
          </button>
          <div className="max-h-[250px] overflow-y-auto hide-scrollbar space-y-2">
            {suggestions.map((res, i) => (
              <button 
                key={i}
                onClick={() => handleSelectSuggestion(res)}
                className="w-full flex items-start gap-3 p-3.5 rounded-xl hover:bg-slate-50 transition-colors text-left"
              >
                <MapPinIcon size={16} className="text-slate-300 mt-1" />
                <div className="flex-1">
                   <p className="text-[13px] font-bold text-slate-700">{res.components.suburb || res.components.city || "Unknown"}</p>
                   <p className="text-[11px] text-slate-400 truncate">{res.formatted}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
