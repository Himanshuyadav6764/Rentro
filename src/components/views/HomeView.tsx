"use client";

import React, { useEffect } from 'react';
import Image from 'next/image';
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
   Heart
} from 'lucide-react';
import LocationSelector from '../LocationSelector';
import type { WishlistItem } from '@/components/WishlistSidebar';

const CATEGORIES = [
   { name: 'Books', icon: <BookOpen className="w-7 h-7" />, color: 'bg-indigo-50 text-indigo-600' },
   { name: 'Laptops', icon: <Laptop className="w-7 h-7" />, color: 'bg-blue-50 text-blue-600' },
  { name: 'Furniture', icon: <PenTool className="w-7 h-7" />, color: 'bg-amber-50 text-amber-600' },
  { name: 'Clothing', icon: <Shirt className="w-7 h-7" />, color: 'bg-pink-50 text-pink-600' },
  { name: 'Transport', icon: <Zap className="w-7 h-7" />, color: 'bg-emerald-50 text-emerald-600' },
  { name: 'Gaming', icon: <Gamepad className="w-7 h-7" />, color: 'bg-purple-50 text-purple-600' },
  { name: 'Services', icon: <Wrench className="w-7 h-7" />, color: 'bg-slate-50 text-slate-600' },
   { name: 'Others', icon: <Calendar className="w-7 h-7" />, color: 'bg-rose-50 text-rose-600' },
];

type FeedItem = {
   id: string;
   title: string;
   category?: string;
   image_urls?: string[];
   rent_price?: number;
   deposit?: number;
   location_label?: string;
   location_area?: string;
   location_city?: string;
   distance_km?: number;
   createdAt?: string;
};

interface HomeViewProps {
  onSelectItem?: (id: string) => void;
   searchQuery?: string;
   wishlistIds?: string[];
   onWishlistToggle?: (item: WishlistItem) => void;
}

function formatDistance(distanceKm?: number) {
   if (distanceKm === undefined) {
      return null;
   }

   if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)} m`;
   }

   return `${distanceKm.toFixed(1)} km`;
}

export default function HomeView({
   onSelectItem,
   searchQuery = '',
   wishlistIds = [],
   onWishlistToggle,
}: HomeViewProps) {
  const [userLocation, setUserLocation] = React.useState<{lat: number, lng: number} | null>(null);
   const [selectedCategory, setSelectedCategory] = React.useState('all');
   const [items, setItems] = React.useState<FeedItem[]>([]);
   const [isLoading, setIsLoading] = React.useState(false);

   // Sync user location from LocationSelector persisted state.
   useEffect(() => {
      const updateLocation = () => {
      const saved = localStorage.getItem('user_location');
      if (saved) {
            const parsed = JSON.parse(saved) as { lat?: number; lng?: number };
            if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
               const nextLat = parsed.lat;
               const nextLng = parsed.lng;
               setUserLocation((prev) => {
                  if (prev?.lat === nextLat && prev?.lng === nextLng) {
                     return prev;
                  }

                  return { lat: nextLat, lng: nextLng };
               });
        }
      }
    };

    updateLocation();
      window.addEventListener('rentro-location-updated', updateLocation);
      return () => window.removeEventListener('rentro-location-updated', updateLocation);
  }, []);

   useEffect(() => {
      let cancelled = false;

      const fetchListings = async () => {
         setIsLoading(true);

         try {
            const params = new URLSearchParams();
            if (searchQuery.trim()) {
               params.set('search', searchQuery.trim());
            }
            if (selectedCategory !== 'all') {
               params.set('category', selectedCategory);
            }
            if (userLocation) {
               params.set('lat', String(userLocation.lat));
               params.set('lng', String(userLocation.lng));
               params.set('radiusKm', '50');
            }

            const query = params.toString();
            const response = await fetch(`/api/listings${query ? `?${query}` : ''}`, {
               cache: 'no-store',
            });

            const payload = (await response.json()) as { success?: boolean; listings?: FeedItem[] };
            if (!response.ok || !payload.success) {
               if (!cancelled) {
                  setItems([]);
               }
               return;
            }

            if (!cancelled) {
               setItems(payload.listings || []);
            }
         } catch {
            if (!cancelled) {
               setItems([]);
            }
         } finally {
            if (!cancelled) {
               setIsLoading(false);
            }
         }
      };

      void fetchListings();

      return () => {
         cancelled = true;
      };
   }, [searchQuery, selectedCategory, userLocation]);

   const availableCategories = React.useMemo(() => {
      const unique = new Set<string>();
      for (const item of items) {
         if (item.category?.trim()) {
            unique.add(item.category.trim());
         }
      }

      return ['all', ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
   }, [items]);

  return (
    <div className="flex-1 overflow-x-hidden bg-white pb-32 h-full overflow-y-auto hide-scrollbar sm:px-4">
      <div className="max-w-5xl mx-auto w-full">

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
                           onClick={() => setSelectedCategory(cat.name)}
                  className="flex flex-col items-center gap-3 min-w-[90px] group cursor-pointer"
                >
                   <div className={`w-20 h-20 ${cat.color} rounded-[2rem] flex items-center justify-center shadow-lg shadow-black/5 group-hover:scale-110 group-active:scale-95 transition-all duration-300 border border-white/20`}>
                      {cat.icon}
                   </div>
                   <span className="text-[11px] font-bold text-slate-600 group-hover:text-brand transition-colors tracking-tight text-center">{cat.name}</span>
                </div>
              ))}
           </div>

                <div className="mt-3 flex gap-2 overflow-x-auto hide-scrollbar">
                     {availableCategories.map((category) => {
                        const active = selectedCategory.toLowerCase() === category.toLowerCase();
                        return (
                           <button
                              key={category}
                              type="button"
                              onClick={() => setSelectedCategory(category)}
                              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                                 active
                                    ? 'bg-[#1b52d6] text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                           >
                              {category === 'all' ? 'All' : category}
                           </button>
                        );
                     })}
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
      <div id="recommendation-grid-section" className="px-6 mt-10">
           <div className="flex justify-between items-end mb-8">
              <div>
                         <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-1">10km first, then 50km</h3>
                 <h2 className="text-2xl font-black text-slate-800 tracking-tight">Recommendation Grid</h2>
              </div>
              <button className="text-brand font-black text-[11px] uppercase tracking-widest flex items-center gap-1 pb-1 hover:gap-2 transition-all">
                See All <ChevronRight size={14} />
              </button>
           </div>

                        {isLoading ? (
                           <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-10 text-center">
                              <p className="text-base font-semibold text-slate-700">Loading nearby listings...</p>
                           </div>
                        ) : items.length === 0 ? (
                   <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-10 text-center">
                                 <p className="text-base font-semibold text-slate-700">No listings found for current search/filter in 50km radius.</p>
                                 <p className="mt-2 text-sm text-slate-500">Location select karo, phir search ya category filter try karo.</p>
                   </div>
                ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                               {items.map((item) => (
                        (() => {
                           const isWishlisted = wishlistIds.includes(item.id);
                           return (
                <div 
                  key={item.id} 
                           onClick={() => onSelectItem?.(item.id)}
                  className="group bg-white rounded-[2.5rem] border border-slate-100 p-4 flex flex-col gap-4 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 cursor-pointer overflow-hidden relative active:scale-[0.98]">
                   <div className="w-full h-44 bg-slate-50 rounded-[2rem] overflow-hidden relative shrink-0 border border-slate-50 shadow-inner">
                                 <Image
                                    src={item.image_urls?.[0] || 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&q=80&w=1000'}
                                    alt={item.title}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                 />

                                 <button
                                    type="button"
                                    onClick={(event) => {
                                       event.stopPropagation();
                                       onWishlistToggle?.({
                                          id: item.id,
                                          name: item.title,
                                          price: Number(item.rent_price || 0),
                                          image: item.image_urls?.[0],
                                          category: item.category || 'Others',
                                       });
                                    }}
                                    className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full border border-white/70 bg-white/90 text-slate-400 shadow-sm transition-colors hover:text-rose-500"
                                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                                 >
                                    <Heart
                                       size={18}
                                       className={isWishlisted ? 'text-rose-500' : 'text-slate-400'}
                                       fill={isWishlisted ? 'currentColor' : 'none'}
                                    />
                                 </button>

                      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-[13px] font-black px-4 py-2 rounded-2xl shadow-sm border border-slate-100/50">
                                     ₹ {item.rent_price || 0}<span className="text-slate-400 font-bold">/day</span>
                      </div>
                   </div>
                   <div className="flex flex-col gap-2 px-1 pb-2">
                      <h3 className="font-bold text-slate-800 text-[17px] leading-tight group-hover:text-brand transition-colors truncate">
                                    {item.title}
                      </h3>
                                 <p className="text-sm font-semibold text-slate-700">Category: {item.category || 'Others'}</p>
                                 <p className="text-sm font-semibold text-slate-700">Deposit: ₹ {item.deposit || 0}</p>
                      <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        <MapPin size={14} className="text-brand" />
                                    {item.location_label || item.location_area || item.location_city || 'Location unavailable'}
                      </p>
                                 {item.distance_km !== undefined ? (
                                    <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                       <Star size={14} className="text-emerald-600" fill="currentColor" />
                                       Distance: {formatDistance(item.distance_km)}
                                    </p>
                                 ) : null}
                   </div>
                </div>
                  );
                })()
              ))}
           </div>
           )}
        </div>

      </div>
    </div>
  );
}
