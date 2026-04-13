"use client";

import React from "react";
import Image from "next/image";
import { 
  Phone, 
  Video, 
  MoreVertical, 
  Paperclip, 
  Send, 
  CheckCircle2, 
  Tag, 
  MapPin,
  CheckCheck
} from "lucide-react";

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen bg-slate-50 max-w-md mx-auto relative overflow-hidden font-sans border-x border-slate-200">
      {/* Header Section */}
      <header className="bg-white px-5 pt-8 pb-5 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.03)] z-10 rounded-b-[2rem]">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-brand ring-4 ring-brand/5 transition-transform group-hover:scale-105">
              <Image 
                src="/ankit-avatar.png" 
                alt="Ankit Sharma" 
                width={56} 
                height={56} 
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
              <div className="w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Ankit Sharma</h1>
            <div className="flex flex-col leading-tight">
              <p className="text-sm text-slate-500 font-medium tracking-tight">Laptops for coding</p>
              <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1">
                <span className="w-1 h-1 bg-green-500 rounded-full"></span> Online
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-5 text-brand">
          <button className="p-2.5 rounded-2xl bg-brand/5 hover:bg-brand/10 transition-colors active:scale-95">
            <Phone size={20} strokeWidth={2.5} />
          </button>
          <button className="p-2.5 rounded-2xl bg-brand/5 hover:bg-brand/10 transition-colors active:scale-95">
            <Video size={20} strokeWidth={2.5} />
          </button>
          <button className="p-2 rounded-xl text-slate-400 hover:text-slate-600">
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      {/* AI Suggestion Chips */}
      <div className="flex gap-3 px-5 py-5 overflow-x-auto hide-scrollbar whitespace-nowrap bg-transparent mt-2">
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 rounded-full text-xs font-semibold shadow-sm border border-slate-200/50 hover:border-brand/30 hover:bg-blue-50/30 transition-all active:scale-95">
          <CheckCircle2 size={14} className="text-brand" />
          Yes, available
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 rounded-full text-xs font-semibold shadow-sm border border-slate-200/50 hover:border-brand/30 hover:bg-blue-50/30 transition-all active:scale-95">
          <Tag size={14} className="text-amber-500" />
          Can you reduce the price?
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 rounded-full text-xs font-semibold shadow-sm border border-slate-200/50 hover:border-brand/30 hover:bg-blue-50/30 transition-all active:scale-95">
          <MapPin size={14} className="text-teal-500" />
          When can I pick up?
        </button>
      </div>

      {/* Chat Messages */}
      <main className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-6 hide-scrollbar bg-slate-50/50">
        <div className="flex flex-col items-center mb-2">
          <span className="px-4 py-1.5 bg-slate-200/50 text-slate-500 text-[10px] font-bold uppercase tracking-[0.1em] rounded-full">
            Today
          </span>
        </div>

        {/* Received Message */}
        <div className="flex flex-col gap-1 max-w-[85%] self-start animate-in fade-in slide-in-from-left duration-500">
          <div className="flex items-end gap-2">
            <div className="bg-white p-4 rounded-3xl rounded-bl-sm shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col gap-1">
              <p className="text-sm text-slate-800 font-medium leading-relaxed">
                Laptop available hai, 7 days ke liye <span className="text-brand font-bold">₹500/day</span> 💻 💵
              </p>
              <div className="flex justify-end">
                <span className="text-[10px] text-slate-400 font-medium">3:50 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sent Message */}
        <div className="flex flex-col gap-1 max-w-[80%] self-end animate-in fade-in slide-in-from-right duration-500">
          <div className="bg-gradient-to-br from-brand to-blue-700 p-4 rounded-3xl rounded-br-sm shadow-[0_8px_20px_rgba(27,82,214,0.15)] flex flex-col gap-1">
            <p className="text-sm text-white font-medium leading-relaxed">
              Thoda kam ho sakta hai?
            </p>
            <div className="flex justify-end items-center gap-1">
              <span className="text-[10px] text-blue-100/80 font-medium">3:52 PM</span>
              <CheckCheck size={14} className="text-blue-200" />
            </div>
          </div>
        </div>

        {/* Received Message */}
        <div className="flex flex-col gap-1 max-w-[70%] self-start animate-in fade-in slide-in-from-left duration-500 delay-150">
          <div className="bg-white p-4 rounded-3xl rounded-bl-sm shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col gap-1">
            <p className="text-sm text-slate-800 font-bold">
              ₹450 final.
            </p>
            <div className="flex justify-end">
              <span className="text-[10px] text-slate-400 font-medium">3:53 PM</span>
            </div>
          </div>
        </div>

        {/* Sent Message */}
        <div className="flex flex-col gap-1 max-w-[70%] self-end animate-in fade-in slide-in-from-right duration-500 delay-300">
          <div className="bg-gradient-to-br from-brand to-blue-700 p-4 rounded-3xl rounded-br-sm shadow-[0_8px_20px_rgba(27,82,214,0.15)] flex flex-col gap-1">
            <p className="text-sm text-white font-medium leading-relaxed">
              Theek hai, done!
            </p>
            <div className="flex justify-end items-center gap-1">
              <span className="text-[10px] text-blue-100/80 font-medium">3:54 PM</span>
              <CheckCheck size={14} className="text-blue-200" />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Section */}
      <footer className="bg-white p-5 pt-3 pb-8 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] rounded-t-[2.5rem] z-10 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-1 bg-slate-50 border border-slate-200/50 rounded-3xl p-1 shadow-inner group focus-within:ring-2 ring-brand/10 transition-all">
            <button className="p-3 text-slate-400 hover:text-brand transition-colors">
              <Paperclip size={20} strokeWidth={2.5} />
            </button>
            <input 
              type="text" 
              placeholder="Type a message..." 
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-400 py-3 font-medium"
            />
          </div>
          <button className="w-12 h-12 flex items-center justify-center bg-brand text-white rounded-2xl shadow-[0_6px_20px_rgba(27,82,214,0.3)] hover:scale-105 active:scale-95 transition-all">
            <Send size={20} strokeWidth={2.5} className="mr-0.5 mt-0.5" />
          </button>
        </div>
      </footer>

      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-brand/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 left-0 -ml-20 w-48 h-48 bg-blue-400/5 rounded-full blur-3xl -z-10"></div>
    </div>
  );
}
