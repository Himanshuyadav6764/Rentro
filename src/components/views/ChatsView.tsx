"use client";

import React, { useState } from 'react';
import { 
  ChevronLeft, 
  MessageCircle, 
  Settings, 
  Menu, 
  CheckCircle2, 
  Phone, 
  Video, 
  MoreVertical, 
  Paperclip, 
  Send, 
  CheckCheck,
  Tag,
  MapPin,
  CheckCircle
} from 'lucide-react';
import Image from 'next/image';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  time: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface Chat {
  id: string;
  name: string;
  product: string;
  lastMessage: string;
  time: string;
  trustScore: number;
  isPending?: boolean;
  avatar?: string;
  messages: Message[];
}

const INITIAL_CHATS: Chat[] = [
  {
    id: '1',
    name: 'Ankit Sharma',
    product: 'Laptops for coding',
    lastMessage: 'Agreed. Time and place set. See you at...',
    time: '3:58 PM',
    trustScore: 78,
    avatar: '/ankit-avatar.png',
    messages: [
      { id: 'm1', text: 'Laptop available hai, 7 days ke liye ₹500/day 💻 💵', sender: 'other', time: '3:50 PM' },
      { id: 'm2', text: 'Thoda kam ho sakta hai?', sender: 'me', time: '3:52 PM', status: 'read' },
      { id: 'm3', text: '₹450 final.', sender: 'other', time: '3:53 PM' },
      { id: 'm4', text: 'Theek hai, done!', sender: 'me', time: '3:54 PM', status: 'read' },
      { id: 'm5', text: 'Agreed. Time and place set. See you at the main gate tomorrow.', sender: 'other', time: '3:58 PM' }
    ]
  },
  {
    id: '2',
    name: 'Priya Verma',
    product: 'Engineering Books',
    lastMessage: 'Got it. I\'ll be there on time. 🤝',
    time: '3:36 PM',
    trustScore: 82,
    isPending: true,
    messages: [
      { id: 'pm1', text: 'Hi, I need the books for next week.', sender: 'me', time: '3:30 PM', status: 'read' },
      { id: 'pm2', text: 'Sure, they are available. When can you collect?', sender: 'other', time: '3:34 PM' },
      { id: 'pm3', text: 'Got it. I\'ll be there on time. 🤝', sender: 'other', time: '3:36 PM' }
    ]
  },
  {
    id: '3',
    name: 'Neha Gupta',
    product: 'Data Science Notes',
    lastMessage: '2:15 PM',
    time: '2:15 PM',
    trustScore: 92,
    messages: []
  }
];

export default function ChatsView() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');

  const selectedChat = chats.find(c => c.id === selectedChatId);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChatId) return;

    const msg: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setChats(prev => prev.map(chat => {
      if (chat.id === selectedChatId) {
        return {
          ...chat,
          messages: [...chat.messages, msg],
          lastMessage: newMessage,
          time: msg.time
        };
      }
      return chat;
    }));

    setNewMessage("");
  };

  const handleAcceptRequest = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChats(prev => prev.map(chat => {
      if (chat.id === id) {
        return { ...chat, isPending: false };
      }
      return chat;
    }));
  };

  const handleDeclineRequest = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChats(prev => prev.filter(chat => chat.id !== id));
    if (selectedChatId === id) setSelectedChatId(null);
  };

  const chatList = activeTab === 'all' 
    ? chats 
    : chats.filter(c => c.isPending);

  return (
    <div className="flex h-full w-full bg-white max-w-6xl mx-auto overflow-hidden relative">
      {/* Left Sidebar (Chat List) */}
      <div className={`md:w-[35%] lg:w-[30%] min-w-[320px] bg-[#f8fafe] border-r border-slate-200 flex flex-col ${selectedChatId ? 'hidden md:flex' : 'flex w-full md:w-[35%]'}`}>
        <div className="px-5 py-3 md:py-4 border-b border-slate-200 flex items-center justify-between bg-white text-brand">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
            <h2 className="text-lg md:text-xl font-bold text-[#1c2b4c]">Chats</h2>
          </div>
          <button className="text-slate-400 hover:text-brand transition-colors p-2">
            <Settings className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        <div className="px-5 py-2 flex gap-6 bg-white border-b border-slate-100">
          <button 
            onClick={() => setActiveTab('all')}
            className={`pb-2 text-xs md:text-sm font-bold transition-all relative ${activeTab === 'all' ? 'text-brand' : 'text-slate-400 hover:text-slate-600'}`}
          >
            All Chats
            {activeTab === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('pending')}
            className={`pb-2 text-xs md:text-sm font-bold transition-all relative flex items-center gap-1.5 ${activeTab === 'pending' ? 'text-brand' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Pending
            {chats.filter(c => c.isPending).length > 0 && (
              <span className="bg-red-500 text-white text-[9px] md:text-[10px] w-3.5 h-3.5 md:w-4 md:h-4 rounded-full flex justify-center items-center font-bold">
                {chats.filter(c => c.isPending).length}
              </span>
            )}
            {activeTab === 'pending' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full"></div>}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar">
          <div className="px-5 py-3 md:py-4 flex justify-between items-center text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span>Recent Activity</span>
          </div>
          
          {chatList.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm italic">
               No chats found here.
            </div>
          ) : (
            chatList.map(chat => (
              <div 
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className={`px-4 md:px-5 py-3 md:py-4 cursor-pointer transition-all border-b border-slate-100/50 ${selectedChatId === chat.id ? 'bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] z-10' : 'hover:bg-blue-50/20'}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 md:gap-4">
                    <div className="relative">
                      {chat.avatar ? (
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl overflow-hidden border border-slate-200">
                          <Image src={chat.avatar} alt={chat.name} width={48} height={48} className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-blue-100 flex items-center justify-center text-brand font-bold border border-blue-200">
                          {chat.name.charAt(0)}
                        </div>
                      )}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 md:w-4 md:h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="max-w-[140px] md:max-w-[150px]">
                      <h3 className={`text-sm md:text-[15px] ${selectedChatId === chat.id ? 'font-black text-brand' : 'font-bold text-slate-800'} truncate`}>{chat.name}</h3>
                      <p className="text-[10px] md:text-[11px] text-slate-500 font-bold truncate opacity-80 uppercase tracking-tight">{chat.product}</p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5 font-medium italic">&quot;{chat.lastMessage}&quot;</p>
                    </div>
                  </div>
                  <span className="text-[9px] md:text-[10px] font-bold text-slate-400">{chat.time}</span>
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                   <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-lg border border-emerald-100/50">
                      <CheckCircle className="w-3 md:w-3.5 h-3 md:h-3.5" />
                      <span className="text-[9px] md:text-[10px] font-black uppercase">TRUST {chat.trustScore}</span>
                   </div>
                   {chat.isPending && (
                     <span className="text-[9px] md:text-[10px] font-black text-red-500 uppercase tracking-tighter bg-red-50 px-2 py-0.5 rounded-full border border-red-100/50">Pending</span>
                   )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Content / Chat Detail */}
      <div className={`flex-1 bg-white flex flex-col ${!selectedChatId ? 'hidden md:flex items-center justify-center bg-slate-50/50' : 'flex h-full'}`}>
         {!selectedChatId ? (
           <div className="text-center p-6 md:p-12 animate-in fade-in duration-1000">
             <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-[0_10px_40px_rgba(27,82,214,0.1)] ring-1 ring-slate-100 relative">
               <MessageCircle className="w-10 h-10 md:w-12 md:h-12 text-brand" />
               <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-8 h-8 md:w-10 md:h-10 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-white text-white">
                 <CheckCheck size={16} />
               </div>
             </div>
             <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2 md:mb-3 tracking-tight">StudentRental Chat</h3>
             <p className="text-xs md:text-sm text-slate-500 max-w-[280px] md:max-w-sm mx-auto font-medium leading-relaxed">Select a user to start bargaining and renting gear!</p>
           </div>
         ) : (
           <div className="flex flex-col h-full bg-white overflow-hidden animate-in slide-in-from-right-2 duration-300">
             {/* Dynamic Chat Header */}
             <header className="bg-white px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b border-slate-100 sticky top-0 z-10 shadow-sm">
               <div className="flex items-center gap-3 md:gap-4">
                 <button onClick={() => setSelectedChatId(null)} className="md:hidden p-1.5 -ml-1.5 text-slate-400 hover:text-brand transition-colors">
                   <ChevronLeft size={22} strokeWidth={3} />
                 </button>
                 <div className="relative w-10 min-w-[40px] h-10 md:w-12 md:h-12">
                   {selectedChat?.avatar ? (
                     <div className="w-full h-full rounded-xl md:rounded-2xl overflow-hidden border-2 border-brand/10 shadow-sm">
                       <Image src={selectedChat.avatar} alt={selectedChat.name} width={48} height={48} className="object-cover" />
                     </div>
                   ) : (
                     <div className="w-full h-full rounded-xl md:rounded-2xl bg-blue-100 flex items-center justify-center text-brand font-bold border border-blue-200">
                       {selectedChat?.name.charAt(0)}
                     </div>
                   )}
                   <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                 </div>
                 <div className="min-w-0">
                   <h1 className="text-sm md:text-lg font-black text-slate-800 leading-none mb-1 truncate">{selectedChat?.name}</h1>
                   <div className="flex items-center gap-1.5">
                     <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{selectedChat?.product}</span>
                     <span className="w-1 h-1 bg-green-500 rounded-full shrink-0"></span>
                     <span className="text-[9px] md:text-[10px] font-bold text-green-500 uppercase tracking-tighter">Online</span>
                   </div>
                 </div>
               </div>
               <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
                 <button className="p-2 md:p-3 rounded-xl bg-brand/5 text-brand hover:bg-brand hover:text-white transition-all transform active:scale-95 shadow-sm border border-brand/10">
                   <Phone size={18} strokeWidth={3} />
                 </button>
                 <button className="p-2 md:p-3 rounded-xl bg-brand/5 text-brand hover:bg-brand hover:text-white transition-all transform active:scale-95 shadow-sm border border-brand/10">
                   <Video size={18} strokeWidth={3} />
                 </button>
                 <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                   <MoreVertical size={20} />
                 </button>
               </div>
             </header>

             {/* Dynamic Content Area */}
             <div className="flex-1 overflow-y-auto flex flex-col hide-scrollbar bg-slate-50/10">
               
               {/* Suggestion Bar */}
               <div className="flex gap-2 px-4 md:px-6 py-3 md:py-4 overflow-x-auto hide-scrollbar bg-white border-b border-slate-50 select-none">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2.5 bg-white rounded-full text-[10px] md:text-[11px] font-black shadow-sm border border-slate-200 hover:border-brand/40 transition-all whitespace-nowrap active:scale-95">
                    <CheckCircle2 size={12} className="text-brand" />
                    YES, AVAILABLE
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2.5 bg-white rounded-full text-[10px] md:text-[11px] font-black shadow-sm border border-slate-200 hover:border-brand/40 transition-all whitespace-nowrap active:scale-95">
                    <Tag size={12} className="text-amber-500" />
                    REDUCE PRICE?
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2.5 bg-white rounded-full text-[10px] md:text-[11px] font-black shadow-sm border border-slate-200 hover:border-brand/40 transition-all whitespace-nowrap active:scale-95">
                    <MapPin size={12} className="text-teal-500" />
                    WHERE TO MEET?
                  </button>
               </div>

               {/* Pending Request Banner */}
               {selectedChat?.isPending && (
                 <div className="mx-4 md:mx-6 mt-4 md:mt-6 p-4 md:p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl md:rounded-[2rem] border border-amber-100 flex flex-col sm:flex-row items-center justify-between gap-4 md:gap-6 shadow-md animate-in slide-in-from-top-4 duration-500">
                   <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
                     <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm relative shrink-0">
                        <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-amber-500" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] md:text-[10px] text-white font-black">!</div>
                     </div>
                     <div>
                       <p className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-tight">Rental Request Pending</p>
                       <p className="text-[10px] md:text-xs text-slate-500 font-bold opacity-80 mt-0.5">Trust Score: {selectedChat.trustScore}</p>
                     </div>
                   </div>
                   <div className="flex gap-2 w-full sm:w-auto">
                     <button 
                      onClick={(e) => handleDeclineRequest(selectedChat.id, e)}
                      className="flex-1 sm:flex-none px-4 md:px-8 py-2 md:py-3 bg-white text-red-500 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs border border-red-100 hover:bg-red-50 active:scale-95 transition-all"
                     >
                       DECLINE
                     </button>
                     <button 
                      onClick={(e) => handleAcceptRequest(selectedChat.id, e)}
                      className="flex-1 sm:flex-none px-4 md:px-8 py-2 md:py-3 bg-brand text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs shadow-lg shadow-brand/20 hover:scale-105 active:scale-95 transition-all"
                     >
                       ACCEPT
                     </button>
                   </div>
                 </div>
               )}

               {/* Messages Area */}
               <div className="p-4 md:p-6 flex flex-col gap-4 md:gap-6">
                  {selectedChat?.messages.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center opacity-30 text-slate-400">
                      <MessageCircle size={48} strokeWidth={1.5} className="mb-4" />
                      <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Start a new conversation</p>
                    </div>
                  ) : (
                    selectedChat?.messages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex flex-col gap-1 max-w-[90%] sm:max-w-[75%] ${msg.sender === 'me' ? 'self-end' : 'self-start'}`}
                      >
                        <div className={`p-3 md:p-4 rounded-2xl md:rounded-[2rem] shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.sender === 'me' ? 'bg-gradient-to-br from-brand to-blue-700 text-white rounded-br-sm' : 'bg-white text-slate-800 rounded-bl-sm border border-slate-100'}`}>
                          <p className="text-sm md:text-[15px] leading-relaxed font-bold tracking-tight">{msg.text}</p>
                          <div className={`flex items-center gap-1.5 mt-1.5 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                            <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest ${msg.sender === 'me' ? 'text-blue-100/60' : 'text-slate-400'}`}>
                              {msg.time}
                            </span>
                            {msg.sender === 'me' && (
                              <CheckCheck size={14} className={msg.status === 'read' ? 'text-emerald-300' : 'text-white/50'} />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
               </div>
             </div>

             {/* Footer Input Area */}
             <footer className="p-4 md:p-6 pt-2 pb-6 md:pb-8 bg-white border-t border-slate-50 sticky bottom-0 z-20">
                <div className="flex items-center gap-3 max-w-4xl mx-auto">
                  <div className="flex-1 flex items-center bg-slate-50 border border-slate-200/50 rounded-2xl md:rounded-[2rem] px-2 md:px-3 focus-within:ring-4 ring-brand/5 transition-all shadow-inner relative group">
                    <button className="p-2 md:p-3 text-slate-400 hover:text-brand transition-colors">
                      <Paperclip size={20} strokeWidth={2.5} />
                    </button>
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..." 
                      className="flex-1 bg-transparent border-none outline-none text-xs md:text-[15px] text-slate-800 py-3 md:py-4 px-1 font-bold placeholder:text-slate-400"
                    />
                  </div>
                  <button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-brand text-white rounded-xl md:rounded-2xl shadow-xl shadow-brand/30 disabled:opacity-30 disabled:shadow-none hover:scale-105 active:scale-95 transition-all transform shrink-0"
                  >
                    <Send size={20} strokeWidth={2.5} className="mr-0.5 mt-0.5" />
                  </button>
                </div>
             </footer>
           </div>
         )}
      </div>
    </div>
  );
}
