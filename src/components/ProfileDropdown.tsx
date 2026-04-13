"use client";

import React from 'react';
import { 
  User, 
  ChevronRight,
  LogOut,
  List,
  ClipboardList,
  ShoppingCart,
  CreditCard,
  ShieldCheck,
  Star,
  HelpCircle,
  Settings,
  Globe,
  X
} from 'lucide-react';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  userName: string;
}

export default function ProfileDropdown({ isOpen, onClose, onLogout, userName }: ProfileDropdownProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-16 right-6 w-full max-w-[320px] bg-white z-[2000] shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 rounded-xl overflow-hidden flex flex-col animate-in slide-in-from-top-4 duration-300">
      
      {/* Header Section */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-4">
         <div className="w-14 h-14 rounded-full bg-blue-50 border-2 border-emerald-500 overflow-hidden flex items-center justify-center p-0.5 relative">
            <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
               <User size={24} className="text-slate-300" />
            </div>
            {/* Small yellow badge from screenshot */}
            <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-yellow-400 rounded-full border border-white"></div>
         </div>
         <div className="flex flex-col">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-none">{userName} ...</h2>
         </div>
      </div>

      {/* View and Edit Profile Button */}
      <div className="px-5 py-4">
         <button className="w-full bg-[#002f34] text-white py-3 rounded-lg font-bold text-[14px]">
            View and edit profile
         </button>
      </div>

      <div className="w-full h-[1px] bg-slate-100"></div>

      {/* Menu List */}
      <div className="flex flex-col max-h-[400px] overflow-y-auto hide-scrollbar">
         <dropdownItem icon={<List size={18} />} label="My ADS" />
         <dropdownItem icon={<ClipboardList size={18} />} label="Buy Business Packages" />
         <dropdownItem icon={<ShoppingCart size={18} />} label="View Cart" />
         <dropdownItem icon={<CreditCard size={18} />} label="Bought Packages & Billing" />
         <dropdownItem icon={<Star size={18} />} label="Become an Elite Buyer" className="bg-blue-50/30" />
         
         <div className="w-full h-[1px] bg-slate-100"></div>
         
         <dropdownItem 
            icon={<ShieldCheck size={18} />} 
            label="Become an Elite Seller" 
            className="bg-blue-50/30"
            badge="New"
         />

         <div className="w-full h-[1px] bg-slate-100"></div>

         <dropdownItem icon={<HelpCircle size={18} />} label="Help" />
         <dropdownItem icon={<Settings size={18} />} label="Settings" />
         
         <button className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-all group">
            <div className="flex items-center gap-4">
               <Globe size={18} className="text-slate-700" strokeWidth={1.5} />
               <span className="text-[15px] font-medium text-slate-700">Language</span>
            </div>
            <ChevronRight size={18} className="text-slate-900 rotate-90" />
         </button>

         <div className="w-full h-[1px] bg-slate-100"></div>

         <button 
            onClick={onLogout}
            className="flex items-center gap-4 px-5 py-4 hover:bg-rose-50 transition-all group w-full"
         >
            <LogOut size={18} className="text-rose-500" />
            <span className="text-[15px] font-black text-rose-500 uppercase tracking-widest">Logout</span>
         </button>
      </div>
    </div>
  );
}

function dropdownItem({ icon, label, className = "", badge }: { icon: React.ReactNode, label: string, className?: string, badge?: string }) {
  return (
    <button className={`flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-all group ${className}`}>
       <div className="flex items-center gap-4">
          <div className="text-slate-700">
             {icon}
          </div>
          <span className="text-[15px] font-medium text-slate-700">{label}</span>
       </div>
       <div className="flex items-center gap-2">
          {badge && (
             <span className="bg-[#cc3a00] text-white text-[9px] font-black px-2 py-0.5 rounded-sm uppercase">{badge}</span>
          )}
          <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
       </div>
    </button>
  );
}
