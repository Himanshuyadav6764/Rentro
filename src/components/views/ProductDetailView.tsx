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
  MapPin,
  Shield,
  ArrowRight
} from 'lucide-react';
import Image from 'next/image';

interface ProductDetailViewProps {
  productId?: string;
  onBack: () => void;
}

export default function ProductDetailView({ productId, onBack }: ProductDetailViewProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col font-sans animate-in slide-in-from-bottom-6 duration-700">
      
      {/* Top Navigation Bar - Glassmorphism */}
      <header className="absolute top-0 left-0 right-0 z-50 px-6 py-8 flex items-center justify-between pointer-events-none">
         <button 
           onClick={onBack}
           className="w-12 h-12 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl flex items-center justify-center text-slate-800 hover:scale-110 active:scale-95 transition-all pointer-events-auto border border-white/40 group"
         >
            <ChevronLeft size={24} strokeWidth={3} className="group-hover:-translate-x-0.5 transition-transform" />
         </button>
         <div className="flex gap-3 pointer-events-auto">
            <button className="w-12 h-12 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl flex items-center justify-center text-slate-800 hover:scale-110 active:scale-95 transition-all border border-white/40">
                <Share2 size={20} />
            </button>
            <button className="w-12 h-12 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl flex items-center justify-center text-red-500 hover:scale-110 active:scale-95 transition-all border border-white/40">
                <Heart size={20} fill="currentColor" className="text-red-500" />
            </button>
         </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto hide-scrollbar bg-[#fcfdfe]">
         
         {/* Immersive Image Header */}
         <div className="relative w-full h-[50vh] md:h-[60vh] min-h-[400px]">
            <div className="absolute inset-0 bg-slate-100">
               <img 
                 src="https://images.unsplash.com/photo-1517336714460-4c742a27744b?auto=format&fit=crop&q=80&w=1200" 
                 alt="MacBook Pro M2" 
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-white"></div>
            </div>
            
            {/* Price Floating Plate */}
            <div className="absolute bottom-10 right-8 bg-brand/90 backdrop-blur-2xl text-white p-5 rounded-[2.5rem] shadow-2xl shadow-brand/40 border border-white/20 animate-in zoom-in duration-500 delay-300">
               <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Rental Price</p>
               <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black tracking-tighter">₹ 250</span>
                  <span className="text-sm font-bold opacity-60">/day</span>
               </div>
            </div>

            <div className="absolute bottom-10 left-8 flex items-center gap-3 bg-white/30 backdrop-blur-md rounded-2xl px-4 py-2 text-white border border-white/20 shadow-lg">
                <MapPin size={16} className="text-white" />
                <span className="text-[13px] font-black uppercase tracking-widest">Main Campus • Area 4</span>
            </div>
         </div>

         {/* Product Details Section */}
         <div className="relative -mt-10 bg-[#fcfdfe] rounded-t-[3rem] px-6 md:px-12 pt-12 pb-40 max-w-5xl mx-auto w-full">
            
            {/* Title & Badge */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
               <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                     <span className="bg-brand/10 text-brand px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">Electronics</span>
                     <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1"><Shield size={10} /> Fully Insured</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-none">MacBook Pro M2</h1>
               </div>
               
               <div className="flex items-center gap-4 bg-white p-3 rounded-3xl shadow-sm border border-slate-100">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg border-2 border-white bg-blue-50">
                     <img src="/ankit-avatar.png" alt="Ankit Sharma" className="w-full h-full object-cover" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Verified Owner</p>
                     <p className="text-[17px] font-black text-slate-800">Ankit Sharma</p>
                     <div className="flex items-center gap-1.5 mt-1">
                        <div className="flex items-center gap-0.5 bg-brand/5 text-brand px-2 py-0.5 rounded-lg text-[11px] font-black">
                           <Star size={10} fill="currentColor" /> 4.9
                        </div>
                        <span className="text-[11px] font-bold text-slate-400">12+ Successful Rentals</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* AI Trust Architecture Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
               
               {/* AI Intelligence Card */}
               <div className="bg-slate-900 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-2xl">
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-brand/30 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
                  
                  <div className="relative z-10">
                     <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-md">
                           <Zap size={24} className="text-brand fill-brand/20" />
                        </div>
                        <div>
                           <h3 className="text-white font-black text-lg tracking-tight leading-none uppercase tracking-[0.1em]">AI Analysis</h3>
                           <p className="text-slate-400 text-[11px] font-bold mt-1">REAL-TIME RISK ASSESSMENT</p>
                        </div>
                     </div>

                     <div className="space-y-5">
                         <div className="flex items-start gap-4">
                            <div className="mt-1 bg-emerald-500 rounded-full p-1"><CheckCircle2 size={12} className="text-white" /></div>
                            <div>
                               <p className="text-white font-black text-sm">Safe Transaction Verified</p>
                               <p className="text-slate-400 text-[11px] font-medium leading-relaxed">Owner has a high trust score and verified item condition.</p>
                            </div>
                         </div>
                         <div className="flex items-start gap-4">
                            <div className="mt-1 bg-brand rounded-full p-1"><Clock size={12} className="text-white" /></div>
                            <div>
                               <p className="text-white font-black text-sm">Market Recommendation</p>
                               <p className="text-slate-400 text-[11px] font-medium leading-relaxed">Most students rent this for <span className="text-white font-bold">7-10 days</span> for best value.</p>
                            </div>
                         </div>
                     </div>

                     <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                        <span className="text-white font-black text-[12px] uppercase tracking-widest opacity-80">Trust Sentiment</span>
                        <div className="flex gap-1.5 font-black text-emerald-400 text-[12px]">
                           <span>POSITIVE</span>
                           <TrendingUp size={16} />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Pricing Detail Card */}
               <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-10">
                     <div>
                        <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Investment Summary</h3>
                        <div className="flex flex-col gap-2">
                           <div className="flex justify-between items-center text-slate-600 font-bold">
                              <span>Daily Rent</span>
                              <span className="text-slate-900">₹ 250</span>
                           </div>
                           <div className="flex justify-between items-center text-slate-600 font-bold">
                              <span>Security Deposit</span>
                              <span className="text-slate-900">₹ 1,000</span>
                           </div>
                           <div className="flex justify-between items-center text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-xl mt-2">
                              <span>Refund Policy</span>
                              <span>100% Refundable</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="bg-slate-50 rounded-[2rem] p-5 flex items-center gap-4">
                     <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand">
                        <Info size={28} />
                     </div>
                     <div>
                        <p className="text-slate-800 font-black text-sm">Rental Protection</p>
                        <p className="text-slate-400 text-[11px] font-medium leading-tight">This listing is covered under our <span className="text-brand font-bold">Student Safety Plus</span> program.</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Availability Grid */}
            <div className="mb-12">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[15px] font-black text-slate-800 uppercase tracking-[0.2em]">Item Availability</h3>
                  <button className="text-brand font-black text-[12px] uppercase tracking-widest flex items-center gap-1.5 hover:gap-3 transition-all">
                     View Full Calendar <ArrowRight size={14} />
                  </button>
               </div>
               
               <div className="grid grid-cols-7 gap-3">
                  {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-3">
                       <span className="text-[10px] font-black text-slate-400 opacity-60">{day}</span>
                       <div className={`w-full aspect-square md:w-20 md:h-20 rounded-3xl flex flex-col items-center justify-center gap-1 transition-all shadow-sm ${i < 5 ? 'bg-white border-2 border-emerald-500/20 shadow-emerald-200/20' : 'bg-slate-50 border-2 border-slate-100 opacity-40'}`}>
                          <span className={`text-[17px] font-black ${i < 5 ? 'text-slate-800' : 'text-slate-400'}`}>{22 + i}</span>
                          {i < 5 && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50"></div>}
                       </div>
                    </div>
                  ))}
               </div>
            </div>

         </div>
      </div>

      {/* Premium Sticky Footer */}
      <footer className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-3xl border-t border-slate-100 p-8 z-50 flex items-center justify-between max-w-7xl mx-auto w-full shadow-[0_-20px_50px_rgba(0,0,0,0.05)]">
         <div className="hidden lg:flex flex-col">
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Total Estimated Rent</p>
            <div className="flex items-baseline gap-1.5">
               <span className="text-3xl font-black text-slate-900 tracking-tighter">₹ 1,750</span>
               <span className="text-sm font-bold text-slate-400">/ 7 days</span>
            </div>
         </div>

         <div className="flex flex-1 lg:flex-[0.5] items-center gap-4">
            <button className="flex-1 min-h-[72px] bg-brand text-white rounded-[1.8rem] font-black text-lg tracking-tight shadow-2xl shadow-brand/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group px-8">
               RENT THIS ITEM
               <div className="bg-white/20 p-1.5 rounded-full group-hover:translate-x-1 transition-transform">
                  <ArrowRight size={18} strokeWidth={3} />
               </div>
            </button>
            
            <button className="w-[72px] h-[72px] bg-slate-50 rounded-[1.8rem] flex items-center justify-center text-slate-600 hover:bg-brand/5 hover:text-brand transition-all border border-slate-100 group shadow-inner">
               <MessageCircle size={28} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
            </button>
         </div>
      </footer>
    </div>
  );
}
