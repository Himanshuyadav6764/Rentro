"use client";

import { useState } from "react";
import {
  Bell, BookOpen, Home, MessageCircle, Mic, MinusCircle, Plus, Search, User
} from "lucide-react";
import HomeView from "@/components/views/HomeView";
import ChatsView from "@/components/views/ChatsView";
import RentalsView from "@/components/views/RentalsView";
import ProfileView from "@/components/views/ProfileView";
import CreateListingModal from "@/components/CreateListingModal";

export default function AppHome() {
  const [activeTab, setActiveTab] = useState<"home" | "chats" | "rentals" | "profile">("profile");
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "home": return <HomeView />;
      case "chats": return <ChatsView />;
      case "rentals": return <RentalsView />;
      case "profile": return <ProfileView />;
      default: return <HomeView />;
    }
  };

  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case "chats": return "Search chats...";
      case "rentals": return "Search my rentals...";
      case "profile": return "Search my rentals...";
      default: return "Search books, calculators, laptops...";
    }
  };

  return (
    <div className="min-h-screen w-full bg-white relative flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="px-4 sm:px-8 py-3 flex items-center justify-between bg-white z-10 sticky top-0 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="bg-[#e8f5e9] p-2 rounded-lg relative">
            <BookOpen className="text-emerald-500 w-6 h-6" />
            <div className="absolute top-1/2 left-[-4px] w-2 h-4 bg-emerald-500 rounded-r-md"></div>
          </div>
          <h1 className="text-[20px] font-bold text-[#1c2b4c] tracking-tight">StudentRental</h1>
        </div>
        
        <div className="flex items-center gap-4 text-slate-600">
          <button className="hover:bg-slate-100 p-2 rounded-full transition-colors hidden sm:block">
            <Mic className="w-5 h-5 text-[#1c2b4c]" />
          </button>
          <button className="relative hover:bg-slate-100 p-2 rounded-full transition-colors">
            <Bell className="w-5 h-5 text-[#6b7280]" fill="currentColor" stroke="none" />
            <span className="absolute top-[6px] right-[8px] w-2.5 h-2.5 bg-red-500 border border-white rounded-full"></span>
          </button>
          <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center relative bg-gradient-to-br from-blue-100 to-indigo-100 cursor-pointer">
            <User className="w-5 h-5 text-indigo-700 mt-1" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-orange-400 border border-white rounded-full"></span>
          </div>
        </div>
      </header>

      {/* Search Area */}
      <div className="bg-[#1b52d6] px-4 sm:px-8 py-3.5 flex justify-center">
        <div className="bg-white rounded-md flex items-center h-[46px] px-3 w-full max-w-4xl shadow-sm">
          <Search className="w-5 h-5 text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder={getSearchPlaceholder()} 
            className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
          />
          <button>
            <Mic className="w-5 h-5 text-slate-400 ml-2" />
          </button>
        </div>
      </div>

      {/* Dynamic Content View */}
      <div className="flex-1 overflow-hidden h-full flex flex-col items-center">
         <div className="w-full flex-1 flex flex-col h-full overflow-hidden relative">
            {renderContent()}
            <CreateListingModal isOpen={isListingModalOpen} onClose={() => setIsListingModalOpen(false)} />
         </div>
      </div>

      {/* Floating Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 h-[72px] bg-[#fafafc] border-t border-slate-200 flex px-1 z-50 justify-center">
        <div className="flex w-full h-full relative max-w-6xl">
          
          <button onClick={() => setActiveTab("home")} className={`flex-1 flex flex-col items-center justify-center gap-1 group transition ${activeTab === 'home' ? 'text-[#1b52d6]' : 'text-slate-500 hover:text-[#1b52d6]'}`}>
            <Home className="w-[22px] h-[22px] currentColor" strokeWidth={2.5} />
            <span className="text-[11px] font-bold">Home</span>
          </button>
          
          <button onClick={() => setActiveTab("chats")} className={`flex-1 flex flex-col items-center justify-center gap-1 group relative transition ${activeTab === 'chats' ? 'text-[#1b52d6]' : 'text-slate-500 hover:text-[#1b52d6]'}`}>
            <div className="relative">
              <MessageCircle className="w-[22px] h-[22px] currentColor" strokeWidth={2} />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-[1.5px] border-white rounded-full flex items-center justify-center text-[8px] text-white font-bold">2</div>
            </div>
            <span className="text-[11px] font-medium">Chats</span>
          </button>

          {/* Middle placeholder for perfect spacing */}
          <div className="flex-[1.2] opacity-0 pointer-events-none"></div>

          {/* Center Massive Action Button */}
          <div className="absolute left-1/2 bottom-3 transform -translate-x-1/2 flex items-center justify-center z-30">
            <div className="relative w-16 h-16 rounded-full flex items-center justify-center">
               <div className="absolute inset-0 rounded-full" style={{
                 background: 'conic-gradient(#1b52d6 0% 35%, #05a76e 35% 60%, #fdb528 60% 85%, #8cb3eb 85% 100%)',
                 padding: '4px'
               }}>
                  <div className="w-full h-full bg-transparent rounded-full border-[3px] border-transparent" style={{ WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }}></div>
               </div>
               {/* Actual clickable button */}
               <button onClick={() => setIsListingModalOpen(true)} className="absolute inset-[4px] bg-white rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.15)] flex items-center justify-center hover:scale-105 transition-transform active:scale-95">
                 <Plus className="w-7 h-7 text-[#1b52d6]" strokeWidth={3} />
               </button>
            </div>
          </div>

          <button onClick={() => setActiveTab("rentals")} className={`flex-1 flex flex-col items-center justify-center gap-1 group transition ${activeTab === 'rentals' ? 'text-[#1b52d6]' : 'text-slate-500 hover:text-[#1b52d6]'}`}>
            <div className="relative">
               <MinusCircle className="w-[22px] h-[22px] currentColor" strokeWidth={2} />
               <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-[1.5px] border-white rounded-full flex items-center justify-center text-[8px] text-white font-bold">1</div>
            </div>
            <span className="text-[11px] font-medium">My Rentals</span>
          </button>
          
          <button onClick={() => setActiveTab("profile")} className={`flex-1 flex flex-col items-center justify-center gap-1 group transition ${activeTab === 'profile' ? 'text-[#1b52d6]' : 'text-slate-500 hover:text-[#1b52d6]'}`}>
            <User className="w-[22px] h-[22px] currentColor" strokeWidth={2} />
            <span className="text-[11px] font-medium">Profile</span>
          </button>

        </div>
      </div>

    </div>
  );
}
