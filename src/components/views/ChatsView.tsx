"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  MessageCircle, 
  Settings, 
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
import { fetchListingById } from '@/lib/listingData';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  time: string;
  createdAt?: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface ApiMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  seen: boolean;
}

interface MessageSeenEvent {
  senderId: string;
  receiverId: string;
  messageIds: string[];
  seenAt: string;
}

interface Chat {
  id: string;
  userId: string;
  name: string;
  product: string;
  lastMessage: string;
  time: string;
  lastMessageAt?: string;
  trustScore: number;
  online?: boolean;
  isPending?: boolean;
  avatar?: string;
  messages: Message[];
}

type ChatsViewProps = {
  openOwnerName?: string | null;
  openUserId?: string | null;
  openUserName?: string | null;
  openItemId?: string | null;
  openItemName?: string | null;
  backTo?: string | null;
  originTab?: string | null;
  standalone?: boolean;
};

type ChatItemContext = {
  name: string;
  pricePerDay: number | null;
};

type QuickReplyKey = 'available' | 'reduce_price' | 'where_meet';

const QUICK_REPLY_MESSAGES: Record<QuickReplyKey, string> = {
  available: 'Yes, this item is available.',
  reduce_price: 'Can you reduce the price?',
  where_meet: 'Where can we meet?',
};

const INITIAL_CHATS: Chat[] = [];

function formatMessageTime(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function sortChatsByActivity(chats: Chat[]) {
  return [...chats].sort((a, b) => {
    const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;

    if (aTime === bTime) {
      return 0;
    }

    return bTime - aTime;
  });
}

function toSafeInternalPath(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed.startsWith('/')) {
    return null;
  }
  if (trimmed.startsWith('//')) {
    return null;
  }

  return trimmed;
}

function labelFromOrigin(originTab: string | null | undefined) {
  if (originTab === 'my_listings') {
    return 'My Listings';
  }
  if (originTab === 'requests') {
    return 'Requests';
  }
  if (originTab === 'history') {
    return 'History';
  }
  return 'My Rentals';
}

export default function ChatsView({ openOwnerName, openUserId, openUserName, openItemId, openItemName, backTo, originTab, standalone = false }: ChatsViewProps) {
  const router = useRouter();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
  const [chatError, setChatError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeQuickReply, setActiveQuickReply] = useState<QuickReplyKey | null>(null);
  const [quickReplyCoolingDown, setQuickReplyCoolingDown] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [resolvedItemContext, setResolvedItemContext] = useState<ChatItemContext | null>(null);
  const lastOpenedOwnerRef = useRef<string | null>(null);
  const lastOpenedUserIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const quickReplyHighlightTimerRef = useRef<number | null>(null);
  const quickReplyCooldownTimerRef = useRef<number | null>(null);

  const selectedChat = chats.find(c => c.id === selectedChatId);
  const safeBackTo = toSafeInternalPath(backTo) || '/my-rentals';
  const activeContextItem = (resolvedItemContext?.name || openItemName?.trim() || selectedChat?.product || 'Rental Chat');
  const activeContextPrice = resolvedItemContext?.pricePerDay;
  const canViewItem = Boolean(openItemId?.trim()) || activeContextItem.toLowerCase() !== 'rental chat';

  useEffect(() => {
    let cancelled = false;

    async function hydrateContextFromItemId() {
      const incomingItemId = openItemId?.trim();
      if (!incomingItemId) {
        setResolvedItemContext(null);
        return;
      }

      try {
        const listing = await fetchListingById(incomingItemId);
        if (!listing || cancelled) {
          return;
        }

        const nextContext: ChatItemContext = {
          name: listing.title,
          pricePerDay: typeof listing.rent_price === 'number' ? listing.rent_price : null,
        };

        setResolvedItemContext(nextContext);

        if (openUserId?.trim()) {
          setChats((prev) =>
            prev.map((chat) =>
              chat.userId === openUserId.trim()
                ? { ...chat, product: nextContext.name }
                : chat,
            ),
          );
        }
      } catch {
        if (!cancelled) {
          setResolvedItemContext(null);
        }
      }
    }

    void hydrateContextFromItemId();

    return () => {
      cancelled = true;
    };
  }, [openItemId, openUserId]);

  const markMessagesAsSeen = useCallback(async (peerUserId: string) => {
    try {
      await fetch('/api/messages/seen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: peerUserId }),
      });
    } catch {
      // Seen status is best-effort and should not block chat usage.
    }
  }, []);

  const loadChatMessages = useCallback(async (peerUserId: string) => {
    if (!currentUserId) {
      return;
    }

    try {
      const response = await fetch(`/api/messages?userId=${encodeURIComponent(peerUserId)}`, {
        cache: 'no-store',
      });

      const payload = (await response.json()) as {
        success: boolean;
        error?: string;
        messages?: ApiMessage[];
      };

      if (!response.ok || !payload.success) {
        setChatError(payload.error || 'Unable to sync messages.');
        return;
      }

      const incomingMessages = (payload.messages || []).map((msg) => ({
        id: msg.id,
        text: msg.text,
        sender: msg.senderId === currentUserId ? 'me' : 'other',
        time: formatMessageTime(msg.createdAt),
        createdAt: msg.createdAt,
        status: msg.senderId === currentUserId ? (msg.seen ? 'read' : 'delivered') : undefined,
      } as Message));

      setChats((prev) => {
        const next = prev.map((chat) => {
          if (chat.userId !== peerUserId) {
            return chat;
          }

          const mergedMessages = [...incomingMessages];

          const latest = mergedMessages[mergedMessages.length - 1];

          return {
            ...chat,
            messages: mergedMessages,
            lastMessage: latest?.text || chat.lastMessage,
            time: latest?.time || chat.time,
            lastMessageAt: latest?.createdAt || chat.lastMessageAt,
          };
        });

        return sortChatsByActivity(next);
      });

      await markMessagesAsSeen(peerUserId);
    } catch {
      setChatError('Unable to sync messages.');
    }
  }, [currentUserId, markMessagesAsSeen]);

  const hydrateChatList = useCallback(async () => {
    try {
      const userRes = await fetch('/api/user/me', { cache: 'no-store' });
      const userPayload = (await userRes.json()) as {
        success?: boolean;
        user?: { id?: string };
      };

      if (!userRes.ok || !userPayload.success || !userPayload.user?.id) {
        return;
      }

      setCurrentUserId(userPayload.user.id);

      const chatsRes = await fetch('/api/messages/chats', { cache: 'no-store' });
      const chatsPayload = (await chatsRes.json()) as {
        success?: boolean;
        chats?: Array<{
          userId: string;
          name: string;
          avatar?: string;
          trustScore: number;
          lastMessage: string;
          lastMessageAt: string;
          online: boolean;
        }>;
      };

      if (!chatsRes.ok || !chatsPayload.success || !chatsPayload.chats) {
        setChatError('Unable to load chats.');
        return;
      }

      setChats((prev) => {
        const pendingByName = new Map(prev.map((chat) => [chat.name.toLowerCase(), Boolean(chat.isPending)]));
        const previousByUserId = new Map(prev.map((chat) => [chat.userId, chat]));
        const carryOverChats = prev.filter((chat) => chat.userId.startsWith('local-') || chat.messages.length > 0);

        const apiChats = chatsPayload.chats!.map((chat) => ({
          id: chat.userId,
          userId: chat.userId,
          name: chat.name,
          product: previousByUserId.get(chat.userId)?.product || 'Rental Chat',
          lastMessage: chat.lastMessage,
          time: formatMessageTime(chat.lastMessageAt),
          lastMessageAt: chat.lastMessageAt,
          trustScore: chat.trustScore,
          online: chat.online,
          avatar: chat.avatar,
          isPending: pendingByName.get(chat.name.toLowerCase()) || false,
          messages: [],
        } as Chat));

        const merged = [...apiChats];
        for (const existing of carryOverChats) {
          if (!merged.some((chat) => chat.userId === existing.userId)) {
            merged.push(existing);
          }
        }

        return sortChatsByActivity(merged);
      });
      setChatError(null);
    } catch {
      setChatError('Unable to load chats.');
    }
  }, []);

  const upsertRealtimeMessage = useCallback(
    (message: ApiMessage) => {
      if (!currentUserId) {
        return;
      }

      const peerUserId = message.senderId === currentUserId ? message.receiverId : message.senderId;
      const mappedMessage: Message = {
        id: message.id,
        text: message.text,
        sender: message.senderId === currentUserId ? 'me' : 'other',
        time: formatMessageTime(message.createdAt),
        createdAt: message.createdAt,
        status: message.senderId === currentUserId ? (message.seen ? 'read' : 'delivered') : undefined,
      };

      setChats((prev) => {
        let found = false;

        const next = prev.map((chat) => {
          if (chat.userId !== peerUserId) {
            return chat;
          }

          found = true;

          const alreadyExists = chat.messages.some((existing) => existing.id === mappedMessage.id);
          const nextMessages = alreadyExists
            ? chat.messages.map((existing) => (existing.id === mappedMessage.id ? mappedMessage : existing))
            : [...chat.messages, mappedMessage];

          return {
            ...chat,
            messages: nextMessages,
            lastMessage: mappedMessage.text,
            time: mappedMessage.time,
            lastMessageAt: mappedMessage.createdAt,
          };
        });

        if (!found) {
          next.unshift({
            id: peerUserId,
            userId: peerUserId,
            name: 'New Chat',
            product: 'Rental Chat',
            lastMessage: mappedMessage.text,
            time: mappedMessage.time,
            lastMessageAt: mappedMessage.createdAt,
            trustScore: 50,
            online: true,
            messages: [mappedMessage],
          });
        }

        return sortChatsByActivity(next);
      });

      if (message.senderId !== currentUserId && selectedChat?.userId === peerUserId) {
        void markMessagesAsSeen(peerUserId);
      }
    },
    [currentUserId, markMessagesAsSeen, selectedChat?.userId],
  );

  const handleRealtimeSeen = useCallback((payload: MessageSeenEvent) => {
    if (payload.messageIds.length === 0) {
      return;
    }

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.userId !== payload.senderId && chat.userId !== payload.receiverId) {
          return chat;
        }

        return {
          ...chat,
          messages: chat.messages.map((message) =>
            payload.messageIds.includes(message.id) && message.sender === 'me'
              ? { ...message, status: 'read' }
              : message,
          ),
        };
      }),
    );
  }, []);

  useEffect(() => {
    void hydrateChatList();
  }, [hydrateChatList]);

  useEffect(() => {
    const syncTimer = window.setInterval(() => {
      void hydrateChatList();
    }, 15000);

    return () => {
      window.clearInterval(syncTimer);
    };
  }, [hydrateChatList]);

  useEffect(() => {
    const incomingUserId = openUserId?.trim();
    const incomingItem = openItemName?.trim();
    if (!incomingUserId) {
      return;
    }
    if (lastOpenedUserIdRef.current === incomingUserId) {
      return;
    }

    setChats((prev) => {
      const existing = prev.find((chat) => chat.userId === incomingUserId);
      if (existing) {
        if (incomingItem && existing.product !== incomingItem) {
          return prev.map((chat) => (chat.userId === incomingUserId ? { ...chat, product: incomingItem } : chat));
        }
        return prev;
      }

      const placeholderName = openUserName?.trim() || 'Rental Chat';
      const nextChat: Chat = {
        id: incomingUserId,
        userId: incomingUserId,
        name: placeholderName,
        product: incomingItem || 'Rental Chat',
        lastMessage: 'Start your conversation',
        time: formatMessageTime(new Date().toISOString()),
        lastMessageAt: new Date().toISOString(),
        trustScore: 50,
        online: false,
        messages: [],
      };

      return sortChatsByActivity([nextChat, ...prev]);
    });

    setSelectedChatId(incomingUserId);
    setActiveTab('all');
    lastOpenedUserIdRef.current = incomingUserId;
  }, [openItemName, openUserId, openUserName]);

  useEffect(() => {
    const ownerName = openOwnerName?.trim();
    if (!ownerName) return;
    if (lastOpenedOwnerRef.current === ownerName) return;

    const ownerNameLower = ownerName.toLowerCase();
    let nextSelectedId: string | null = null;

    setChats((prev) => {
      const existing = prev.find((chat) => chat.name.toLowerCase() === ownerNameLower);
      if (existing) {
        nextSelectedId = existing.id;
        return prev;
      }

      const generatedId = `local-${Date.now()}`;
      const newChat: Chat = {
        id: generatedId,
        userId: generatedId,
        name: ownerName,
        product: 'Rental Chat',
        lastMessage: 'Start your conversation',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        lastMessageAt: new Date().toISOString(),
        trustScore: 75,
        online: true,
        messages: [],
      };

      nextSelectedId = newChat.id;
      return [newChat, ...prev];
    });

    if (nextSelectedId) {
      setSelectedChatId(nextSelectedId);
    }
    setActiveTab('all');
    lastOpenedOwnerRef.current = ownerName;
  }, [openOwnerName]);

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    const socket = io({
      path: '/socket.io',
      query: { userId: currentUserId },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('presence:ping', currentUserId);
    });

    socket.on('message:new', (payload: ApiMessage) => {
      upsertRealtimeMessage(payload);
    });

    socket.on('message:seen', (payload: MessageSeenEvent) => {
      handleRealtimeSeen(payload);
    });

    socket.on('presence:online-users', (onlineUserIds: string[]) => {
      const onlineSet = new Set(onlineUserIds);

      setChats((prev) =>
        prev.map((chat) => ({
          ...chat,
          online: onlineSet.has(chat.userId),
        })),
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUserId, handleRealtimeSeen, upsertRealtimeMessage]);

  useEffect(() => {
    if (!selectedChat?.userId) {
      return;
    }

    setChatError(null);
    void loadChatMessages(selectedChat.userId);
  }, [loadChatMessages, selectedChat?.userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [selectedChat?.messages.length]);

  useEffect(() => {
    return () => {
      if (quickReplyHighlightTimerRef.current) {
        window.clearTimeout(quickReplyHighlightTimerRef.current);
      }
      if (quickReplyCooldownTimerRef.current) {
        window.clearTimeout(quickReplyCooldownTimerRef.current);
      }
    };
  }, []);

  const sendMessage = async (rawText?: string) => {
    const text = (rawText ?? newMessage).trim();
    if (!text || !selectedChat || isSending) return;

    const chatId = selectedChat.id;
    const receiverId = selectedChat.userId;
    const tempId = `temp-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const optimisticMessage: Message = {
      id: tempId,
      text,
      sender: 'me',
      time: formatMessageTime(nowIso),
      createdAt: nowIso,
      status: 'sent'
    };

    setChats((prev) =>
      sortChatsByActivity(
        prev.map((chat) => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: [...chat.messages, optimisticMessage],
              lastMessage: text,
              time: optimisticMessage.time,
              lastMessageAt: nowIso,
            };
          }
          return chat;
        }),
      ),
    );

    setNewMessage("");
    setIsSending(true);
    setChatError(null);

    try {
      if (!currentUserId || receiverId.startsWith('local-')) {
        setChats((prev) =>
          prev.map((chat) => {
            if (chat.id !== chatId) {
              return chat;
            }

            return {
              ...chat,
              messages: chat.messages.map((message) =>
                message.id === tempId ? { ...message, status: 'read' } : message,
              ),
            };
          }),
        );
        return;
      }

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId, text }),
      });

      const payload = (await response.json()) as {
        success: boolean;
        error?: string;
        message?: ApiMessage;
      };

      if (!response.ok || !payload.success || !payload.message) {
        throw new Error(payload.error || 'Unable to send message');
      }

      const savedMessage: Message = {
        id: payload.message.id,
        text: payload.message.text,
        sender: 'me',
        time: formatMessageTime(payload.message.createdAt),
        createdAt: payload.message.createdAt,
        status: payload.message.seen ? 'read' : 'delivered',
      };

      setChats((prev) =>
        sortChatsByActivity(
          prev.map((chat) => {
            if (chat.id !== chatId) {
              return chat;
            }

            return {
              ...chat,
              messages: chat.messages.map((message) => (message.id === tempId ? savedMessage : message)),
              lastMessage: savedMessage.text,
              time: savedMessage.time,
              lastMessageAt: savedMessage.createdAt,
            };
          }),
        ),
      );
    } catch (error) {
      setChats((prev) => prev.map((chat) => {
        if (chat.id !== chatId) {
          return chat;
        }

        return {
          ...chat,
          messages: chat.messages.filter((message) => message.id !== tempId),
        };
      }));

      setNewMessage(text);
      setChatError(error instanceof Error ? error.message : 'Unable to send message');
    } finally {
      setIsSending(false);
    }
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

  const closeActionMenu = useCallback(() => {
    setShowActionMenu(false);
  }, []);

  const handleBackClick = useCallback(() => {
    if (!standalone) {
      setSelectedChatId(null);
      return;
    }

    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(safeBackTo);
  }, [router, safeBackTo, standalone]);

  const handleGoToRentals = useCallback(() => {
    closeActionMenu();
    router.push('/my-rentals');
  }, [closeActionMenu, router]);

  const handleGoToListings = useCallback(() => {
    closeActionMenu();
    router.push('/my-listings');
  }, [closeActionMenu, router]);

  const handleViewItem = useCallback(() => {
    closeActionMenu();
    if (!canViewItem) {
      return;
    }

    const targetTab = originTab === 'my_listings' ? 'my_listings' : 'my_rentals';
    router.push(`/?tab=rentals&rentalsTab=${targetTab}&search=${encodeURIComponent(activeContextItem)}`);
  }, [activeContextItem, canViewItem, closeActionMenu, originTab, router]);

  useEffect(() => {
    if (!showActionMenu) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setShowActionMenu(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showActionMenu]);

  useEffect(() => {
    setShowActionMenu(false);
  }, [selectedChatId]);

  return (
    <div className="flex h-full w-full bg-white max-w-6xl mx-auto overflow-hidden relative min-w-0">
      {/* Left Sidebar (Chat List) */}
      <div className={`md:w-[35%] lg:w-[30%] md:min-w-[320px] min-w-0 bg-[#f8fafe] border-r border-slate-200 flex flex-col ${selectedChatId ? 'hidden md:flex' : 'flex w-full md:w-[35%]'}`}>
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

          {chatError && !selectedChatId && (
            <div className="mx-4 mb-3 rounded-xl bg-rose-50 border border-rose-100 px-3 py-2 text-xs font-semibold text-rose-700">
              {chatError}
            </div>
          )}
          
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
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 md:w-4 md:h-4 border-2 border-white rounded-full ${chat.online ? 'bg-green-500' : 'bg-slate-300'}`}></div>
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
      <div className={`flex-1 bg-white flex flex-col min-w-0 ${!selectedChatId ? 'hidden md:flex items-center justify-center bg-slate-50/50' : 'flex h-full'}`}>
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
           <div className="flex flex-col h-full bg-white overflow-hidden animate-in slide-in-from-right-2 duration-300 min-h-0">
             {/* Dynamic Chat Header */}
             <header className="bg-white px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b border-slate-100 sticky top-0 z-10 shadow-sm">
               <div className="flex items-center gap-3 md:gap-4 min-w-0">
                 <button
                   onClick={handleBackClick}
                   className={`${standalone ? 'inline-flex' : 'inline-flex md:hidden'} p-1.5 -ml-1.5 text-slate-400 hover:text-brand transition-colors`}
                   aria-label="Back"
                 >
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
                   <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${selectedChat?.online ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                 </div>
                 <div className="min-w-0">
                   {standalone && (
                     <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate mb-1">
                       Home &gt; {labelFromOrigin(originTab)} &gt; Chat
                     </p>
                   )}
                   <h1 className="text-sm md:text-lg font-black text-slate-800 leading-none mb-1 truncate">{selectedChat?.name}</h1>
                   <p className="text-[10px] md:text-[11px] text-slate-500 font-semibold truncate">
                     {activeContextPrice ? `${activeContextItem} • ₹ ${activeContextPrice}/day` : activeContextItem}
                   </p>
                   <div className="flex items-center gap-1.5">
                     <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Chat about this item</span>
                     <span className={`w-1 h-1 rounded-full shrink-0 ${selectedChat?.online ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                     <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-tighter ${selectedChat?.online ? 'text-green-500' : 'text-slate-400'}`}>{selectedChat?.online ? 'Online' : 'Offline'}</span>
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
                 <div className="relative" ref={menuRef}>
                   <button
                     onClick={() => setShowActionMenu((prev) => !prev)}
                     className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                     aria-label="Open chat actions"
                   >
                     <MoreVertical size={20} />
                   </button>
                   {showActionMenu && (
                     <div className="absolute right-0 top-10 w-44 rounded-xl border border-slate-200 bg-white shadow-lg py-1 z-20">
                       <button
                         onClick={handleViewItem}
                         disabled={!canViewItem}
                         className={`w-full px-3 py-2 text-left text-sm ${canViewItem ? 'text-slate-700 hover:bg-slate-50' : 'text-slate-300 cursor-not-allowed'}`}
                       >
                         View Item
                       </button>
                       <button
                         onClick={handleGoToRentals}
                         className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                       >
                         Go to My Rentals
                       </button>
                       <button
                         onClick={handleGoToListings}
                         className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                       >
                         Go to My Listings
                       </button>
                     </div>
                   )}
                 </div>
               </div>
             </header>

             {/* Dynamic Content Area */}
             <div className="flex-1 min-h-0 overflow-y-auto flex flex-col hide-scrollbar bg-slate-50/10">
               
               {/* Suggestion Bar */}
               {selectedChat?.messages.length === 0 && (
                 <div className="flex gap-2 px-4 md:px-6 py-3 md:py-4 overflow-x-auto hide-scrollbar bg-white border-b border-slate-50 select-none">
                    <button
                      onClick={() => {
                        if (quickReplyCoolingDown || isSending) return;
                        setActiveQuickReply('available');
                        setQuickReplyCoolingDown(true);
                        if (quickReplyHighlightTimerRef.current) {
                          window.clearTimeout(quickReplyHighlightTimerRef.current);
                        }
                        if (quickReplyCooldownTimerRef.current) {
                          window.clearTimeout(quickReplyCooldownTimerRef.current);
                        }
                        quickReplyHighlightTimerRef.current = window.setTimeout(() => setActiveQuickReply(null), 650);
                        quickReplyCooldownTimerRef.current = window.setTimeout(() => setQuickReplyCoolingDown(false), 1200);
                        void sendMessage(QUICK_REPLY_MESSAGES.available);
                      }}
                      disabled={quickReplyCoolingDown || isSending}
                      className={`flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2.5 rounded-full text-[10px] md:text-[11px] font-black shadow-sm border transition-all whitespace-nowrap active:scale-95 ${activeQuickReply === 'available' ? 'bg-brand text-white border-brand' : 'bg-white border-slate-200 hover:border-brand/40'} ${quickReplyCoolingDown || isSending ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <CheckCircle2 size={12} className={activeQuickReply === 'available' ? 'text-white' : 'text-brand'} />
                      YES, AVAILABLE
                    </button>
                    <button
                      onClick={() => {
                        if (quickReplyCoolingDown || isSending) return;
                        setActiveQuickReply('reduce_price');
                        setQuickReplyCoolingDown(true);
                        if (quickReplyHighlightTimerRef.current) {
                          window.clearTimeout(quickReplyHighlightTimerRef.current);
                        }
                        if (quickReplyCooldownTimerRef.current) {
                          window.clearTimeout(quickReplyCooldownTimerRef.current);
                        }
                        quickReplyHighlightTimerRef.current = window.setTimeout(() => setActiveQuickReply(null), 650);
                        quickReplyCooldownTimerRef.current = window.setTimeout(() => setQuickReplyCoolingDown(false), 1200);
                        void sendMessage(QUICK_REPLY_MESSAGES.reduce_price);
                      }}
                      disabled={quickReplyCoolingDown || isSending}
                      className={`flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2.5 rounded-full text-[10px] md:text-[11px] font-black shadow-sm border transition-all whitespace-nowrap active:scale-95 ${activeQuickReply === 'reduce_price' ? 'bg-brand text-white border-brand' : 'bg-white border-slate-200 hover:border-brand/40'} ${quickReplyCoolingDown || isSending ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <Tag size={12} className={activeQuickReply === 'reduce_price' ? 'text-white' : 'text-amber-500'} />
                      REDUCE PRICE?
                    </button>
                    <button
                      onClick={() => {
                        if (quickReplyCoolingDown || isSending) return;
                        setActiveQuickReply('where_meet');
                        setQuickReplyCoolingDown(true);
                        if (quickReplyHighlightTimerRef.current) {
                          window.clearTimeout(quickReplyHighlightTimerRef.current);
                        }
                        if (quickReplyCooldownTimerRef.current) {
                          window.clearTimeout(quickReplyCooldownTimerRef.current);
                        }
                        quickReplyHighlightTimerRef.current = window.setTimeout(() => setActiveQuickReply(null), 650);
                        quickReplyCooldownTimerRef.current = window.setTimeout(() => setQuickReplyCoolingDown(false), 1200);
                        void sendMessage(QUICK_REPLY_MESSAGES.where_meet);
                      }}
                      disabled={quickReplyCoolingDown || isSending}
                      className={`flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2.5 rounded-full text-[10px] md:text-[11px] font-black shadow-sm border transition-all whitespace-nowrap active:scale-95 ${activeQuickReply === 'where_meet' ? 'bg-brand text-white border-brand' : 'bg-white border-slate-200 hover:border-brand/40'} ${quickReplyCoolingDown || isSending ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <MapPin size={12} className={activeQuickReply === 'where_meet' ? 'text-white' : 'text-teal-500'} />
                      WHERE TO MEET?
                    </button>
                 </div>
               )}

               {chatError && (
                 <div className="mx-4 md:mx-6 mt-3 rounded-xl bg-rose-50 border border-rose-100 px-3 py-2 text-xs font-semibold text-rose-700">
                   {chatError}
                 </div>
               )}

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
                  <div ref={messagesEndRef} />
               </div>
             </div>

             {/* Footer Input Area */}
             <footer className="p-4 md:p-6 pt-2 pb-4 md:pb-8 bg-white border-t border-slate-50 sticky bottom-0 z-20">
                <div className="flex items-center gap-3 max-w-4xl mx-auto">
                  <div className="flex-1 flex items-center bg-slate-50 border border-slate-200/50 rounded-2xl md:rounded-[2rem] px-2 md:px-3 focus-within:ring-4 ring-brand/5 transition-all shadow-inner relative group">
                    <button className="p-2 md:p-3 text-slate-400 hover:text-brand transition-colors">
                      <Paperclip size={20} strokeWidth={2.5} />
                    </button>
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          void sendMessage();
                        }
                      }}
                      placeholder="Type a message..." 
                      className="flex-1 bg-transparent border-none outline-none text-xs md:text-[15px] text-slate-800 py-3 md:py-4 px-1 font-bold placeholder:text-slate-400"
                    />
                  </div>
                  <button 
                    onClick={() => void sendMessage()}
                    disabled={!newMessage.trim() || isSending}
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
