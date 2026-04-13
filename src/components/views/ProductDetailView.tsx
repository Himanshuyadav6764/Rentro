"use client";

import React from 'react';
import { 
  ChevronLeft, 
  Heart, 
  Share2, 
  MessageCircle, 
  ShieldCheck, 
  Clock, 
  Zap, 
  Calendar, 
  CheckCircle2, 
  TrendingDown,
  Info,
  ChevronRight,
  Star,
  MapPin
} from 'lucide-react';
import Image from 'next/image';

interface ProductDetailViewProps {
  productId?: string;
  onBack: () => void;
}

export default function ProductDetailView({ productId, onBack }: ProductDetailViewProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col font-sans animate-in slide-in-from-right duration-500">
      
      {/* Header Actions */}
      <header className="absolute top-0 left-0 right-0 z-20 px-6 py-6 flex items-center justify-between">
         <button 
           onClick={onBack}
           className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg flex items-center justify-center text-slate-800 hover:scale-110 active:scale-95 transition-all"
         >
            <ChevronLeft size={24} strokeWidth={3} />
         </button>
         <div className="flex gap-3">
            <button className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg flex items-center justify-center text-slate-800 hover:scale-110 active:scale-95 transition-all">
                <Share2 size={20} />
            </button>
            <button className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg flex items-center justify-center text-red-500 hover:scale-110 active:scale-95 transition-all">
                <Heart size={20} />
            </button>
         </div>
      </header>

      {/* Main Content Scrollable Area */}
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-32">
         
         {/* Product Image Section */}
         <div className="relative w-full h-[400px] px-4 pt-4">
            <div className="w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
               <img 
                 src="https://images.unsplash.com/photo-1517336714460-4c742a27744b?auto=format&fit=crop&q=80&w=800" 
                 alt="MacBook Pro M2" 
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/20 to-transparent"></div>
               
               {/* Floating Price Tag */}
               <div className="absolute top-6 right-6 bg-brand text-white px-5 py-2.5 rounded-2xl font-black shadow-xl shadow-brand/40 animate-bounce-subtle">
                  ₹ 250<span className="text-blue-100/60 font-bold">/day</span>
               </div>
               
               {/* Location / Availability Badge */}
               <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md text-slate-800 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                  <MapPin size={12} className="text-brand" /> Columbia Hostel
               </div>
            </div>
         </div>

         {/* Product Info */}
         <div className="px-6 mt-8">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-tight mb-4">MacBook Pro M2</h1>
            
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-lg overflow-hidden">
                     <Image src="/ankit-avatar.png" alt="Ankit" width={48} height={48} />
                  </div>
                  <div>
                     <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Owner</p>
                     <h4 className="font-black text-slate-800">Ankit Sharma</h4>
                  </div>
               </div>
               <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-xl border border-emerald-100/50 mb-1">
                     <Star size={12} fill="currentColor" />
                     <span className="font-black text-[12px]">Trust: 85</span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-400">Verified Listing</p>
               </div>
            </div>

            {/* Pricing Summary Card */}
            <div className="bg-brand/5 border border-brand/10 p-5 rounded-[2rem] mb-8 flex items-center justify-between group shadow-sm">
               <div className="flex flex-col gap-1">
                  <span className="text-2xl font-black text-brand tracking-tighter">₹ 250<span className="text-sm font-bold text-slate-400"> / day</span></span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Pricing Structure</span>
               </div>
               <div className="h-8 w-[1px] bg-brand/20"></div>
               <div className="flex flex-col items-end gap-1">
                  <span className="text-[15px] font-black text-slate-800">₹ 1000</span>
                  <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">Refundable Dep.</span>
               </div>
            </div>

            {/* AI Insights Section */}
            <div className="mb-8">
               <div className="flex items-center gap-2 mb-4">
                  <Zap size={18} className="text-brand fill-brand/20" />
                  <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.2em]">AI Insights</h3>
               </div>
               
               <div className="flex flex-col gap-3">
                  <InsightItem icon={<Clock className="text-brand" />} text="Recommended Duration: 7 days" />
                  <InsightItem 
                    icon={<TrendingDown className="text-orange-500" />} 
                    text={<span>Price is slightly high <span className="text-slate-400 strike-through">₹250</span> → <span className="text-emerald-500">Suggest ₹230/day</span></span>} 
                  />
                  <InsightItem icon={<ShieldCheck className="text-emerald-500" />} text="Trust Level: Safe User" />
               </div>
            </div>

            {/* Item Information */}
            <div className="mb-6">
               <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Item Information</h3>
               <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col gap-1">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Condition</span>
                     <span className="text-[15px] font-black text-slate-700">Pristine Good</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col gap-1">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Used</span>
                     <span className="text-[15px] font-black text-slate-700">2 days ago</span>
                  </div>
               </div>
               
               {/* Calendar Card */}
               <div className="bg-white rounded-[2rem] border border-slate-100 p-5 shadow-sm group hover:border-brand/40 transition-colors cursor-pointer">
                  <div className="flex justify-between items-center mb-4">
                     <h4 className="text-[13px] font-black text-slate-800">Availability Preview</h4>
                     <span className="text-[11px] font-bold text-brand flex items-center gap-1 group-hover:gap-2 transition-all">View Calendar <ChevronRight size={14} /></span>
                  </div>
                  <div className="flex justify-between">
                     {['M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                        <div key={i} className={`flex flex-col items-center gap-1`}>
                           <span className="text-[10px] text-slate-400 font-bold">{day}</span>
                           <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${i < 4 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-300'}`}>
                              {22 + i}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

         </div>
      </div>

      {/* Sticky Bottom Actions */}
      <footer className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 p-6 z-30 flex flex-col gap-4">
         <button className="w-full bg-brand text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-brand/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
            RENT NOW
         </button>
         <div className="flex gap-4">
            <button className="flex-1 bg-slate-50 text-slate-800 py-4 rounded-2xl font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors border border-slate-200/50">
               <MessageCircle size={18} /> Chat with Owner
            </button>
            <button className="flex items-center justify-center w-16 bg-slate-50 rounded-2xl border border-slate-200/50 hover:bg-slate-100 transition-colors">
               <Heart size={20} className="text-slate-400" />
            </button>
         </div>
      </footer>
    </div>
  );
}

function InsightItem({ icon, text }: { icon: React.ReactNode, text: React.ReactNode }) {
   return (
      <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-brand/20 transition-all">
         <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
            {icon}
         </div>
         <span className="text-[13px] md:text-[14px] font-bold text-slate-600">{text}</span>
      </div>
   );
}
