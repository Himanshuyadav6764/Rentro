"use client";

import React from 'react';
import { 
  User, 
  Edit2, 
  ShieldCheck, 
  CheckCircle2, 
  Smartphone, 
  Mail, 
  TrendingUp,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Star,
  Check,
  X,
  Camera
} from 'lucide-react';
import Image from 'next/image';

interface ProfileViewProps {
  onOpenSellModal?: () => void;
}

export default function ProfileView({ onOpenSellModal }: ProfileViewProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [profile, setProfile] = React.useState({
    name: "Shekhar Kumar",
    email: "shekharkumar@email.com",
    phone: "+91 9876543210",
    avatar: "/shekhar-avatar.png"
  });

  const [tempProfile, setTempProfile] = React.useState({...profile});

  const handleSave = () => {
    setProfile({...tempProfile});
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setTempProfile({...profile});
    setIsEditing(true);
  };

  return (
    <div className="w-full bg-[#f8faff] flex flex-col font-sans max-w-md md:max-w-3xl mx-auto h-full overflow-y-auto hide-scrollbar pb-32 animate-in fade-in duration-500 relative">
      
      {/* Background soft gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none"></div>

      {/* Modern Centered Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
          {/* Backdrop Blur */}
          <div 
             className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
             onClick={() => setIsEditing(false)}
          ></div>
          
          <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-400">
             <header className="px-8 py-6 flex items-center justify-between border-b border-slate-50 bg-white z-10">
                <div>
                   <h3 className="text-xl font-black text-slate-800 tracking-tight">Profile Settings</h3>
                   <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Update your personal information</p>
                </div>
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all"
                >
                  <X size={20} strokeWidth={3} />
                </button>
             </header>

             <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth hide-scrollbar">
                
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4">
                   <div className="relative group">
                      <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-lg">
                         <Image src={tempProfile.avatar} alt="Avatar Preview" width={96} height={96} className="object-cover" />
                      </div>
                      <button className="absolute -bottom-1 -right-1 bg-brand text-white p-2 rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all border-4 border-white">
                         <Camera size={14} strokeWidth={3} />
                      </button>
                   </div>
                   <span className="text-[10px] font-black text-brand uppercase tracking-widest">Change Photo</span>
                </div>

                {/* Form Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <EditField label="Full Name" value={tempProfile.name} onChange={(v) => setTempProfile({...tempProfile, name: v})} icon={<User size={16} />} />
                   <EditField label="Phone" value={tempProfile.phone} onChange={(v) => setTempProfile({...tempProfile, phone: v})} icon={<Smartphone size={16} />} />
                </div>

                <EditField label="Email Address" value={tempProfile.email} onChange={(v) => setTempProfile({...tempProfile, email: v})} icon={<Mail size={16} />} />
             </div>

             <footer className="px-8 py-6 border-t border-slate-50 bg-slate-50/50 backdrop-blur-sm flex items-center gap-4">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all text-sm uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-[2] bg-brand text-white py-4 rounded-2xl font-black shadow-xl shadow-brand/30 hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-widest"
                >
                  Save Changes
                </button>
             </footer>
          </div>
        </div>
      )}

      {/* Profile Header Section */}
      <div className="relative pt-12 pb-4 text-center px-6">
        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] relative">
            <Image 
              src={profile.avatar} 
              alt={profile.name} 
              width={128} 
              height={128} 
              className="object-cover"
            />
          </div>
          <button 
            onClick={handleEditClick}
            className="absolute bottom-1 right-1 bg-brand text-white p-2.5 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all border-4 border-white"
          >
            <Edit2 size={16} />
          </button>
        </div>
        
        <h2 className="text-2xl font-bold text-[#1e293b] tracking-tight">{profile.name}</h2>
        <p className="text-slate-400 text-[13px] font-medium mt-1">Member since Nov 2025</p>
      </div>

      {/* Badges & Stats Row */}
      <div className="flex flex-col items-center gap-4 px-6 mb-8">
        <div className="flex gap-2">
           <div className="flex items-center gap-1.5 bg-[#4caf50] text-white px-3.5 py-1.5 rounded-full shadow-sm">
             <Star size={14} className="fill-white" />
             <span className="font-bold text-[13px]">Trust: 90</span>
           </div>
           <div className="flex items-center gap-1.5 bg-blue-50 text-[#3b82f6] px-3.5 py-1.5 rounded-full border border-blue-100 shadow-sm">
             <div className="bg-[#3b82f6] text-white rounded-full p-0.5"><Check size={10} strokeWidth={4} /></div>
             <span className="font-bold text-[13px]">Verified</span>
           </div>
        </div>
        
        <div className="flex items-center gap-4 text-slate-500 font-bold text-[14px]">
          <span>0 <span className="font-medium text-slate-400">Followers</span></span>
          <div className="w-[1px] h-3 bg-slate-200"></div>
          <span>0 <span className="font-medium text-slate-400">Following</span></span>
        </div>
      </div>

      {/* Google Login Section */}
      <div className="flex items-center justify-center gap-2 mb-8 text-slate-500">
        <span className="text-[13px] font-medium">User logged in with</span>
        <div className="flex items-center gap-1.5 font-bold text-[14px] text-slate-700">
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </div>
      </div>

      {/* Details Section */}
      <div className="px-6 flex flex-col gap-3 mb-10">
        <DetailCard icon={<User size={18} />} value={profile.name} label="Full Name" />
        <DetailCard icon={<Mail size={18} />} value={profile.email} label="Email Address" />
        <DetailCard icon={<Smartphone size={18} />} value={profile.phone} label="Phone Number" />
      </div>

      {/* AI Trust Section */}
      <div className="px-6 mb-12">
        <h4 className="text-[14px] font-bold text-slate-800 mb-4 px-1">AI Trust & Behavior</h4>
        <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_20px_rgba(0,0,0,0.04)] border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
             <div className="bg-emerald-500 rounded-lg p-1 text-white">
                <Check size={16} strokeWidth={4} />
             </div>
             <span className="text-[15px] font-bold text-slate-700">Trust Score  90</span>
             <div className="ml-auto flex gap-1">
                <div className="w-2.5 h-2.5 bg-blue-400/20 rounded-full"></div>
                <div className="w-2.5 h-2.5 bg-blue-400/30 rounded-full"></div>
             </div>
          </div>
          
          <div className="w-full h-[6px] bg-slate-50 rounded-full mb-6 relative overflow-hidden">
             <div className="absolute top-0 left-0 h-full bg-[#4caf50] rounded-full w-[90%]"></div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-50 pt-5">
             <div className="flex items-center gap-2 text-slate-500">
                <Clock size={16} />
                <span className="text-[13px] font-medium">Return History: <span className="text-slate-700 font-bold">On-time 95%</span></span>
             </div>
             <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-slate-500">Risk Level: <span className="text-[#219653] font-bold">Low</span></span>
                <div className="bg-[#4caf50] rounded-full p-0.5 text-white">
                   <Check size={10} strokeWidth={4} />
                </div>
             </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function DetailCard({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) {
  return (
    <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_4px_10px_rgba(0,0,0,0.02)] group hover:border-brand/40 transition-all cursor-pointer overflow-hidden">
      <div className="w-12 h-12 flex items-center justify-center bg-[#f0f4f8] rounded-xl text-slate-500 group-hover:text-brand bg-gradient-to-br from-slate-50 to-slate-100 group-hover:from-blue-50 group-hover:to-blue-100 transition-all shrink-0">
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
         <span className="text-[15px] font-bold text-slate-700 group-hover:text-slate-900 transition-colors truncate">{value}</span>
      </div>
    </div>
  );
}

function EditField({ label, value, onChange, icon }: { label: string, value: string, onChange: (v: string) => void, icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 scale-in animate-in duration-300">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative flex items-center group">
         {icon && <div className="absolute left-4 text-slate-300 group-focus-within:text-brand transition-colors">{icon}</div>}
         <input 
            type="text" 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className={`w-full bg-slate-50 border border-slate-100 p-4 ${icon ? 'pl-11' : 'pl-4'} rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 ring-brand/5 focus:border-brand/30 transition-all`}
         />
      </div>
    </div>
  );
}
