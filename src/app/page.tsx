"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bell,
  BookOpen,
  Home,
  MessageCircle,
  Mic,
  MinusCircle,
  Plus,
  Search,
  User,
  X,
  LogOut,
  Heart
} from "lucide-react";
import HomeView from "@/components/views/HomeView";
import ChatsView from "@/components/views/ChatsView";
import RentalsView from "@/components/views/RentalsView";
import ProfileView from "@/components/views/ProfileView";
import ProductDetailView from "@/components/views/ProductDetailView";
import CreateListingModal from "@/components/CreateListingModal";
import LoginView from "@/components/views/LoginView";
import WishlistSidebar from "@/components/WishlistSidebar";

const MOCK_SUGGESTIONS = [
  { text: "Phone", category: "MOBILE PHONES" },
  { text: "Photo copy printer machine", category: "HARD DISKS, PRINTERS & MONITORS" },
  { text: "Photo frame", category: "HOME DECOR & GARDEN" },
  { text: "nothing Phone 1", category: "ELECTRONICS" },
  { text: "plot for sale", category: "REAL ESTATE" },
  { text: "MacBook Pro M2", category: "LAPTOPS" },
  { text: "Scientific Calculator", category: "ACADEMIC" },
  { text: "Engineering Drafter", category: "ACADEMIC" },
];

export default function AppHome() {
  const [activeTab, setActiveTab] = useState<"home" | "chats" | "rentals" | "profile">("home");
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSuggestions = MOCK_SUGGESTIONS.filter(item =>
    item.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isLoggedIn) {
     return <LoginView onLogin={() => setIsLoggedIn(true)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "home": return <HomeView onSelectItem={(id) => setSelectedProductId(id)} />;
      case "chats": return <ChatsView />;
      case "rentals": return <RentalsView />;
      case "profile": return <ProfileView onOpenSellModal={() => setIsListingModalOpen(true)} />;
      default: return <HomeView onSelectItem={(id) => setSelectedProductId(id)} />;
    }
  };

  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case "home": return "Search books, calculators, laptops...";
      case "chats": return "Search chats...";
      case "rentals": return "Search my rentals...";
      case "profile": return "Search my profile...";
      default: return "Search books, calculators, laptops...";
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase()
            ? <b key={i} className="text-slate-900">{part}</b>
            : <span key={i} className="text-slate-400">{part}</span>
        )}
      </span>
    );
  };

  return (
    <div className="h-screen w-full bg-[#f8faff] relative flex flex-col md:flex-row font-sans overflow-hidden">

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-24 lg:w-64 bg-white border-r border-slate-100 z-50">
        <div className="p-6 flex items-center gap-3 mb-8">
          <div className="bg-[#1b52d6] p-2 rounded-xl text-white shadow-lg shadow-brand/20">
            <BookOpen size={24} />
          </div>
          <h1 className="hidden lg:block text-lg font-black text-slate-800 tracking-tighter">StudentRental</h1>
        </div>

        <nav className="flex-1 px-4 flex flex-col gap-2">
          <SidebarLink
            icon={<Home size={22} />}
            label="Home"
            isActive={activeTab === 'home'}
            onClick={() => setActiveTab('home')}
          />
          <SidebarLink
            icon={<MessageCircle size={22} />}
            label="Chats"
            isActive={activeTab === 'chats'}
            onClick={() => setActiveTab('chats')}
            badge={2}
          />
          <SidebarLink
            icon={<MinusCircle size={22} />}
            label="My Rentals"
            isActive={activeTab === 'rentals'}
            onClick={() => setActiveTab('rentals')}
            badge={1}
          />
          <SidebarLink 
            icon={<User size={22} />} 
            label="Profile" 
            isActive={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
          />
          <button 
            onClick={() => setIsLoggedIn(false)}
            className="flex items-center gap-4 p-4 rounded-2xl text-rose-400 hover:bg-rose-50 transition-all group mt-2"
          >
            <LogOut size={22} className="group-hover:scale-110 transition-transform" />
            <span className="hidden lg:block font-black text-sm uppercase tracking-widest">Logout</span>
          </button>
        </nav>

        <div className="p-6 mt-auto">
          <button onClick={() => setIsListingModalOpen(true)} className="w-full bg-[#1b52d6] text-white p-3 lg:p-4 rounded-2xl font-black shadow-xl shadow-brand/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
            <Plus size={24} strokeWidth={3} />
            <span className="hidden lg:block">LIST ITEM</span>
          </button>
        </div>
      </aside>

      {/* Main Application Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">

        {/* Top Navbar */}
        <header className="px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-md z-[60] border-b border-slate-50">
          <div className="flex items-center gap-2 md:hidden">
            <div className="bg-[#1b52d6] p-1.5 rounded-lg text-white">
              <BookOpen size={20} />
            </div>
            <h1 className="text-lg font-black text-slate-800 tracking-tighter">StudentRental</h1>
          </div>

          {/* Desktop Search Center with Suggestions */}
          <div ref={searchRef} className="hidden md:block flex-1 max-w-2xl mx-10 relative">
            <div className={`bg-slate-50 border border-slate-100 rounded-2xl flex items-center h-12 px-4 shadow-inner focus-within:ring-4 ring-brand/5 transition-all ${showSuggestions && searchQuery ? 'rounded-b-none' : ''}`}>
              <Search className="w-5 h-5 text-slate-400 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder={getSearchPlaceholder()}
                className="flex-1 bg-transparent outline-none text-sm text-slate-700 font-bold placeholder:text-slate-300"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="mr-2 text-slate-300 hover:text-slate-500 transition-colors"><X size={16} /></button>
              )}
              <button className="text-slate-300 hover:text-[#1b52d6] transition-colors"><Mic size={18} /></button>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && searchQuery && filteredSuggestions.length > 0 && (
              <div className="absolute top-12 left-0 right-0 bg-white border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.1)] rounded-b-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
                {filteredSuggestions.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSearchQuery(item.text);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-6 py-3.5 hover:bg-slate-50 transition-colors flex flex-col border-b border-slate-50 last:border-0"
                  >
                    <span className="text-[15px] font-medium leading-tight">
                      {highlightMatch(item.text, searchQuery)}
                    </span>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">
                      {item.category}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => setIsWishlistOpen(true)}
              className="p-2.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all relative"
            >
              <Heart size={20} />
            </button>
            <button className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-400 relative">
              <Bell size={20} fill="currentColor" className="opacity-20" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 overflow-hidden hidden sm:flex items-center justify-center">
              <User size={20} className="text-[#1b52d6] opacity-80" />
            </div>
          </div>
        </header>

        {/* Mobile Search with Suggestions */}
        <div ref={searchRef} className="bg-[#1b52d6] px-6 py-4 md:hidden shadow-lg shadow-brand/10 z-[55] relative">
          <div className={`bg-white rounded-xl flex items-center h-12 px-4 shadow-sm ${showSuggestions && searchQuery ? 'rounded-b-none' : ''}`}>
            <Search className="w-5 h-5 text-slate-300 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder={getSearchPlaceholder()}
              className="flex-1 bg-transparent outline-none text-sm text-slate-700 font-bold"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="ml-2 text-slate-300"><X size={16} /></button>
            )}
          </div>

          {/* Mobile Suggestions Dropdown */}
          {showSuggestions && searchQuery && filteredSuggestions.length > 0 && (
            <div className="absolute top-[4.5rem] left-6 right-6 bg-white shadow-2xl rounded-b-xl overflow-hidden z-[100] animate-in slide-in-from-top-1 duration-200">
              {filteredSuggestions.map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSearchQuery(item.text);
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left px-5 py-4 hover:bg-slate-50 transition-colors flex flex-col border-b border-slate-50 last:border-0"
                >
                  <span className="text-[14px] font-medium leading-tight">
                    {highlightMatch(item.text, searchQuery)}
                  </span>
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">
                    {item.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic View Container */}
        <div className="flex-1 overflow-hidden relative pb-[72px] md:pb-0">
          {renderContent()}
          {selectedProductId && (
            <ProductDetailView
              productId={selectedProductId}
              onBack={() => setSelectedProductId(null)}
              onChatWithOwner={() => {
                setSelectedProductId(null);
                setActiveTab("chats");
              }}
              onRent={() => {
                alert("Rental Request Sent Successfully! The owner will contact you shortly.");
                setSelectedProductId(null);
                setActiveTab("rentals");
              }}
            />
          )}
          <CreateListingModal isOpen={isListingModalOpen} onClose={() => setIsListingModalOpen(false)} />
          <WishlistSidebar isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
        </div>

        {/* ... (Bottom Nav keeps same) ... */}
        <div className="fixed bottom-0 left-0 right-0 h-[72px] bg-white/95 backdrop-blur-md border-t border-slate-100 flex px-2 z-50 md:hidden justify-around items-center">
          <MobileNavLink icon={<Home size={22} />} active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <MobileNavLink icon={<MessageCircle size={22} />} active={activeTab === 'chats'} onClick={() => setActiveTab('chats')} badge={2} />

          <button
            onClick={() => setIsListingModalOpen(true)}
            className="w-14 h-14 bg-[#1b52d6] text-white rounded-2xl shadow-xl shadow-brand/30 flex items-center justify-center transform -translate-y-4 hover:scale-110 active:scale-95 transition-all border-4 border-white"
          >
            <Plus size={28} strokeWidth={3} />
          </button>

          <MobileNavLink icon={<MinusCircle size={22} />} active={activeTab === 'rentals'} onClick={() => setActiveTab('rentals')} />
          <MobileNavLink icon={<User size={22} />} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ icon, label, isActive, onClick, badge }: { icon: any, label: string, isActive: boolean, onClick: () => void, badge?: number }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${isActive ? 'bg-[#1b52d6] text-white shadow-lg shadow-brand/20' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
    >
      <div className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>{icon}</div>
      <span className={`hidden lg:block font-black text-sm uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
      {badge && !isActive && (
        <span className="ml-auto bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black animate-pulse">{badge}</span>
      )}
    </button>
  );
}

function MobileNavLink({ icon, active, onClick, badge }: { icon: any, active: boolean, onClick: () => void, badge?: number }) {
  return (
    <button onClick={onClick} className={`p-3 rounded-xl relative transition-all ${active ? 'text-[#1b52d6] bg-blue-50 scale-110' : 'text-slate-400 opacity-60'}`}>
      {icon}
      {badge && <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center font-black">{badge}</span>}
    </button>
  );
}
