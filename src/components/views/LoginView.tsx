"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  ChevronLeft, 
  ChevronRight,
  Mail,
  BookOpen,
  Laptop
} from 'lucide-react';

interface LoginViewProps {
  onLogin: () => void;
  onClose: () => void;
}

const CAROUSEL_ITEMS = [
  {
    title: "Rent everything you need for college from your seniors.",
    icon: (
      <div className="flex items-center justify-center gap-1">
         <div className="relative">
            <div className="w-16 h-16 bg-blue-100 rounded-[1.5rem] flex items-center justify-center rotate-3 transform shadow-lg text-blue-600">
               <BookOpen size={32} strokeWidth={2.5} />
            </div>
            <div className="absolute -top-4 -right-4 w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center opacity-70 text-emerald-600">
               <div className="font-black text-xs">₹</div>
            </div>
         </div>
      </div>
    )
  },
  {
    title: "Find books, calculators, and laptops in one place.",
    icon: (
      <div className="flex items-center justify-center text-slate-300">
         <div className="p-6 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
            <Laptop size={64} strokeWidth={1.5} />
         </div>
      </div>
    )
  },
  {
    title: "Safe and verified marketplace for your campus.",
    icon: (
      <div className="flex items-center justify-center text-blue-500">
         <div className="relative">
            <div className="absolute inset-0 bg-blue-100 blur-2xl rounded-full"></div>
            <Smartphone size={64} className="relative z-10" />
         </div>
      </div>
    )
  }
];

export default function LoginView({ onLogin, onClose }: LoginViewProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CAROUSEL_ITEMS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center transition-all animate-in fade-in duration-300">
      
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-slate-800 hover:bg-slate-50 rounded-full transition-all"
      >
        <X size={32} strokeWidth={1.5} />
      </button>

      <div className="w-full max-w-sm flex flex-col items-center px-8 relative">
        
        {/* Navigation Arrows */}
        <button 
           onClick={() => setActiveIndex((activeIndex - 1 + CAROUSEL_ITEMS.length) % CAROUSEL_ITEMS.length)}
           className="absolute left-2 top-[35%] -translate-y-1/2 p-2 text-slate-300 hover:text-slate-600 transition-colors"
        >
           <ChevronLeft size={32} />
        </button>
        <button 
           onClick={() => setActiveIndex((activeIndex + 1) % CAROUSEL_ITEMS.length)}
           className="absolute right-2 top-[35%] -translate-y-1/2 p-2 text-slate-300 hover:text-slate-600 transition-colors"
        >
           <ChevronRight size={32} />
        </button>

        {/* Carousel Content */}
        <div className="h-48 flex flex-col items-center justify-center mb-6">
           <div className="mb-8 transform transition-all duration-700 animate-in zoom-in-50">
              {CAROUSEL_ITEMS[activeIndex].icon}
           </div>
           <h2 className="text-[19px] font-black text-center text-[#002f34] leading-tight px-4 max-w-[280px] tracking-tight">
              {CAROUSEL_ITEMS[activeIndex].title}
           </h2>
        </div>

        {/* Pagination Dots */}
        <div className="flex gap-2 mb-12">
           {CAROUSEL_ITEMS.map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${i === activeIndex ? 'bg-blue-600' : 'bg-slate-200'}`}
              ></div>
           ))}
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3">
           {/* Phone Login */}
           <button 
             onClick={onLogin}
             className="w-full border-2 border-[#002f34] py-3.5 rounded-lg flex items-center justify-center gap-4 hover:bg-[#002f34]/5 transition-all font-bold text-[#002f34] text-[15px]"
           >
              <Smartphone size={20} />
              <span>Continue with phone</span>
           </button>

           {/* Google Login (OLX Style) */}
           <button 
             onClick={onLogin}
             className="w-full border border-slate-200 py-3.5 rounded-lg flex items-center justify-between px-4 hover:bg-slate-50 transition-all shadow-sm"
           >
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[14px]">
                    S
                 </div>
                 <div className="flex flex-col items-start leading-none">
                    <span className="text-[14px] font-bold text-slate-700">Continue as Shekhar</span>
                    <span className="text-[12px] text-slate-400 mt-0.5">shekharyv2037@gmail.com</span>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                 <ChevronRight size={16} className="text-slate-400" />
                 <svg className="w-6 h-6 border p-1 rounded-sm border-slate-100" viewBox="0 0 24 24">
                   <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                   <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                   <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                   <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                 </svg>
              </div>
           </button>
        </div>

        {/* Divider */}
        <div className="my-8 text-center relative w-full flex items-center justify-center">
           <span className="text-[13px] font-black text-[#002f34] uppercase tracking-widest relative z-10 bg-white px-4">OR</span>
        </div>

        {/* Email Login */}
        <button 
           onClick={onLogin}
           className="text-[15px] font-bold text-[#002f34] underline underline-offset-4 decoration-2 hover:opacity-75 transition-colors"
        >
           Login with Email
        </button>

        {/* Footer Text */}
        <div className="mt-16 text-center space-y-4 px-4">
           <p className="text-[12px] text-slate-400 font-medium tracking-tight">All your personal details are safe with us.</p>
           <p className="text-[12px] text-slate-400 leading-relaxed font-medium">
             If you continue, you are accepting <a href="#" className="text-blue-500 font-bold hover:underline">Rentro Terms and Conditions and Privacy Policy</a>
           </p>
        </div>
      </div>
    </div>
  );
}
