import React from 'react';
import { ChevronDown, Menu, MessageSquare, CheckCircle2 } from 'lucide-react';

export default function RentalsView() {
  return (
    <div className="w-full bg-[#f8fafe] flex flex-col font-sans max-w-6xl mx-auto pb-24 h-full overflow-y-auto">
      
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
           <div className="bg-[#1b52d6] text-white p-1 rounded">
             <MessageSquare className="w-5 h-5 fill-current" />
           </div>
           <h2 className="text-xl font-bold text-[#1c2b4c]">My Rentals</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 border border-slate-200 rounded px-2 py-1 bg-white cursor-pointer hover:bg-slate-50">
            <span className="text-sm text-slate-600">Sort: Recent</span>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </div>
          <button className="text-slate-500 border border-slate-200 p-1.5 rounded bg-white hover:bg-slate-50">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-3 bg-white border-b border-slate-200 flex gap-6">
        <button className="pb-3 border-b-[3px] border-[#1b52d6] text-[#1b52d6] font-bold text-[15px]">Currently Renting</button>
        <button className="pb-3 border-b-[3px] border-transparent text-slate-500 font-medium text-[15px] hover:text-slate-700">Rental History</button>
        <button className="pb-3 border-b-[3px] border-transparent text-slate-500 font-medium text-[15px] flex items-center gap-1.5 hover:text-slate-700">
          Requests <span className="bg-slate-400 text-white text-[11px] w-[18px] h-[18px] rounded-full flex justify-center items-center">4</span>
        </button>
      </div>

      <div className="p-6">
        {/* Currently Renting Section */}
        <h3 className="text-[#1b52d6] font-bold text-[17px] mb-4">Currently Renting</h3>

        {/* Item 1 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-4 p-5 flex flex-col hover:shadow-md transition-shadow">
           <div className="flex justify-between items-start">
             <div className="flex gap-4">
                <div className="w-16 h-16 bg-slate-200 rounded-lg flex-shrink-0 relative overflow-hidden flex items-center justify-center border border-slate-300">
                   {/* Calculator icon */}
                   <div className="w-10 h-11 bg-[#2a2d36] rounded shadow-md flex flex-col p-1">
                     <div className="w-full h-3 bg-[#8ebfa1] rounded-sm mb-1"></div>
                     <div className="grid grid-cols-3 gap-[2px] flex-1">
                        {[...Array(9)].map((_, i) => <div key={i} className="bg-[#41434c] rounded-[1px]"></div>)}
                     </div>
                   </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-[#1c2b4c] text-[16px]">Casio Calculator</h4>
                    <span className="bg-[#fdf2d0] text-[#a0740b] text-[11px] font-bold px-2 py-0.5 rounded-sm">Pending Return</span>
                  </div>
                  <p className="text-[14px] text-slate-600 mb-1">Rohan S. • <span className="font-medium">April 15 - April 28</span></p>
                  <p className="text-[14px] text-slate-700">24 Rented Days • ₹ 10/day • Paid: ₹ 240</p>
                </div>
             </div>
             <div className="text-right">
                <p className="text-sm text-slate-500 mb-1">2 days ago</p>
                <p className="text-sm text-slate-500">3:58 PM</p>
             </div>
           </div>
           
           <div className="mt-4 flex items-center justify-between">
              <p className="text-[14px] text-slate-600 italic">Last: &quot;Got it, will return by Sunday evening.&quot;</p>
              <div className="flex gap-2">
                 <button className="bg-[#1b52d6] text-white px-5 py-1.5 rounded font-medium text-[15px] hover:bg-[#103387]">Extend</button>
                 <button className="bg-[#fbc02d] text-white px-5 py-1.5 rounded font-medium text-[15px] hover:bg-[#ebaf1b]">Close</button>
              </div>
           </div>
        </div>

        {/* Item 2 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8 p-5 flex flex-col hover:shadow-md transition-shadow">
           <div className="flex justify-between items-start">
             <div className="flex gap-4">
                <div className="w-16 h-16 bg-slate-200 rounded-lg flex-shrink-0 relative overflow-hidden flex items-center justify-center border border-slate-300">
                   {/* Laptop icon */}
                   <div className="w-10 h-7 bg-slate-800 border-2 border-slate-600 rounded-t-sm relative flex items-center justify-center">
                     <div className="absolute inset-0 bg-blue-500 opacity-80"></div>
                   </div>
                   <div className="absolute bottom-3 w-12 h-1.5 bg-slate-400 rounded-sm"></div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-[#1c2b4c] text-[16px]">Dell Laptop</h4>
                    <span className="bg-[#eaf8f4] text-[#219653] text-[11px] font-bold px-2 py-0.5 rounded-sm">On-time</span>
                  </div>
                  <p className="text-[14px] text-slate-600 mb-1"><span className="text-[#1b52d6] font-medium">Ankit Sharma</span> • April 5 - Apr 26</p>
                  <p className="text-[14px] text-slate-700">21 Rented Days • ₹ 100/day • Paid: ₹ 2,100</p>
                </div>
             </div>
             <div className="text-right">
                <p className="text-sm text-slate-500 mb-1">1 day ago</p>
                <p className="text-sm text-slate-500">3:35 PM</p>
             </div>
           </div>
           
           <div className="mt-4 flex items-center justify-between">
              <p className="text-[14px] text-slate-600 italic">Last: &quot;Laptop is great for coding!&quot; report • 1 day ago</p>
              <div className="flex gap-2">
                 <button className="bg-[#1b52d6] text-white px-5 py-1.5 rounded font-medium text-[15px] hover:bg-[#103387]">Message</button>
                 <button className="bg-[#fbc02d] text-white px-5 py-1.5 rounded font-medium text-[15px] hover:bg-[#ebaf1b]">Close</button>
              </div>
           </div>
        </div>


        {/* Rental History Section */}
        <h3 className="text-[#1b52d6] font-bold text-[17px] mb-4">Rental History</h3>

        {/* Item 3 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-4 p-5 flex flex-col hover:shadow-md transition-shadow">
           <div className="flex justify-between items-start">
             <div className="flex gap-4">
                <div className="w-16 h-16 bg-slate-200 rounded-lg flex-shrink-0 relative overflow-hidden flex items-center justify-center border border-slate-300">
                   {/* Books icon */}
                    <div className="relative">
                      <div className="w-10 h-[5px] bg-blue-800 rounded mb-0.5 transform -skew-x-[20deg]"></div>
                      <div className="w-11 h-[5px] bg-emerald-700 rounded mb-0.5 transform -skew-x-[20deg]"></div>
                      <div className="w-12 h-[5px] bg-orange-200 rounded mb-0.5 transform -skew-x-[20deg]"></div>
                      <div className="w-12 h-[5px] bg-red-800 rounded transform -skew-x-[20deg]"></div>
                   </div>
                </div>
                <div>
                  <h4 className="font-bold text-[#1c2b4c] text-[16px] mb-1">Engineering Books</h4>
                  <p className="text-[14px] text-slate-600 mb-1"><span className="text-[#1b52d6] font-medium">Priya Verma</span> • Mar 10 - Mar 25 • ₹ 300</p>
                  <p className="text-[14px] text-slate-700">15 Rented Days • ₹ 20/day • Paid: ₹ 300</p>
                </div>
             </div>
             <div className="bg-[#eaf8f4] border border-[#a7d9c8] flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[#219653]">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-bold text-sm">Returned</span>
                <CheckCircle2 className="w-4 h-4 opacity-50" />
             </div>
           </div>
           
           <div className="mt-4 flex items-center justify-end">
              <button className="bg-[#1b52d6] text-white px-6 py-1.5 rounded-md font-bold text-[14px] hover:bg-[#103387]">Message</button>
           </div>
        </div>

      </div>
    </div>
  );
}
