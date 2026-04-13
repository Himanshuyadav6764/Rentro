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
  Camera,
  X,
  Mail,
  Smartphone
} from 'lucide-react';
import Image from 'next/image';

interface ProfileViewProps {
  onOpenSellModal?: () => void;
  onLogout?: () => void;
}

export default function ProfileView({ onOpenSellModal, onLogout }: ProfileViewProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [profile, setProfile] = React.useState({
    name: "Shekhar Kumar",
    email: "shekharyv2037@gmail.com",
    avatar: "/shekhar-avatar.png"
  });

  const [tempProfile, setTempProfile] = React.useState({...profile});

  const handleSave = () => {
    setProfile({...tempProfile});
    setIsEditing(false);
  };

  return (
    <div className="w-full bg-white flex flex-col h-full overflow-y-auto hide-scrollbar pb-32 animate-in fade-in duration-500">
      
      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsEditing(false)}></div>
          <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
             <header className="px-8 py-6 flex items-center justify-between border-b border-slate-50">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Profile Settings</h3>
                <button onClick={() => setIsEditing(false)} className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                   <X size={20} strokeWidth={3} />
                </button>
             </header>
             <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="flex flex-col items-center gap-4">
                   <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-50 bg-slate-100 flex items-center justify-center relative group">
                      <User size={40} className="text-slate-300" />
                   </div>
                   <button className="text-xs font-black text-blue-600 uppercase tracking-widest">Change Photo</button>
                </div>
                <div className="space-y-6">
                   <EditField label="Full Name" value={tempProfile.name} onChange={(v) => setTempProfile({...tempProfile, name: v})} icon={<User size={16} />} />
                   <EditField label="Email Address" value={tempProfile.email} onChange={(v) => setTempProfile({...tempProfile, email: v})} icon={<Mail size={16} />} />
                </div>
             </div>
             <footer className="px-8 py-6 border-t flex gap-4 bg-slate-50/50">
                <button onClick={() => setIsEditing(false)} className="flex-1 py-4 font-bold text-slate-500">Cancel</button>
                <button onClick={handleSave} className="flex-[2] bg-[#002f34] text-white py-4 rounded-xl font-black shadow-lg">Save Changes</button>
             </footer>
          </div>
        </div>
      )}

      {/* Header Section (OLX Style) */}
      <div className="px-6 pt-8 pb-6 flex items-center gap-4 border-b border-slate-100">
         <div className="w-20 h-20 rounded-full bg-blue-50 border-4 border-blue-50 overflow-hidden flex items-center justify-center p-1">
            <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
               {/* Simplified Avatar logic for now */}
               <div className="relative w-full h-full flex items-center justify-center bg-white">
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center overflow-hidden">
                     <div className="w-full h-full bg-[#f8faff] flex items-center justify-center">
                        <User size={24} className="text-slate-300" />
                     </div>
                  </div>
                  {/* Small badge similar to the character in screenshot */}
                  <div className="absolute top-1 right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white"></div>
               </div>
            </div>
         </div>
         <div className="flex flex-col">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">{profile.name} ...</h2>
         </div>
      </div>

      {/* Main Action Button */}
      <div className="px-6 py-6">
         <button 
           onClick={() => setIsEditing(true)}
           className="w-full bg-[#002f34] text-white py-4 rounded-lg font-black text-[15px] shadow-lg hover:opacity-90 transition-all"
         >
            View and edit profile
         </button>
      </div>

      <div className="w-full h-[1px] bg-slate-100"></div>

      {/* List Sections */}
      <div className="flex flex-col">
         <MenuLink icon={<List size={22} />} label="My ADS" />
         <MenuLink icon={<ClipboardList size={22} />} label="Buy Business Packages" />
         <MenuLink icon={<ShoppingCart size={22} />} label="View Cart" />
         <MenuLink icon={<CreditCard size={22} />} label="Bought Packages & Billing" />
         <MenuLink icon={<Star size={22} />} label="Become an Elite Buyer" className="bg-blue-50/50" />
         
         <div className="w-full h-[1px] bg-slate-100"></div>
         
         <MenuLink 
            icon={<ShieldCheck size={22} />} 
            label="Become an Elite Seller" 
            className="bg-blue-50/50"
            badge="New"
         />

         <div className="w-full h-[1px] bg-slate-100"></div>

         <MenuLink icon={<HelpCircle size={22} />} label="Help" />
         <MenuLink icon={<Settings size={22} />} label="Settings" />
         
         {/* Language Dropdown Style */}
         <button className="flex items-center justify-between px-6 py-5 hover:bg-slate-50 transition-all group">
            <div className="flex items-center gap-5">
               <Globe size={22} className="text-slate-800" strokeWidth={1.5} />
               <span className="text-[17px] font-medium text-slate-800 group-hover:translate-x-1 transition-transform">Language</span>
            </div>
            <div className="flex items-center gap-2">
               <span className="text-slate-400 text-sm">English</span>
               <ChevronRight size={20} className="text-slate-800 rotate-90" />
            </div>
         </button>

         <div className="w-full h-[1px] bg-slate-100"></div>

         {/* Logout Button (Requested) */}
         <button 
            onClick={onLogout}
            className="flex items-center gap-5 px-6 py-5 hover:bg-rose-50 transition-all group w-full"
         >
            <LogOut size={22} className="text-rose-500" strokeWidth={2} />
            <span className="text-[17px] font-black text-rose-500">Logout</span>
         </button>
      </div>

    </div>
  );
}

function MenuLink({ icon, label, className = "", badge }: { icon: React.ReactNode, label: string, className?: string, badge?: string }) {
  return (
    <button className={`flex items-center justify-between px-6 py-5 hover:bg-slate-50 transition-all group ${className}`}>
       <div className="flex items-center gap-5">
          <div className="text-slate-800 flex items-center justify-center" style={{ strokeWidth: 1.5 }}>
             {icon}
          </div>
          <span className="text-[17px] font-medium text-slate-800 group-hover:translate-x-1 transition-transform">{label}</span>
       </div>
       <div className="flex items-center gap-2">
          {badge && (
             <span className="bg-[#cc3a00] text-white text-[11px] font-black px-3 py-1 rounded-sm uppercase tracking-wider">{badge}</span>
          )}
          <ChevronRight size={20} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
       </div>
    </button>
  );
}

function EditField({ label, value, onChange, icon }: { label: string, value: string, onChange: (v: string) => void, icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative flex items-center group">
         <div className="absolute left-4 text-slate-300 group-focus-within:text-[#002f34] transition-colors">{icon}</div>
         <input 
            type="text" 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-xl font-bold text-slate-700 outline-none focus:bg-white focus:border-[#002f34] transition-all"
         />
      </div>
    </div>
  );
}
