import React from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, MapPin } from 'lucide-react';

export default function HomeView() {
  return (
    <div className="flex-1 overflow-x-hidden bg-[#f8fafe] sm:bg-white pb-24 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto w-full">
        {/* Location Area */}
        <div className="px-4 sm:px-8 pt-6 pb-2">
          <button className="flex items-center gap-1.5 text-slate-700 font-medium hover:opacity-80 transition-opacity">
            <MapPin className="w-4 h-4" />
            <span className="text-[15px] sm:text-[16px]">Columbia Hostel Area</span>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Categories */}
        <div className="px-4 sm:px-8 py-4">
          <div className="flex justify-start sm:justify-center items-start gap-6 sm:gap-10 overflow-x-auto hide-scrollbar pb-2">
            
            <div className="flex flex-col items-center gap-2 min-w-[72px]">
              <div className="w-[72px] h-[72px] bg-[#f0f4f8] rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                 <div className="relative">
                    <div className="w-8 h-[6px] bg-blue-800 rounded mb-0.5 transform -skew-x-[20deg]"></div>
                    <div className="w-9 h-[6px] bg-emerald-700 rounded mb-0.5 transform -skew-x-[20deg]"></div>
                    <div className="w-10 h-[6px] bg-orange-200 rounded mb-0.5 transform -skew-x-[20deg]"></div>
                    <div className="w-11 h-[6px] bg-red-800 rounded transform -skew-x-[20deg]"></div>
                 </div>
              </div>
              <span className="text-xs font-medium text-slate-700">Books</span>
            </div>

            <div className="flex flex-col items-center gap-2 min-w-[72px]">
              <div className="w-[72px] h-[72px] bg-[#f0f4f8] rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                <div className="relative flex flex-col items-center">
                  <div className="w-10 h-7 bg-sky-200 border-2 border-slate-700 rounded-t-lg relative overflow-hidden">
                     <div className="absolute inset-0 bg-white opacity-20 transform -rotate-45 scale-150 translate-x-3"></div>
                  </div>
                  <div className="w-12 h-1.5 bg-slate-400 rounded-b-md"></div>
                </div>
              </div>
              <span className="text-xs font-medium text-slate-700">Laptops</span>
            </div>

            <div className="flex flex-col items-center gap-2 min-w-[72px]">
              <div className="w-[72px] h-[72px] bg-[#f0f4f8] rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                <div className="w-7 h-9 bg-slate-700 rounded-sm flex flex-col items-center pt-1 px-1">
                  <div className="w-full h-2.5 bg-cyan-100 rounded-[2px] mb-1"></div>
                  <div className="grid grid-cols-3 gap-[2px] w-full">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-[1px] ${i >= 9 ? 'bg-orange-400' : 'bg-slate-400'}`}></div>
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-xs font-medium text-slate-700">Calculators</span>
            </div>

            <div className="flex flex-col items-center gap-2 min-w-[72px]">
              <div className="w-[72px] h-[72px] bg-[#f0f4f8] rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                <div className="w-6 h-10 bg-[#284b82] border-2 border-slate-800 rounded-[4px] relative">
                  <div className="absolute top-[2px] left-1/2 transform -translate-x-1/2 w-2 h-[2px] bg-slate-800 rounded-full"></div>
                </div>
              </div>
              <span className="text-xs font-medium text-slate-700">Phones</span>
            </div>

            <div className="flex flex-col items-center gap-2 min-w-[72px]">
              <div className="w-[72px] h-[72px] bg-[#f0f4f8] rounded-xl flex items-center justify-center shadow-sm border border-slate-100 relative">
                <div className="flex flex-col items-center translate-y-1">
                   <div className="w-4 h-3 bg-yellow-200 clip-path-lamp transform -rotate-12 translate-x-2 translate-y-1"></div>
                   <div className="w-0.5 h-4 bg-slate-400 translate-x-3 transform rotate-12"></div>
                   <div className="w-3 h-1 bg-slate-800 rounded-t-sm translate-x-2"></div>
                   <div className="absolute right-2 bottom-3 w-6 h-4 bg-blue-500 rounded-sm"></div>
                   <div className="absolute right-1 bottom-3 w-3 h-2 bg-blue-300"></div>
                </div>
              </div>
              <span className="text-xs font-medium text-slate-700">Essentials</span>
            </div>

          </div>
        </div>

        {/* Trust Banner */}
        <div className="px-4 py-2 mt-2">
          <div className="bg-[#eaf8f4] border border-[#a7d9c8] rounded-[10px] p-3 flex flex-col relative overflow-hidden">
             <div className="absolute inset-0 opacity-[0.15]">
               <svg width="100%" height="100%" preserveAspectRatio="none">
                  <path d="M0,50 Q20,10 40,50 T80,50 T120,50 T160,50 T200,50" stroke="#219653" strokeWidth="1" fill="none" />
                  <path d="M20,60 Q40,20 60,60 T100,60 T140,60 T180,60 T220,60" stroke="#219653" strokeWidth="1" fill="none" />
               </svg>
             </div>
             <div className="relative z-10 flex items-start gap-3">
               <div className="bg-[#219653] p-1.5 rounded-full mt-0.5 border border-[#1b7d44]">
                 <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={3} />
               </div>
               <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1a382b] text-[17px]">Your Trust Score: 78</span>
                    <CheckCircle2 className="w-[18px] h-[18px] text-[#219653]" fill="#219653" stroke="white" strokeWidth={1} />
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 cursor-pointer hover:opacity-80">
                    <span className="text-[13px] text-slate-600">Improve score to reduce deposit | <span className="font-medium text-[#1c2b4c]">TrustRent AI</span></span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#1c2b4c]" />
                  </div>
               </div>
             </div>
          </div>
        </div>

        {/* Featured Rentals */}
        <div className="px-5 mt-5 pb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-[17px] font-bold text-[#1b52d6]">Featured Rentals</h2>
            <button className="text-sm font-medium text-[#1c2b4c] flex items-center gap-0.5 hover:underline">
              View All <ChevronRight className="w-4 h-4 pt-[1px]" />
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-4 -mx-5 px-5">
            {/* Item 1 */}
            <div className="min-w-[170px] bg-white border border-slate-200 rounded-md overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] pb-3 flex flex-col cursor-pointer hover:shadow-md transition">
              <div className="h-[100px] bg-slate-100 w-full relative flex items-center justify-center p-2">
                 <div className="w-[80%] h-[70%] bg-white/50 relative overflow-hidden backdrop-blur-sm rounded">
                   <div className="absolute bottom-1 right-2 w-16 h-3 bg-[#8b7355] rounded-sm transform rotate-1"></div>
                   <div className="absolute bottom-4 right-2 w-15 h-2.5 bg-[#4a6b5d] rounded-sm transform -rotate-2"></div>
                   <div className="absolute bottom-6 right-2 w-16 h-2 bg-[#6b5d4a] rounded-sm"></div>
                 </div>
              </div>
              <div className="px-2 pt-2 flex flex-col gap-0.5">
                <h3 className="font-bold text-[14px] text-[#1c2b4c] leading-tight truncate">Engineering Books</h3>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-bold text-[15px] text-[#1c2b4c]">₹ 20</span>
                  <span className="text-[13px] text-slate-500">/day</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 text-[#219653]">
                  <CheckCircle2 className="w-[14px] h-[14px]" fill="#219653" stroke="white" strokeWidth={1.5} />
                  <span className="text-[12px] text-slate-600 font-medium">Deposit: ₹ 100</span>
                </div>
              </div>
            </div>

            {/* Item 2 */}
            <div className="min-w-[170px] bg-white border border-slate-200 rounded-md overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] pb-3 flex flex-col cursor-pointer hover:shadow-md transition">
              <div className="h-[100px] bg-slate-100 w-full relative flex items-center justify-center p-2">
                 <div className="w-10 h-10 bg-[#2a2d36] rounded shadow-md flex flex-col p-1">
                   <div className="w-full h-3 bg-[#8ebfa1] rounded-sm mb-1 text-[7px] text-right pr-0.5">122</div>
                   <div className="grid grid-cols-3 gap-[2px] flex-1">
                      {[...Array(9)].map((_, i) => <div key={i} className="bg-[#41434c] rounded-[1px]"></div>)}
                   </div>
                 </div>
              </div>
              <div className="px-2 pt-2 flex flex-col gap-0.5">
                <h3 className="font-bold text-[14px] text-[#1c2b4c] leading-tight truncate">Casio Calculator</h3>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-bold text-[15px] text-[#1c2b4c]">₹ 10</span>
                  <span className="text-[13px] text-slate-500">/day</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 text-[#219653]">
                  <CheckCircle2 className="w-[14px] h-[14px]" fill="#219653" stroke="white" strokeWidth={1.5} />
                  <span className="text-[12px] text-slate-600 font-medium">Deposit: ₹ 50</span>
                </div>
              </div>
            </div>

            {/* Item 3 */}
            <div className="min-w-[170px] bg-white border border-slate-200 rounded-md overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] pb-3 flex flex-col cursor-pointer hover:shadow-md transition">
              <div className="h-[100px] bg-slate-100 w-full relative flex items-center justify-center p-2">
                 <div className="w-[90%] h-full bg-[#f1eedc] relative overflow-hidden rounded flex items-center justify-center">
                   <div className="absolute inset-x-0 bottom-0 h-4 bg-[#d0b490]"></div>
                   <div className="relative flex flex-col items-center">
                     <div className="w-16 h-10 bg-slate-800 border-[2px] border-slate-700 rounded-t-md relative overflow-hidden">
                       <div className="absolute inset-0 bg-blue-500 opacity-90"></div>
                     </div>
                     <div className="w-20 h-1.5 bg-slate-300 rounded-b-md shadow-lg"></div>
                   </div>
                 </div>
              </div>
              <div className="px-2 pt-2 flex flex-col gap-0.5">
                <h3 className="font-bold text-[14px] text-[#1c2b4c] leading-tight truncate">Dell Laptop</h3>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-bold text-[15px] text-[#1c2b4c]">₹ 100</span>
                  <span className="text-[13px] text-slate-500">/day</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 text-[#219653]">
                  <CheckCircle2 className="w-[14px] h-[14px]" fill="#219653" stroke="white" strokeWidth={1.5} />
                  <span className="text-[12px] text-slate-600 font-medium">Deposit: ₹ 300</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
