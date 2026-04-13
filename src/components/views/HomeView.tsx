"use client";

import React from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2, 
  MapPin, 
  Laptop, 
  BookOpen, 
  Calculator, 
  Smartphone, 
  Backpack, 
  Package,
  TrendingUp,
  Star,
  Search,
  PenTool,
  Shirt,
  Gamepad,
  Wrench,
  Zap,
  Calendar
} from 'lucide-react';
import Image from 'next/image';

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

const FEATURED_ITEMS = [
  {
    id: 1,
    name: 'MacBook Pro M2',
    price: '₹ 250',
    deposit: '₹ 1000',
    trustScore: 85,
    owner: 'Ankit S.',
    image: 'https://images.unsplash.com/photo-1517336714460-4c742a27744b?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 2,
    name: 'Casio Scientific Calc',
    price: '₹ 15',
    deposit: '₹ 100',
    trustScore: 92,
    owner: 'Priya V.',
    image: 'https://images.unsplash.com/photo-1626154320743-403487053e1a?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 3,
    name: 'Engineering Graphics',
    price: '₹ 30',
    deposit: '₹ 150',
    trustScore: 88,
    owner: 'Rohan K.',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400'
  }
];

interface HomeViewProps {
  onSelectItem?: (id: string) => void;
}

export default function HomeView({ onSelectItem }: HomeViewProps) {
  return (
    <div className="flex-1 overflow-x-hidden bg-white pb-32 h-full overflow-y-auto hide-scrollbar sm:px-4">
      <div className="max-w-5xl mx-auto w-full">
        
        {/* Location Selector */}
        <div className="px-6 pt-8 pb-4">
          <button className="flex items-center gap-2 text-slate-400 group">
             <div className="bg-brand/10 p-2 rounded-xl group-hover:bg-brand/20 transition-colors">
                <MapPin className="w-5 h-5 text-brand" />
             </div>
             <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1 opacity-50">Current Location</p>
                <div className="flex items-center gap-1">
                   <span className="text-[15px] font-black text-slate-800">Columbia Hostel Area</span>
                   <ChevronDown className="w-4 h-4 text-brand" />
                </div>
             </div>
          </button>
        </div>

        {/* Categories Grid/Row */}
        <div className="px-6 py-6 overflow-hidden">
           <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Popular Categories</h3>
           <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-4 -mx-1 px-1">
              {CATEGORIES.map((cat, i) => (
                <div key={i} className="flex flex-col items-center gap-3 min-w-[90px] group cursor-pointer">
                   <div className={`w-20 h-20 ${cat.color} rounded-[2rem] flex items-center justify-center shadow-lg shadow-black/5 group-hover:scale-110 group-active:scale-95 transition-all duration-300 border border-white/20`}>
                      {cat.icon}
                   </div>
                   <span className="text-[11px] font-bold text-slate-600 group-hover:text-brand transition-colors tracking-tight text-center">{cat.name}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Trust Banner - Premium AI Card */}
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
                       <p className="text-emerald-400/60 text-[11px] font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                          <Package size={12} /> Improve to save on deposits
                       </p>
                    </div>
                 </div>
                 <ChevronRight className="text-white/20 group-hover:text-white/80 transition-all transform group-hover:translate-x-1" />
              </div>
           </div>
        </div>

        {/* Featured Section */}
        <div className="px-6 mt-10">
           <div className="flex justify-between items-end mb-8">
              <div>
                 <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Featured</h3>
                 <h2 className="text-2xl font-black text-slate-800 tracking-tight">Newest Rentals</h2>
              </div>
              <button className="text-brand font-black text-[11px] uppercase tracking-widest flex items-center gap-1 pb-1 hover:gap-2 transition-all">
                See All <ChevronRight size={14} />
              </button>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURED_ITEMS.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => onSelectItem?.(item.id.toString())}
                  className="group bg-white rounded-[2rem] border border-slate-100 p-4 flex flex-col gap-4 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 cursor-pointer overflow-hidden relative active:scale-[0.98]">
                   <div className="w-full h-40 bg-slate-50 rounded-2xl overflow-hidden relative shrink-0 border border-slate-50 shadow-inner">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[11px] font-black px-3 py-1.5 rounded-xl shadow-sm">
                         {item.price}<span className="text-slate-400 font-bold">/day</span>
                      </div>
                   </div>
                   <div className="flex flex-col py-1">
                      <div className="flex justify-between items-start mb-1">
                         <h3 className="font-bold text-slate-800 text-[16px] leading-tight group-hover:text-brand transition-colors">{item.name}</h3>
                         <div className="flex items-center gap-1 text-[11px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100/50">
                            <Star size={10} fill="currentColor" /> {item.trustScore}
                         </div>
                      </div>
                      <p className="text-[12px] text-slate-400 font-bold flex items-center gap-1 mb-3">
                        Owned by <span className="text-slate-600">{item.owner}</span>
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                         <div className="flex items-center gap-1.5 text-xs font-bold text-brand bg-brand/5 px-3 py-1.5 rounded-xl border border-brand/10">
                            <CheckCircle2 size={14} />
                            Dep: {item.deposit}
                         </div>
                         <button className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-brand hover:text-white transition-all">
                            <Plus size={20} />
                         </button>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}

function Plus({ size, className }: { size: number, className?: string }) {
   return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
         <line x1="12" y1="5" x2="12" y2="19"></line>
         <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
   )
}
