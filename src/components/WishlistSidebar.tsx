"use client";

import React from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import Image from 'next/image';

export type WishlistItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
};

interface WishlistSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: WishlistItem[];
  onRemove: (id: string) => void;
  onExploreMore: () => void;
}

export default function WishlistSidebar({
  isOpen,
  onClose,
  items,
  onRemove,
  onExploreMore,
}: WishlistSidebarProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1100] transition-all duration-500 animate-in fade-in"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-[400px] bg-white z-[1200] shadow-2xl transition-all duration-500 ease-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        
        {/* Header */}
        <header className="px-8 py-8 flex items-center justify-between border-b border-slate-50 bg-white sticky top-0">
          <div className="flex items-center gap-3">
             <div className="bg-rose-50 p-2.5 rounded-2xl">
                <Heart size={24} className="text-rose-500 fill-rose-500" />
             </div>
             <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Wishlist</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{items.length} Saved Items</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all border border-slate-100"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 hide-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 py-20 grayscale opacity-40">
               <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <Heart size={32} />
               </div>
               <h4 className="text-lg font-black text-slate-700 mb-2">Your wishlist is empty</h4>
               <p className="text-sm font-medium text-slate-500">Save items you like to view them later here.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="group flex items-start gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 hover:border-rose-200 transition-all shadow-sm hover:shadow-xl hover:shadow-rose-500/5 relative overflow-hidden">
                <div className="w-24 h-24 bg-slate-50 rounded-2xl overflow-hidden shrink-0 border border-slate-50 group-hover:scale-105 transition-transform duration-500">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={96}
                      height={96}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white">
                      <ShoppingBag size={32} className="text-slate-200" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 pr-8">
                   <span className="text-[9px] font-black text-rose-500 uppercase tracking-[0.2em]">{item.category || 'OTHERS'}</span>
                   <h4 className="text-[15px] font-black text-slate-800 truncate mb-1 mt-0.5">{item.name}</h4>
                   <p className="text-lg font-black text-slate-900">₹{item.price.toLocaleString('en-IN')}</p>
                   
                   <div className="flex items-center gap-2 mt-3">
                      <button className="bg-[#002f34] text-white px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                        Rent Now
                      </button>
                   </div>
                </div>
                <button
                  onClick={() => onRemove(item.id)}
                  className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors p-2 hover:bg-rose-50 rounded-xl"
                >
                   <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-50 bg-white">
            <button
             onClick={onExploreMore}
             className="w-full bg-[#002f34] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-[#002f34]/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Explore More Rentals
           </button>
        </div>
      </div>
    </>
  );
}
