"use client";

import React from 'react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

interface WishlistItem {
  id: number;
  name: string;
  price: string;
  image: string;
}

const MOCK_WISHLIST: WishlistItem[] = [
  { id: 1, name: 'MacBook Pro M2', price: '₹ 250/day', image: 'https://images.unsplash.com/photo-1517336714460-4c742a27744b?auto=format&fit=crop&q=80&w=200' },
  { id: 4, name: 'Sony WH-1000XM4', price: '₹ 120/day', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=200' },
];

interface WishlistSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WishlistSidebar({ isOpen, onClose }: WishlistSidebarProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] animate-in fade-in duration-300"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[201] shadow-2xl transition-transform duration-500 ease-in-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
           {/* Header */}
           <header className="px-8 py-8 flex items-center justify-between border-b border-slate-50">
              <div className="flex items-center gap-3">
                 <div className="bg-rose-50 p-2.5 rounded-2xl text-rose-500 shadow-sm">
                    <Heart size={24} fill="currentColor" strokeWidth={3} />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Saved Items</h3>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{MOCK_WISHLIST.length} items in wishlist</p>
                 </div>
              </div>
              <button 
                onClick={onClose}
                className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all"
              >
                <X size={24} strokeWidth={3} />
              </button>
           </header>

           {/* Content */}
           <div className="flex-1 overflow-y-auto p-8 space-y-6 hide-scrollbar">
              {MOCK_WISHLIST.length > 0 ? (
                MOCK_WISHLIST.map((item) => (
                  <div key={item.id} className="group flex gap-4 p-4 rounded-3xl border border-slate-100 bg-white hover:border-brand/40 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                     <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-slate-50 bg-slate-50 group-hover:scale-105 transition-transform">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                     </div>
                     <div className="flex-1 flex flex-col pt-1">
                        <h4 className="font-bold text-slate-800 text-[15px] leading-tight mb-1 group-hover:text-brand transition-colors">{item.name}</h4>
                        <p className="text-sm font-black text-slate-400 mb-auto">{item.price}</p>
                        
                        <div className="flex items-center gap-3 mt-3">
                           <button className="flex-1 bg-brand/5 text-brand text-[11px] font-black uppercase tracking-widest py-2 rounded-xl hover:bg-brand hover:text-white transition-all shadow-sm">
                              Rent Now
                           </button>
                           <button className="p-2 text-slate-300 hover:text-rose-500 transition-all">
                              <Trash2 size={16} />
                           </button>
                        </div>
                     </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-20 px-6">
                   <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mb-6 border-dashed border-2 border-slate-200">
                      <Heart size={32} />
                   </div>
                   <h4 className="text-lg font-bold text-slate-800 mb-2">Your wishlist is empty</h4>
                   <p className="text-sm text-slate-400 font-medium leading-relaxed">Explore campus rentals and save your favorites here!</p>
                </div>
              )}
           </div>

           {/* Footer */}
           <footer className="p-8 border-t border-slate-50 bg-slate-50/50 backdrop-blur-sm">
              <button className="w-full bg-brand text-white py-4.5 rounded-2xl font-black shadow-2xl shadow-brand/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm">
                 Explore Now
                 <ArrowRight size={20} strokeWidth={3} />
              </button>
           </footer>
        </div>
      </aside>
    </>
  );
}
