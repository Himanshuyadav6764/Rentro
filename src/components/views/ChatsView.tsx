import React from 'react';
import { ChevronLeft, MessageCircle, Settings, Menu, CheckCircle2 } from 'lucide-react';

export default function ChatsView() {
  return (
    <div className="flex h-full w-full bg-white max-w-6xl mx-auto">
      {/* Left Sidebar */}
      <div className="w-[30%] min-w-[280px] bg-[#f8fafe] border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
          <button className="text-slate-500 hover:bg-slate-200 p-1 rounded-md">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#1b52d6]" />
            <h2 className="text-lg font-bold text-[#1c2b4c]">Chats</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Today Section */}
          <div className="px-4 py-2 mt-2 flex justify-between items-center text-sm font-medium text-slate-500">
            <span>Today</span>
            <span className="bg-[#1b52d6] text-white text-[10px] w-4 h-4 rounded-full flex justify-center items-center">3</span>
          </div>
          
          {/* Chat 1 */}
          <div className="px-4 py-3 hover:bg-slate-100 cursor-pointer border-b border-slate-100">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                 <div className="w-10 h-10 bg-slate-200 rounded flex-shrink-0 relative overflow-hidden flex items-center justify-center border border-slate-300">
                    <div className="w-6 h-4 bg-slate-800 border-2 border-slate-600 rounded-t-sm relative"><div className="absolute inset-0 bg-blue-500 opacity-80"></div></div>
                    <div className="absolute bottom-1 w-8 h-1 bg-slate-400 rounded-sm"></div>
                 </div>
                 <div>
                   <h3 className="font-bold text-[#1c2b4c] text-[15px]">Ankit Sharma</h3>
                   <p className="text-sm text-slate-600">Laptops for coding</p>
                 </div>
              </div>
              <span className="text-xs text-slate-500 mt-1">3:58 PM</span>
            </div>
            <div className="mt-2 flex">
               <div className="flex items-center gap-1 bg-[#eaf8f4] text-[#219653] px-2 py-0.5 rounded-full border border-[#a7d9c8]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold">Trust: 78</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
               </div>
            </div>
          </div>

          {/* Chat 2 */}
          <div className="px-4 py-3 hover:bg-slate-100 cursor-pointer border-b border-slate-100 bg-white shadow-sm rounded-lg mx-2 mb-2 ring-1 ring-slate-200">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                 <div className="w-10 h-10 bg-slate-200 rounded flex-shrink-0 relative overflow-hidden flex items-center justify-center border border-slate-300">
                    <div className="w-6 h-6 flex flex-col gap-[1px] rotate-[-5deg] mb-1">
                      <div className="w-full h-[3px] bg-emerald-600"></div>
                      <div className="w-full h-[3px] bg-red-500"></div>
                      <div className="w-full h-[3px] bg-blue-600"></div>
                      <div className="w-full h-[3px] bg-[#d4a373]"></div>
                    </div>
                 </div>
                 <div>
                   <h3 className="font-bold text-[#1c2b4c] text-[15px]">Priya Verma</h3>
                   <p className="text-sm text-slate-600">Engineering Books</p>
                 </div>
              </div>
              <span className="text-xs text-slate-500 mt-1">3:36 PM</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
               <div className="flex items-center gap-1 bg-[#fdf2d0] text-[#a0740b] px-2 py-0.5 rounded-full border border-[#e6d093]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#219653]" />
                  <span className="text-[11px] font-bold text-slate-700">Trust: 82</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#219653]" />
               </div>
               <span className="text-[11px] font-bold text-red-500">Pending Request</span>
            </div>
          </div>

          {/* Tuesday Section */}
          <div className="px-4 py-2 mt-2 flex justify-between items-center text-sm font-medium text-slate-500">
            <span>Tuesday</span>
          </div>

          {/* Chat 3 */}
          <div className="px-4 py-3 hover:bg-slate-100 cursor-pointer border-b border-slate-100">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                 <div className="w-10 h-10 bg-slate-200 rounded flex-shrink-0 relative overflow-hidden flex items-center justify-center border border-slate-300">
                    <div className="w-6 h-6 bg-slate-50 rounded-sm shadow-sm flex flex-col p-[2px] rotate-[5deg]">
                       <div className="w-full h-1 bg-[#d4a373] mb-[2px]"></div>
                       <div className="w-full flex-1 bg-[#1b52d6] opacity-20"></div>
                    </div>
                 </div>
                 <div>
                   <h3 className="font-bold text-[#1c2b4c] text-[15px]">Neha Gupta</h3>
                   <p className="text-sm text-slate-600">Data Science Notes</p>
                 </div>
              </div>
              <span className="text-xs text-slate-500 mt-1">2:15 PM</span>
            </div>
            <div className="mt-2 flex">
               <div className="flex items-center gap-1 bg-[#eaf8f4] text-[#219653] px-2 py-0.5 rounded-full border border-[#a7d9c8]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold">Trust: 92</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 bg-[#f9fbff] flex flex-col pb-24">
         {/* Right Header */}
         <div className="flex items-center justify-between border-b border-slate-200 px-6 pt-4 bg-white">
            <div className="flex gap-6">
               <button className="pb-3 border-b-2 border-[#1b52d6] text-[#1b52d6] font-bold">All Chats</button>
               <button className="pb-3 border-b-2 border-transparent text-slate-500 font-medium flex items-center gap-1.5">
                 Pending Requests
                 <span className="bg-[#e97d74] text-white text-[11px] w-4 h-4 rounded-full flex justify-center items-center">5</span>
               </button>
            </div>
            <div className="flex gap-4 pb-3">
               <button className="flex items-center gap-1.5 bg-[#eaf8f4] text-[#1a382b] px-3 py-1.5 rounded-full text-sm font-bold border border-[#a7d9c8]">
                 <Settings className="w-4 h-4 text-[#1a382b]" /> Settings
               </button>
               <button className="text-slate-600">
                 <Menu className="w-5 h-5" />
               </button>
            </div>
         </div>

         {/* Message List */}
         <div className="p-6 overflow-y-auto">
            <div className="text-sm font-medium text-slate-500 mb-3">Today</div>

            {/* Message 1 */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-3 cursor-pointer hover:shadow-md transition-shadow">
               <div className="flex justify-between items-start mb-2">
                 <div className="flex gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded flex-shrink-0 relative overflow-hidden flex items-center justify-center border border-slate-300">
                       <div className="w-6 h-4 bg-slate-800 border-2 border-slate-600 rounded-t-sm relative"><div className="absolute inset-0 bg-blue-500 opacity-80"></div></div>
                       <div className="absolute bottom-1 w-8 h-1 bg-slate-400 rounded-sm"></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1c2b4c]">Ankit Sharma</h3>
                      <p className="text-sm text-slate-600">Laptops for coding</p>
                    </div>
                 </div>
                 <span className="text-sm text-slate-500">3:58 PM</span>
               </div>
               <div className="flex justify-between items-center ml-13 mt-1">
                 <p className="text-[15px] text-[#1c2b4c]">Agreed. Time and place set. See you at...</p>
                 <span className="text-sm text-slate-500">3:58 PM</span>
               </div>
            </div>

            {/* Message 2 (Pending) */}
            <div className="bg-white p-4 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.05)] border border-slate-100 mb-3 cursor-pointer ring-1 ring-slate-100">
               <div className="flex justify-between items-start mb-2">
                 <div className="flex gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded flex-shrink-0 relative overflow-hidden flex items-center justify-center border border-slate-300">
                       <div className="w-6 h-6 flex flex-col gap-[1px] rotate-[-5deg] mb-1">
                         <div className="w-full h-[3px] bg-emerald-600"></div>
                         <div className="w-full h-[3px] bg-red-500"></div>
                         <div className="w-full h-[3px] bg-blue-600"></div>
                         <div className="w-full h-[3px] bg-[#d4a373]"></div>
                       </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1c2b4c]">Priya Verma</h3>
                      <p className="text-sm text-slate-600">Engineering Books</p>
                    </div>
                 </div>
                 <span className="text-sm text-slate-500">3:36 PM</span>
               </div>
               <div className="flex justify-between items-center ml-13 mt-1 mb-3">
                 <p className="text-[15px] text-[#1c2b4c]">Got it. I&apos;ll be there on time. 🤝</p>
                 <span className="text-sm text-slate-500">3:36 PM</span>
               </div>
               
               <div className="flex items-center justify-between ml-13">
                 <div className="flex items-center gap-1 bg-[#fdf2d0] px-3 py-1 rounded-md border border-[#e6d093]">
                    <CheckCircle2 className="w-4 h-4 text-[#219653]" />
                    <span className="text-[13px] font-bold text-[#1c2b4c]">Trust: 65</span>
                    <CheckCircle2 className="w-4 h-4 text-[#219653]" />
                 </div>
                 <div className="flex gap-2">
                    <button className="px-5 py-1.5 bg-[#fbe7e7] text-[#d32f2f] rounded-md font-bold text-sm">Decline</button>
                    <button className="px-5 py-1.5 bg-[#1b52d6] text-white rounded-md font-bold text-sm">Accept</button>
                 </div>
               </div>
               <div className="flex justify-between items-center ml-13 mt-3 pt-2 border-t border-slate-100">
                 <span className="text-sm font-bold text-[#d32f2f]">Pending Request</span>
                 <span className="text-sm text-slate-500">3:00 PM</span>
               </div>
            </div>

            {/* Message 3 */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-3 cursor-pointer hover:shadow-md transition-shadow">
               <div className="flex justify-between items-start mb-2">
                 <div className="flex gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded flex-shrink-0 relative overflow-hidden flex items-center justify-center border border-slate-300">
                         <div className="w-6 h-7 bg-[#2a2d36] rounded-sm flex flex-col p-[2px]">
                           <div className="w-full h-2 bg-[#8ebfa1] rounded-[1px] mb-[2px]"></div>
                           <div className="w-full flex-1 bg-[#41434c] rounded-[1px]"></div>
                         </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1c2b4c]">Rohan S.</h3>
                      <p className="text-sm text-slate-600">Renting Calculator for exams</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-1">
                   <div className="bg-[#219653] p-[2px] rounded-full">
                     <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />
                   </div>
                   <span className="text-sm text-slate-500">3:00 PM</span>
                 </div>
               </div>
               <div className="flex justify-between items-center ml-13 mt-1">
                 <p className="text-[15px] text-[#1c2b4c]">Thanks! I&apos;ll bring it back by the weekend.</p>
                 <span className="text-sm text-slate-500">2:15 PM</span>
               </div>
            </div>

            {/* Message 4 */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-3 cursor-pointer hover:shadow-md transition-shadow">
               <div className="flex justify-between items-start mb-2">
                 <div className="flex gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded flex-shrink-0 relative overflow-hidden flex items-center justify-center border border-slate-300">
                       <div className="w-6 h-4 bg-slate-800 border-2 border-slate-600 rounded-t-sm relative"><div className="absolute inset-0 bg-blue-500 opacity-80"></div></div>
                       <div className="absolute bottom-1 w-8 h-1 bg-slate-400 rounded-sm"></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1c2b4c]">Vikram Patel</h3>
                      <p className="text-sm text-slate-600">The Laptop is working great. Thanks!</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-1">
                   <div className="bg-[#219653] p-[2px] rounded-full">
                     <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />
                   </div>
                   <span className="text-sm text-slate-500">9:20 AM</span>
                 </div>
               </div>
            </div>

         </div>
      </div>
    </div>
  );
}
