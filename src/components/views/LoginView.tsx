"use client";

import React, { useState } from 'react';
import { 
  BookOpen, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight
} from 'lucide-react';

interface LoginViewProps {
  onLogin: () => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-[#f8faff] flex items-center justify-center p-4 overflow-hidden">
      {/* Dynamic Animated Background */}
      <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#1b52d6]/5 rounded-full blur-[120px] animate-pulse"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      <div className="relative w-full max-w-md z-10 animate-in fade-in zoom-in-95 duration-500">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10 text-center">
           <div className="bg-[#1b52d6] w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-brand/40 mb-4 rotate-3">
              <BookOpen size={32} strokeWidth={3} />
           </div>
           <h1 className="text-3xl font-black text-slate-800 tracking-tighter">StudentRental</h1>
           <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-[0.2em]">Campus Marketplace</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-white/40 flex flex-col gap-8 relative overflow-hidden group">
           <div className="absolute inset-0 border-[1.5px] border-white/50 rounded-[3rem] pointer-events-none"></div>
           
           <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                 {mode === 'login' ? "Welcome Back!" : "Join the Campus"}
              </h2>
              <div className="bg-[#1b52d6]/10 px-3 py-1 rounded-full">
                 <span className="text-[10px] font-black text-[#1b52d6] uppercase tracking-widest leading-none">V2.0 PRO</span>
              </div>
           </div>

           <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email ID</label>
                 <div className="relative flex items-center group/input">
                    <div className="absolute left-5 text-slate-300 group-focus-within/input:text-[#1b52d6] transition-colors">
                       <Mail size={18} />
                    </div>
                    <input 
                       type="email" 
                       required
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       placeholder="you@college.edu"
                       className="w-full bg-slate-50/50 border border-slate-100 p-4 pl-14 rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 ring-brand/5 focus:border-brand/30 transition-all text-sm"
                    />
                 </div>
              </div>

              <div className="flex flex-col gap-2">
                 <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                    {mode === 'login' && <button type="button" className="text-[10px] font-black text-[#1b52d6] uppercase tracking-widest hover:underline">Forgot?</button>}
                 </div>
                 <div className="relative flex items-center group/input">
                    <div className="absolute left-5 text-slate-300 group-focus-within/input:text-[#1b52d6] transition-colors">
                       <Lock size={18} />
                    </div>
                    <input 
                       type={showPassword ? "text" : "password"} 
                       required
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       placeholder="••••••••"
                       className="w-full bg-slate-50/50 border border-slate-100 p-4 pl-14 pr-14 rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 ring-brand/5 focus:border-brand/30 transition-all text-sm"
                    />
                    <button 
                       type="button"
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute right-5 text-slate-300 hover:text-slate-600 transition-colors"
                    >
                       {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                 </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#1b52d6] text-white py-4.5 rounded-2xl font-black shadow-2xl shadow-brand/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm mt-2"
              >
                {mode === 'login' ? 'Proceed to Campus' : 'Create Account'}
                <ArrowRight size={20} strokeWidth={3} />
              </button>
           </form>

           <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-[1.5px] bg-slate-100"></div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Social Connect</span>
              <div className="flex-1 h-[1.5px] bg-slate-100"></div>
           </div>

           <button 
             onClick={onLogin}
             className="w-full bg-white border border-slate-100 py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all group"
           >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-[13px] font-bold text-slate-700">Continue with Google Account</span>
           </button>
        </div>

        <div className="mt-8 text-center">
           <button 
             onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
             className="text-slate-400 font-bold text-sm tracking-tight"
           >
              {mode === 'login' ? "Don't have an account? " : "Already using Rentro? "}
              <span className="text-[#1b52d6] font-black hover:underline underline-offset-4 decoration-2">
                 {mode === 'login' ? "Create one now" : "Back to Login"}
              </span>
           </button>
        </div>
      </div>
    </div>
  );
}
