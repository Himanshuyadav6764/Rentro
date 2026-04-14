"use client";

import React, { useEffect } from 'react';
import { 
  ChevronRight, 
  CheckCircle2, 
  MapPin, 
  Laptop, 
  BookOpen, 
  TrendingUp,
  Star,
  PenTool,
  Shirt,
  Gamepad,
  Wrench,
  Zap,
  Calendar,
   X
} from 'lucide-react';
import LocationSelector from '../LocationSelector';

// Haversine formula to calculate distance in KM
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

const SUB_CATEGORIES = [
  { name: "TVs, Video - Audio", image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=200" },
  { name: "Kitchen Appliances", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=200" },
  { name: "Computers & Laptops", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=200" },
  { name: "Cameras & Lenses", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=200" },
  { name: "Games & Entertainment", image: "https://images.unsplash.com/photo-1605898962319-19451a74219f?auto=format&fit=crop&q=80&w=200" },
  { name: "Fridges", image: "https://images.unsplash.com/photo-1571175488180-ef9b042a6911?auto=format&fit=crop&q=80&w=200" },
  { name: "Accessories", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=200" },
  { name: "Printers & Monitors", image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&q=80&w=200" },
  { name: "ACs", image: "https://images.unsplash.com/photo-1631541909061-71e349d1f103?auto=format&fit=crop&q=80&w=200" },
  { name: "Washing Machines", image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&q=80&w=200" },
];

const CATEGORIES = [
  { name: 'Academic', icon: <BookOpen className="w-7 h-7" />, color: 'bg-indigo-50 text-indigo-600' },
  { name: 'Electronics', icon: <Laptop className="w-7 h-7" />, color: 'bg-blue-50 text-blue-600' },
  { name: 'Furniture', icon: <PenTool className="w-7 h-7" />, color: 'bg-amber-50 text-amber-600' },
  { name: 'Clothing', icon: <Shirt className="w-7 h-7" />, color: 'bg-pink-50 text-pink-600' },
  { name: 'Transport', icon: <Zap className="w-7 h-7" />, color: 'bg-emerald-50 text-emerald-600' },
  { name: 'Gaming', icon: <Gamepad className="w-7 h-7" />, color: 'bg-purple-50 text-purple-600' },
  { name: 'Services', icon: <Wrench className="w-7 h-7" />, color: 'bg-slate-50 text-slate-600' },
  { name: 'Events', icon: <Calendar className="w-7 h-7" />, color: 'bg-rose-50 text-rose-600' },
];

// Mock data with coordinates
const MOCK_ITEMS = [
  {
    id: 1,
    name: 'MacBook Pro M2',
    price: '₹ 250',
    deposit: '₹ 1000',
    trustScore: 85,
    owner: 'Ankit S.',
    image: 'https://images.unsplash.com/photo-1517336714460-4c742a27744b?auto=format&fit=crop&q=80&w=400',
    lat: 28.6139,
    lng: 77.2090
  },
  {
    id: 2,
    name: 'Casio Scientific Calc',
    price: '₹ 15',
    deposit: '₹ 100',
    trustScore: 92,
    owner: 'Priya V.',
    image: 'https://images.unsplash.com/photo-1626154320743-403487053e1a?auto=format&fit=crop&q=80&w=400',
    lat: 28.5355,
    lng: 77.3910
  },
  {
    id: 3,
    name: 'Engineering Graphics Set',
    price: '₹ 30',
    deposit: '₹ 150',
    trustScore: 88,
    owner: 'Rohan K.',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
    lat: 28.4595,
    lng: 77.0266
  },
  {
    id: 4,
    name: 'Sony WH-1000XM4',
    price: '₹ 120',
    deposit: '₹ 500',
    trustScore: 95,
    owner: 'Ishani M.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400',
    lat: 28.6324,
    lng: 77.2187
  }
];

type NearbyItem = (typeof MOCK_ITEMS)[number] & {
   distance?: number;
};

const MAX_NEARBY_DISTANCE_KM = 50;

interface HomeViewProps {
  onSelectItem?: (id: string) => void;
}

export default function HomeView({ onSelectItem }: HomeViewProps) {
  const [showExplorer, setShowExplorer] = React.useState(false);
  const [userLocation, setUserLocation] = React.useState<{lat: number, lng: number} | null>(null);
   const [itemLocationLabels, setItemLocationLabels] = React.useState<Record<number, string>>({});

  // Load user location from localStorage (synced with LocationSelector)
  useEffect(() => {
    const updateLocation = () => {
      const saved = localStorage.getItem('user_location');
      if (saved) {
        const parsed = JSON.parse(saved);
            if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
          setUserLocation({ lat: parsed.lat, lng: parsed.lng });
        }
      }
    };

    updateLocation();
    const interval = setInterval(updateLocation, 2000); // Poll for changes
    return () => clearInterval(interval);
  }, []);

   const sortedItems = React.useMemo<NearbyItem[]>(() => {
      if (!userLocation) {
             return [];
      }

      return MOCK_ITEMS
         .map((item) => ({
            ...item,
            distance: getDistance(userLocation.lat, userLocation.lng, item.lat, item.lng),
         }))
             .filter((item) => (item.distance ?? Number.POSITIVE_INFINITY) <= MAX_NEARBY_DISTANCE_KM)
         .sort((a, b) => (a.distance || 0) - (b.distance || 0));
   }, [userLocation]);

   useEffect(() => {
      if (sortedItems.length === 0) {
         return;
      }

      const unresolvedItems = sortedItems.filter((item) => !itemLocationLabels[item.id]);
      if (unresolvedItems.length === 0) {
         return;
      }

      let cancelled = false;

      const resolveLocations = async () => {
         const resolved = await Promise.all(
            unresolvedItems.map(async (item) => {
               try {
                  const response = await fetch(`/api/location/reverse?lat=${item.lat}&lng=${item.lng}`, {
                     cache: 'force-cache',
                  });
                  const payload = (await response.json()) as {
                     success: boolean;
                     location?: { label?: string };
                  };

                  if (!response.ok || !payload.success || !payload.location?.label) {
                     return [item.id, 'Location unavailable'] as const;
                  }

                  return [item.id, payload.location.label] as const;
               } catch {
                  return [item.id, 'Location unavailable'] as const;
               }
            }),
         );

         if (cancelled) {
            return;
         }

         setItemLocationLabels((prev) => {
            const next = { ...prev };
            for (const [id, label] of resolved) {
               if (!next[id]) {
                  next[id] = label;
               }
            }
            return next;
         });
      };

      void resolveLocations();

      return () => {
         cancelled = true;
      };
   }, [itemLocationLabels, sortedItems]);

  return (
    <div className="flex-1 overflow-x-hidden bg-white pb-32 h-full overflow-y-auto hide-scrollbar sm:px-4">
      <div className="max-w-5xl mx-auto w-full">
        
        {/* Category Explorer Modal */}
        {showExplorer && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setShowExplorer(false)}></div>
            <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-400">
               <header className="px-8 py-8 flex items-center justify-between border-b border-slate-50">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Explore Categories</h3>
                  <button onClick={() => setShowExplorer(false)} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-800 transition-all">
                     <X size={24} strokeWidth={3} />
                  </button>
               </header>
               <div className="flex-1 overflow-y-auto p-8 grid grid-cols-2 sm:grid-cols-3 gap-y-10 gap-x-6 hide-scrollbar">
                  {SUB_CATEGORIES.map((sub, i) => (
                    <div key={i} className="flex flex-col items-center gap-4 group cursor-pointer">
                       <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-50 shadow-lg group-hover:scale-110 group-active:scale-95 transition-all">
                                       <img
                                          src={sub.image}
                                          alt={sub.name}
                                          loading="lazy"
                                          fetchPriority="low"
                                          className="w-full h-full object-cover"
                                       />
                       </div>
                       <span className="text-[13px] font-bold text-slate-700 text-center leading-tight group-hover:text-brand transition-colors">{sub.name}</span>
                    </div>
                  ))}
                  <div className="flex flex-col items-center gap-4 group cursor-pointer">
                     <div className="w-24 h-24 rounded-full bg-slate-50 border-4 border-white shadow-lg flex items-center justify-center group-hover:scale-110 transition-all">
                        <ChevronRight size={32} className="text-brand group-hover:translate-x-1 transition-transform" />
                     </div>
                     <span className="text-[13px] font-black text-brand uppercase tracking-widest">View All</span>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Location Selector */}
        <div className="px-6 pt-8 pb-4">
           <LocationSelector />
        </div>

        {/* Categories Grid/Row */}
        <div className="px-6 py-6 overflow-hidden">
           <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Popular Categories</h3>
           <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-4 -mx-1 px-1">
              {CATEGORIES.map((cat, i) => (
                <div 
                  key={i} 
                  onClick={() => setShowExplorer(true)}
                  className="flex flex-col items-center gap-3 min-w-[90px] group cursor-pointer"
                >
                   <div className={`w-20 h-20 ${cat.color} rounded-[2rem] flex items-center justify-center shadow-lg shadow-black/5 group-hover:scale-110 group-active:scale-95 transition-all duration-300 border border-white/20`}>
                      {cat.icon}
                   </div>
                   <span className="text-[11px] font-bold text-slate-600 group-hover:text-brand transition-colors tracking-tight text-center">{cat.name}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Trust Banner */}
        <div className="px-6 py-4">
           <div className="bg-slate-900 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden group border border-white/5 cursor-pointer">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-all"></div>
              <div className="relative z-10 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                       <TrendingUp className="text-emerald-400 w-8 h-8" />
                    </div>
                    <div>
                       <div className="flex items-center gap-2">
                          <h2 className="text-white font-black text-xl leading-none">Trust Score: 90</h2>
                          <div className="bg-emerald-500 rounded-full p-0.5"><CheckCircle2 size={12} className="text-white" /></div>
                       </div>
                       <p className="text-emerald-400/60 text-[11px] font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1.5 font-mono">
                          90TH PERCENTILE IN CAMPUS
                       </p>
                    </div>
                 </div>
                 <ChevronRight className="text-white/20 group-hover:text-white/80 transition-all transform group-hover:translate-x-1" />
              </div>
           </div>
        </div>

        {/* Featured Section (Now Nearby-Aware) */}
        <div className="px-6 mt-10">
           <div className="flex justify-between items-end mb-8">
              <div>
                         <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Nearby You (Within 50km)</h3>
                 <h2 className="text-2xl font-black text-slate-800 tracking-tight">Recommendation Grid</h2>
              </div>
              <button className="text-brand font-black text-[11px] uppercase tracking-widest flex items-center gap-1 pb-1 hover:gap-2 transition-all">
                See All <ChevronRight size={14} />
              </button>
           </div>

                {sortedItems.length === 0 ? (
                   <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-10 text-center">
                      <p className="text-base font-semibold text-slate-700">No items found within 50km of your selected location.</p>
                      <p className="mt-2 text-sm text-slate-500">Update location to discover nearby listings with accurate area details.</p>
                   </div>
                ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                     {sortedItems.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => onSelectItem?.(item.id.toString())}
                  className="group bg-white rounded-[2.5rem] border border-slate-100 p-4 flex flex-col gap-4 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 cursor-pointer overflow-hidden relative active:scale-[0.98]">
                   <div className="w-full h-44 bg-slate-50 rounded-[2rem] overflow-hidden relative shrink-0 border border-slate-50 shadow-inner">
                                 <img
                                    src={item.image}
                                    alt={item.name}
                                    loading="lazy"
                                    fetchPriority="low"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                 />

                      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-[13px] font-black px-4 py-2 rounded-2xl shadow-sm border border-slate-100/50">
                         {item.price}<span className="text-slate-400 font-bold">/day</span>
                      </div>
                   </div>
                   <div className="flex flex-col gap-2 px-1 pb-2">
                      <h3 className="font-bold text-slate-800 text-[17px] leading-tight group-hover:text-brand transition-colors truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm font-semibold text-slate-700">Rent per day: {item.price}/day</p>
                      <p className="text-sm font-semibold text-slate-700">Deposit: {item.deposit}</p>
                      <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        <MapPin size={14} className="text-brand" />
                        {itemLocationLabels[item.id] || 'Resolving exact location...'}
                      </p>
                      <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        <Star size={14} className="text-emerald-600" fill="currentColor" />
                        Customer trust score: {item.trustScore}
                      </p>
                      <p className="text-sm font-semibold text-slate-700">By seller: {item.owner}</p>
                   </div>
                </div>
              ))}
           </div>
           )}
        </div>

      </div>
    </div>
  );
}
