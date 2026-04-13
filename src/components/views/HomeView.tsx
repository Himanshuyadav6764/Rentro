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
          <div className="flex justify-start items-start gap-4 sm:gap-6 overflow-x-auto hide-scrollbar pb-3 px-2 sm:px-0">
            
            {/* Academic */}
            <div className="flex flex-col items-center gap-2 min-w-[72px] sm:min-w-[85px]">
              <div className="w-[72px] h-[72px] bg-[#f0f4f8] rounded-xl flex items-center justify-center shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition cursor-pointer">
                 <div className="relative">
                    <div className="w-8 h-[6px] bg-blue-800 rounded mb-0.5 transform -skew-x-[20deg]"></div>
                    <div className="w-9 h-[6px] bg-emerald-700 rounded mb-0.5 transform -skew-x-[20deg]"></div>
                    <div className="w-10 h-[6px] bg-orange-200 rounded mb-0.5 transform -skew-x-[20deg]"></div>
                    <div className="w-11 h-[6px] bg-red-800 rounded transform -skew-x-[20deg]"></div>
                 </div>
              </div>
              <span className="text-xs font-medium text-slate-700">Academic</span>
            </div>

            {/* Electronics */}
            <div className="flex flex-col items-center gap-2 min-w-[72px] sm:min-w-[85px]">
              <div className="w-[72px] h-[72px] bg-[#f0f4f8] rounded-xl flex items-center justify-center shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition cursor-pointer">
                <div className="relative flex flex-col items-center">
                  <div className="w-10 h-7 bg-sky-200 border-2 border-slate-700 rounded-t-lg relative overflow-hidden">
                     <div className="absolute inset-0 bg-white opacity-20 transform -rotate-45 scale-150 translate-x-3"></div>
                  </div>
                  <div className="w-12 h-1.5 bg-slate-400 rounded-b-md shadow-sm"></div>
                </div>
              </div>
              <span className="text-xs font-medium text-slate-700">Electronics</span>
            </div>

            {/* Furniture */}
            <div className="flex flex-col items-center gap-2 min-w-[72px] sm:min-w-[85px]">
              <div className="w-[72px] h-[72px] bg-[#f0f4f8] rounded-xl flex items-center justify-center shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition cursor-pointer">
                <div className="relative flex flex-col items-center mt-2">
                  <div className="w-8 h-2 bg-[#8b5a2b] rounded-sm shadow-sm z-10"></div>
                  <div className="flex gap-4 absolute top-2">
                     <div className="w-1.5 h-6 bg-[#6b4423] rounded-b-sm"></div>
                     <div className="w-1.5 h-6 bg-[#6b4423] rounded-b-sm"></div>
                  </div>
                  <div className="absolute bottom-[4px] w-6 h-8 bg-[#8b5a2b] rounded-md -z-10 translate-y-[-100%] shadow-sm"></div>
                </div>
              </div>
              <span className="text-xs font-medium text-slate-700">Furniture</span>
            </div>

            {/* Clothing */}
            <div className="flex flex-col items-center gap-2 min-w-[72px] sm:min-w-[85px]">
              <div className="w-[72px] h-[72px] bg-[#f0f4f8] rounded-xl flex items-center justify-center shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition cursor-pointer">
                <div className="relative">
                   <div className="w-10 h-10 bg-indigo-500 rounded-lg relative overflow-hidden shadow-sm">
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-[#f0f4f8] rounded-b-full"></div>
                      <div className="absolute top-0 left-[-4px] w-4 h-4 bg-[#f0f4f8] transform rotate-45"></div>
                      <div className="absolute top-0 right-[-4px] w-4 h-4 bg-[#f0f4f8] transform -rotate-45"></div>
                   </div>
                </div>
              </div>
              <span className="text-xs font-medium text-slate-700">Clothing</span>
            </div>

            {/* Transport */}
            <div className="flex flex-col items-center gap-2 min-w-[72px] sm:min-w-[85px]">
              <div className="w-[72px] h-[72px] bg-[#f0f4f8] rounded-xl flex items-center justify-center shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition cursor-pointer">
                <div className="relative w-12 h-8 mt-2">
                   <div className="absolute bottom-0 left-0 w-4 h-4 border-[3px] border-slate-700 rounded-full flex items-center justify-center"><div className="w-1 h-1 bg-slate-400 rounded-full"></div></div>
                   <div className="absolute bottom-0 right-0 w-4 h-4 border-[3px] border-slate-700 rounded-full flex items-center justify-center"><div className="w-1 h-1 bg-slate-400 rounded-full"></div></div>
                   <div className="absolute bottom-2 left-2 w-8 h-1 bg-[#219653] transform -rotate-12 rounded-full"></div>
                   <div className="absolute bottom-2 right-2 w-1 h-6 bg-[#219653] transform rotate-12 rounded-full"></div>
                   <div className="absolute top-[-2px] right-2 w-2 h-1.5 bg-slate-800 rounded-sm"></div>
                </div>
              </div>
              <span className="text-xs font-medium text-slate-700">Transport</span>
            </div>

            {/* Entertainment */}
            <div className="flex flex-col items-center gap-2 min-w-[72px] sm:min-w-[85px]">
              <div className="w-[72px] h-[72px] bg-[#f0f4f8] rounded-xl flex items-center justify-center shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition cursor-pointer">
                <div className="relative w-11 h-7 bg-[#ff5e5e] rounded-full flex items-center justify-between px-2 shadow-sm">
                   <div className="w-3 h-3 bg-[#cc0000] rounded-full flex items-center justify-center relative shadow-inner">
                     <div className="w-full h-[1.5px] bg-white/70 absolute"></div>
                     <div className="w-[1.5px] h-full bg-white/70 absolute"></div>
                   </div>
                   <div className="flex gap-0.5 transform rotate-45">
                     <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full shadow-sm"></div>
                     <div className="w-1.5 h-1.5 bg-blue-300 rounded-full shadow-sm"></div>
                   </div>
                </div>
              </div>
              <span className="text-xs font-medium text-slate-700">Entertainment</span>
            </div>

            {/* Services */}
            <div className="flex flex-col items-center gap-2 min-w-[72px] sm:min-w-[85px]">
              <div className="w-[72px] h-[72px] bg-[#f0f4f8] rounded-xl flex items-center justify-center shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition cursor-pointer">
                <div className="relative flex flex-col items-center">
                   <div className="w-8 h-6 bg-amber-400 rounded-t-xl relative flex items-center justify-center overflow-hidden shadow-sm">
                     <div className="absolute bottom-[-6px] w-7 h-7 bg-[#f0f4f8] rounded-full"></div>
                   </div>
                   <div className="w-3 h-5 bg-slate-500 rounded-b-md shadow-sm"></div>
                </div>
              </div>
              <span className="text-xs font-medium text-slate-700">Services</span>
            </div>

            {/* Projects */}
            <div className="flex flex-col items-center gap-2 min-w-[72px] sm:min-w-[85px]">
              <div className="w-[72px] h-[72px] bg-[#f0f4f8] rounded-xl flex items-center justify-center shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition cursor-pointer">
                <div className="relative w-9 h-9 bg-slate-800 rounded-md border-2 border-[#10b981] flex items-center justify-center p-1 shadow-md">
                   <div className="w-full h-full border border-slate-600 flex flex-col justify-between p-0.5">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                      <div className="w-1 h-1 bg-slate-400 rounded-full self-end"></div>
                   </div>
                   {/* Pins */}
                   <div className="absolute top-[-4px] left-1 w-1 h-2 bg-yellow-500 rounded-t-[1px]"></div>
                   <div className="absolute top-[-4px] left-4 w-1 h-2 bg-yellow-500 rounded-t-[1px]"></div>
                   <div className="absolute top-[-4px] right-1 w-1 h-2 bg-yellow-500 rounded-t-[1px]"></div>
                   <div className="absolute bottom-[-4px] left-1 w-1 h-2 bg-yellow-500 rounded-b-[1px]"></div>
                   <div className="absolute bottom-[-4px] left-4 w-1 h-2 bg-yellow-500 rounded-b-[1px]"></div>
                   <div className="absolute bottom-[-4px] right-1 w-1 h-2 bg-yellow-500 rounded-b-[1px]"></div>
                </div>
              </div>
              <span className="text-xs font-medium text-slate-700">Projects</span>
            </div>

            {/* Events */}
            <div className="flex flex-col items-center gap-2 min-w-[72px] sm:min-w-[85px]">
              <div className="w-[72px] h-[72px] bg-[#f0f4f8] rounded-xl flex items-center justify-center shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition cursor-pointer">
                <div className="relative flex flex-col items-center">
                   <div className="w-7 h-8 bg-pink-500 rounded-full rounded-b-lg relative overflow-hidden shadow-sm">
                     <div className="w-2 h-4 bg-white/30 rounded-full absolute top-1 left-1 transform rotate-12"></div>
                   </div>
                   <div className="w-[3px] h-1.5 bg-pink-600 rounded-sm"></div>
                   <div className="w-[1px] h-4 bg-slate-400 transform -rotate-12 translate-x-1"></div>
                </div>
              </div>
              <span className="text-xs font-medium text-slate-700">Events</span>
            </div>

            {/* Others */}
            <div className="flex flex-col items-center gap-2 min-w-[72px] sm:min-w-[85px]">
              <div className="w-[72px] h-[72px] bg-[#f0f4f8] rounded-xl flex items-center justify-center shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition cursor-pointer">
                <div className="relative w-8 h-8 bg-[#c2a381] border-2 border-[#8b6134] rounded-sm flex justify-center pt-1 shadow-sm">
                   <div className="w-[90%] h-1 bg-[#8b6134] opacity-80 relative">
                     <div className="absolute top-[-2px] left-1/2 transform -translate-x-1/2 w-3 h-1.5 bg-[#fbc02d]"></div>
                   </div>
                   <div className="absolute inset-0 bg-[#8b6134] opacity-20 transform rotate-12"></div>
                </div>
              </div>
              <span className="text-xs font-medium text-slate-700">Others</span>
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
