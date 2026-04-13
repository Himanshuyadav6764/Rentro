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
  onChatWithOwner?: () => void;
  onRent?: () => void;
}

export default function ProductDetailView({ productId, onBack, onChatWithOwner, onRent }: ProductDetailViewProps) {
  const [isRenting, setIsRenting] = React.useState(false);

  const handleRent = () => {
    setIsRenting(true);
    setTimeout(() => {
      setIsRenting(false);
      onRent?.();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[999] bg-white flex flex-col font-sans animate-in slide-in-from-bottom-10 duration-700">
      
      {/* Top Navigation Bar - Truly Fixed and High Z-Index */}
      <div className="fixed top-0 left-0 right-0 z-[1000] px-6 py-6 flex items-center justify-between pointer-events-none">
         <button 
           onClick={onBack}
           className="w-12 h-12 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl flex items-center justify-center text-slate-800 hover:scale-110 active:scale-95 transition-all pointer-events-auto border border-white/50 group"
         >
            <ChevronLeft size={24} strokeWidth={3} className="group-hover:-translate-x-0.5 transition-transform" />
         </button>
         <div className="flex gap-3 pointer-events-auto">
            <button className="w-12 h-12 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl flex items-center justify-center text-slate-800 hover:scale-110 active:scale-95 transition-all border border-white/50">
                <Share2 size={20} />
            </button>
            <button className="w-12 h-12 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl flex items-center justify-center text-red-500 hover:scale-110 active:scale-95 transition-all border border-white/50">
                <Heart size={20} fill="currentColor" className="text-red-500" />
            </button>
         </div>
      </div>

      {/* Main Content Scroll Container */}
      <div className="flex-1 overflow-y-auto hide-scrollbar bg-[#f8faff] scroll-smooth">
         
         {/* Immersive Image Header */}
         <div className="relative w-full h-[55vh] md:h-[65vh] min-h-[450px]">
            <div className="absolute inset-0 bg-slate-200">
               {/* Using a robust laptop image from Unsplash */}
               <img 
                 src="https://images.unsplash.com/photo-1517336714460-4c742a27744b?q=80&w=2000&auto=format&fit=crop" 
                 alt="MacBook Pro M2" 
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#f8faff]"></div>
            </div>
            
            {/* Price Floating Plate */}
            <div className="absolute bottom-16 right-8 md:right-16 bg-brand text-white p-6 rounded-[2.8rem] shadow-[0_20px_60px_rgba(27,82,214,0.4)] border border-white/20 animate-in zoom-in duration-700 delay-300">
               <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-60 mb-1.5">Daily Rental</p>
               <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black tracking-tighter">₹ 250</span>
               </div>
            </div>

            <div className="absolute bottom-16 left-8 md:left-16 flex items-center gap-3 bg-white/20 backdrop-blur-xl rounded-2xl px-5 py-3 text-white border border-white/10 shadow-2xl">
                <MapPin size={18} className="text-white" />
                <span className="text-[14px] font-black uppercase tracking-[0.1em]">Columbia Campus • Block C</span>
            </div>
         </div>

         {/* Product Details Section */}
         <div className="relative -mt-16 bg-[#f8faff] rounded-t-[4rem] px-6 md:px-16 pt-16 pb-60 max-w-6xl mx-auto w-full">
            
            {/* Title & Badge */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
               <div className="flex-1">
                  <div className="flex items-center gap-2.5 mb-4">
                     <span className="bg-brand/10 text-brand px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border border-brand/5">Electronics</span>
                     <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-emerald-100"><Shield size={12} /> Full Protection</span>
                  </div>
                  <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[0.9]">MacBook Pro M2</h1>
               </div>
               
               <div className="flex items-center gap-5 bg-white p-4 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-xl transition-all group">
                  <div className="w-16 h-16 rounded-[1.5rem] overflow-hidden shadow-2xl border-4 border-white group-hover:scale-105 transition-transform">
                     <img src="/ankit-avatar.png" alt="Ankit Sharma" className="w-full h-full object-cover" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Top Tier Owner</p>
                     <p className="text-[19px] font-black text-slate-800">Ankit Sharma</p>
                     <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex items-center gap-1 bg-[#fdb528] text-white px-2.5 py-0.5 rounded-lg text-[12px] font-black">
                           <Star size={12} fill="currentColor" /> 4.9
                        </div>
                        <span className="text-[12px] font-bold text-slate-500">12 Rents</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Item Description Section */}
            <div className="mb-12">
               <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Description</h3>
               <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm leading-relaxed text-slate-600 font-medium">
                  <p className="mb-4">
                     Experience extreme performance with the <span className="text-slate-900 font-bold">MacBook Pro M2</span>. This powerhouse is equipped with the latest M2 chip, making it perfect for intensive coding, 4K video editing, and complex engineering simulations. 
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 list-disc pl-5 text-[14px]">
                     <li>8-Core CPU / 10-Core GPU</li>
                     <li>16GB Unified Memory / 512GB SSD</li>
                     <li>13.3-inch Retina Display</li>
                     <li>Up to 20 hours battery life</li>
                  </ul>
                  <p className="mt-6 text-[13px] italic bg-brand/5 p-4 rounded-2xl border-l-4 border-brand">
                     &quot;Please handle with care. The item comes with a protective sleeve and original charger. Return in original condition to ensure full deposit refund.&quot;
                  </p>
               </div>
            </div>

            {/* Content Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
               
               {/* Left Column: AI & Stats */}
               <div className="lg:col-span-7 flex flex-col gap-8">
                  <div className="bg-slate-900 rounded-[3rem] p-10 relative overflow-hidden group shadow-2xl">
                     <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-brand/30 rounded-full blur-[100px] group-hover:scale-125 transition-all duration-1000"></div>
                     
                     <div className="relative z-10">
                        <div className="flex items-center gap-5 mb-10">
                           <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center border border-white/20 backdrop-blur-3xl shadow-2xl">
                              <Zap size={32} className="text-[#fdb528] fill-[#fdb528]/20" />
                           </div>
                           <div>
                              <h3 className="text-white font-black text-2xl tracking-tight leading-none uppercase tracking-[0.1em]">AI Rental Logic</h3>
                              <p className="text-slate-400 text-[12px] font-bold mt-2 uppercase tracking-widest opacity-60">Insight version 2.4.0</p>
                           </div>
                        </div>

                        <div className="space-y-6">
                            <AIInsightRow icon={<CheckCircle2 className="text-emerald-400" />} title="Safe User Verified" desc="Our AI scanned 15 previous transactions. 100% safety score." />
                            <AIInsightRow icon={<TrendingDown className="text-brand" />} title="Price Optimization" desc="Found similar items at ₹230. Try negotiating for better value." />
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <StatCard label="Condition" value="Mint" color="text-brand" />
                     <StatCard label="Battery" value="98%" color="text-emerald-500" />
                  </div>
               </div>

               {/* Right Column: Pricing & Quick Info */}
               <div className="lg:col-span-5 flex flex-col gap-8">
                  <div className="bg-white rounded-[3rem] p-4 border border-slate-100 shadow-xl shadow-slate-200/40">
                     <div className="bg-[#f0f4f8] rounded-[2.5rem] p-8">
                        <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Financial Breakdown</h3>
                        <div className="space-y-4">
                           <PriceRow label="Daily Rental" value="₹ 250" />
                           <PriceRow label="Security Deposit" value="₹ 1,000" isBold />
                           <div className="pt-4 mt-4 border-t border-slate-200 flex justify-between items-center bg-emerald-50 px-5 py-3 rounded-2xl">
                              <span className="text-[12px] font-black text-emerald-700 uppercase">Refund Policy</span>
                              <span className="text-[13px] font-black text-emerald-800">PRO-GUARD SAFE</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-lg flex items-center gap-5">
                     <div className="w-16 h-16 bg-brand/5 rounded-3xl flex items-center justify-center text-brand">
                        <ShieldCheck size={32} />
                     </div>
                     <div>
                        <p className="text-slate-900 font-black text-[17px]">Purchase Protection</p>
                        <p className="text-slate-500 text-[13px] font-medium leading-tight">Your funds are safe until you verify the item condition.</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Availability Timeline */}
            <div className="mb-12">
               <div className="flex items-center justify-between mb-8 px-4">
                  <h3 className="text-[18px] font-black text-slate-900 tracking-tight">Availability Index</h3>
                  <button className="text-brand font-black text-[13px] uppercase tracking-widest flex items-center gap-2 group">
                     Full Schedule <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
               </div>
               
               <div className="grid grid-cols-4 md:grid-cols-7 gap-4">
                  {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-4">
                       <span className="text-[11px] font-black text-slate-400">{day}</span>
                       <div className={`w-full aspect-square rounded-[2rem] flex flex-col items-center justify-center gap-1.5 transition-all shadow-md ${i < 5 ? 'bg-white border-2 border-emerald-500/30' : 'bg-slate-100 border-2 border-slate-200 opacity-30 cursor-not-allowed'}`}>
                          <span className={`text-[20px] font-black ${i < 5 ? 'text-slate-900' : 'text-slate-400'}`}>{22 + i}</span>
                          {i < 5 && <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50 pulse-emerald"></div>}
                       </div>
                    </div>
                  ))}
               </div>
            </div>

         </div>
      </div>

      {/* Footer Actions - Multi-layer Glass Design */}
      <div className="fixed bottom-0 left-0 right-0 z-[1001] p-6 md:p-10 pointer-events-none flex justify-center">
         <div className="w-full max-w-5xl bg-white/70 backdrop-blur-3xl border border-white/60 p-5 md:p-7 rounded-[3.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.15)] flex items-center justify-between pointer-events-auto">
            <div className="hidden md:flex flex-col pl-4">
               <p className="text-slate-400 font-black text-[11px] uppercase tracking-[0.2em] mb-1.5">Est. Total</p>
               <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900 tracking-tighter">₹ 1,750</span>
                  <span className="text-[15px] font-black text-slate-400 leading-none">/ 7 DAYS</span>
               </div>
            </div>

            <div className="flex flex-1 md:flex-none items-center gap-5 pr-2">
               <button 
                 onClick={handleRent}
                 disabled={isRenting}
                 className={`flex-1 md:w-[320px] min-h-[80px] rounded-[2.2rem] font-black text-xl tracking-tight shadow-[0_20px_50px_rgba(27,82,214,0.4)] hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center justify-center gap-4 group px-10 ${isRenting ? 'bg-slate-400 cursor-wait' : 'bg-brand text-white'}`}
               >
                  {isRenting ? 'PROCESSING...' : 'RENT NOW'}
                  {!isRenting && (
                    <div className="bg-white/20 p-2 rounded-full group-hover:translate-x-1.5 transition-transform">
                       <ArrowRight size={22} strokeWidth={3} />
                    </div>
                  )}
               </button>
               
               <button 
                 onClick={onChatWithOwner}
                 className="w-20 h-20 bg-slate-100/50 border border-slate-200 rounded-[2.2rem] flex items-center justify-center text-slate-600 hover:bg-brand/10 hover:text-brand transition-all hover:border-brand/20 group"
               >
                  <MessageCircle size={32} strokeWidth={2.5} className="group-hover:scale-110 transition-all" />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}

function AIInsightRow({ icon, title, desc }: { icon: any, title: string, desc: string }) {
   return (
      <div className="flex items-start gap-5">
         <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-white/5">
            {React.cloneElement(icon as React.ReactElement, { size: 24 })}
         </div>
         <div>
            <p className="text-white font-black text-lg tracking-tight mb-1">{title}</p>
            <p className="text-slate-400 text-[13px] font-medium leading-relaxed opacity-80">{desc}</p>
         </div>
      </div>
   );
}

function StatCard({ label, value, color }: { label: string, value: string, color: string }) {
   return (
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-1.5 overflow-hidden relative group hover:shadow-xl transition-all">
         <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
         <span className={`text-2xl font-black ${color}`}>{value}</span>
      </div>
   );
}

function PriceRow({ label, value, isBold }: { label: string, value: string, isBold?: boolean }) {
   return (
      <div className={`flex justify-between items-center text-[15px] ${isBold ? 'text-slate-900 font-black' : 'text-slate-600 font-bold'}`}>
         <span>{label}</span>
         <span>{value}</span>
      </div>
   );
}
