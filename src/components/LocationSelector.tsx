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
  
  const API_KEY = "YOUR_API_KEY"; // Placeholder as requested

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('user_location');
    if (saved) {
      setLocation(JSON.parse(saved));
    } else {
      detectCurrentLocation();
    }

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Save to localStorage whenever location changes
  useEffect(() => {
    if (location.lat) {
      localStorage.setItem('user_location', JSON.stringify(location));
    }
  }, [location]);

  // Debounced Search
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

  const detectCurrentLocation = () => {
    setIsLoading(true);
    setStatus("Detecting...");
    
    if (!navigator.geolocation) {
      setStatus("Geolocation not supported");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await reverseGeocode(latitude, longitude);
      },
      (error) => {
        console.error(error);
        setStatus("Permission Denied");
        setIsLoading(false);
      }
    );
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${API_KEY}`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const area = result.components.suburb || result.components.neighbourhood || result.components.city || "Unknown Area";
        const newLocation = { address: area, lat, lng };
        setLocation(newLocation);
        setStatus(null);
      }
    } catch (err) {
      console.error(err);
      setStatus("Error fetching address");
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
      {/* Header View */}
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

      {/* Manual Location Dropdown */}
      {isDropdownOpen && (
        <div className="absolute top-16 left-0 w-full md:w-[350px] bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-50 z-[100] p-5 animate-in slide-in-from-top-4 duration-300 overflow-hidden">
          
          <div className="flex items-center justify-between mb-4 px-1">
             <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Select Area</h4>
             <button onClick={() => setIsDropdownOpen(false)} className="text-slate-300 hover:text-slate-500"><X size={16} /></button>
          </div>

          {/* Search Box */}
          <div className="relative mb-4">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl flex items-center h-12 px-4 focus-within:ring-4 ring-brand/5 focus-within:border-brand/20 transition-all">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search your hostel or area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-[13px] font-bold text-slate-700 placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Current Location Suggestion */}
          <button 
            onClick={() => {
              detectCurrentLocation();
            }}
            className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-brand/5 border border-dashed border-slate-200 hover:border-brand/30 transition-all group mb-4"
          >
            <div className="bg-brand/10 p-2 rounded-lg text-brand group-hover:scale-110 transition-transform">
              <Crosshair size={18} />
            </div>
            <div className="text-left">
              <p className="text-[13px] font-black text-brand leading-none mb-1">Use Current Location</p>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Using GPS for better precision</p>
            </div>
          </button>

          {/* Search Results */}
          <div className="max-h-[250px] overflow-y-auto pr-1 hide-scrollbar space-y-2">
            {suggestions.map((res, i) => (
              <button 
                key={i}
                onClick={() => handleSelectSuggestion(res)}
                className="w-full flex items-start gap-3 p-3.5 rounded-xl hover:bg-slate-50 transition-colors text-left group"
              >
                <MapPinIcon size={16} className="text-slate-300 group-hover:text-brand mt-0.5" />
                <div className="flex-1">
                   <p className="text-[13px] font-bold text-slate-700 leading-snug">
                    {res.components.suburb || res.components.neighbourhood || res.components.city || "Unknown"}
                   </p>
                   <p className="text-[11px] font-medium text-slate-400 truncate w-full">{res.formatted}</p>
                </div>
              </button>
            ))}
            
            {searchQuery && suggestions.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No matching areas found</p>
              </div>
            )}
            
            {status && (
              <div className="text-center py-2">
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">{status}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
