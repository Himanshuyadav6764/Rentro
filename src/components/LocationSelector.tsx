"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown, Search, Crosshair, X, MapPinIcon } from 'lucide-react';

interface LocationData {
  address: string;
  lat: number | null;
  lng: number | null;
  area?: string;
  city?: string;
  isCurrent?: boolean;
}

interface LocationSuggestion {
  area?: string;
  city?: string;
  label: string;
  lat: number;
  lng: number;
  distanceKm?: number;
  formatted?: string;
}

export default function LocationSelector() {
  const [location, setLocation] = useState<LocationData>({
    address: "Select Location",
    lat: null,
    lng: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('user_location');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as LocationData;
        if (parsed?.address) {
          setLocation({ ...parsed, isCurrent: true });
        }
      } catch {
        localStorage.removeItem('user_location');
      }
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

  const fetchSuggestions = React.useCallback(async (query: string) => {
    try {
      const params = new URLSearchParams({
        q: query,
      });

      if (location.lat !== null && location.lng !== null) {
        params.set('lat', String(location.lat));
        params.set('lng', String(location.lng));
      }

      const response = await fetch(
        `/api/location/search?${params.toString()}`,
        { cache: 'no-store' },
      );
      const payload = (await response.json()) as {
        success: boolean;
        suggestions?: LocationSuggestion[];
      };

      if (!response.ok || !payload.success) {
        setSuggestions([]);
        return;
      }

      setSuggestions(payload.suggestions || []);
    } catch {
      setSuggestions([]);
    }
  }, [location.lat, location.lng]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 2) {
        void fetchSuggestions(searchQuery);
      } else {
        setSuggestions([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchSuggestions, searchQuery]);

  const detectLocation = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    
    if (!navigator.geolocation) {
      setErrorMessage('Browser geolocation supported nahi hai. Location manually search karo.');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await reverseGeocode(latitude, longitude, true);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setErrorMessage('Location permission denied. Browser settings me location allow karo.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setErrorMessage('Current GPS location detect nahi ho pa rahi.');
        } else if (error.code === error.TIMEOUT) {
          setErrorMessage('GPS request timeout ho gaya. Dobara try karo.');
        } else {
          setErrorMessage('GPS location detect nahi ho paayi.');
        }
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  };

  const reverseGeocode = async (lat: number, lng: number, isCurrent = false) => {
    try {
      const response = await fetch(
        `/api/location/reverse?lat=${lat}&lng=${lng}`,
        { cache: 'no-store' },
      );

      const payload = (await response.json()) as {
        success: boolean;
        message?: string;
        location?: {
          label: string;
          area?: string;
          city?: string;
          lat: number;
          lng: number;
        };
      };

      if (!response.ok || !payload.success || !payload.location) {
        setErrorMessage(payload.message || 'Location service failed.');
        return;
      }

      setLocation({
        address: payload.location.label,
        area: payload.location.area,
        city: payload.location.city,
        lat: payload.location.lat,
        lng: payload.location.lng,
        isCurrent,
      });
      setErrorMessage(null);
    } catch {
      setErrorMessage('Location service unavailable. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSuggestion = (res: LocationSuggestion) => {
    setLocation({
      address: res.label,
      area: res.area,
      city: res.city,
      lat: res.lat,
      lng: res.lng,
      isCurrent: true,
    });

    setErrorMessage(null);
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

          {errorMessage ? (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] font-semibold text-rose-700">
              {errorMessage}
            </div>
          ) : null}

          <div className="max-h-[250px] overflow-y-auto hide-scrollbar space-y-2">
            {suggestions.map((res, i) => (
              <button 
                key={i}
                onClick={() => handleSelectSuggestion(res)}
                className="w-full flex items-start gap-3 p-3.5 rounded-xl hover:bg-slate-50 transition-colors text-left"
              >
                <MapPinIcon size={16} className="text-slate-300 mt-1" />
                <div className="flex-1">
                   <p className="text-[13px] font-bold text-slate-700">
                    {res.label}
                   </p>
                   {res.formatted ? (
                     <p className="text-[11px] text-slate-400 truncate">{res.formatted}</p>
                   ) : null}
                   {typeof res.distanceKm === 'number' ? (
                     <p className="text-[11px] text-brand font-semibold mt-0.5">
                       {res.distanceKm < 1
                         ? `${Math.round(res.distanceKm * 1000)} m away`
                         : `${res.distanceKm.toFixed(1)} km away`}
                     </p>
                   ) : null}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
