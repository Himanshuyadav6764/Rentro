import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, Menu, MessageSquare } from 'lucide-react';
import type { ListingSubmissionSummary } from '@/components/PricingAvailabilityStep';

type ListingsStatus = 'pending' | 'active' | 'completed' | 'cancelled' | 'pending_return' | 'overdue';
type RentalsStatus = 'on_time' | 'returning_soon' | 'overdue' | 'completed';
type ActionPanel = 'extend' | 'return' | 'issue';
type IssueType = 'damage' | 'fraud' | 'late_return' | 'other';
type Severity = 'low' | 'medium' | 'high';
type SortBy = 'recent' | 'earnings_desc' | 'earnings_asc' | 'name';
type FilterMode = 'all' | 'pending' | 'active' | 'overdue' | 'completed';

type ListingItem = {
  id: string;
  itemName: string;
  rentedBy: string;
  duration: string;
  earnings: number;
  status: ListingsStatus;
  category?: string;
  rentPrice?: number;
  deposit?: number;
  availabilityDays?: string[];
  source: 'seeded' | 'live';
};

type RentalItem = {
  id: string;
  itemName: string;
  ownerName: string;
  pricePerDay: number;
  totalPaid: number;
  returnDate: string;
  status: RentalsStatus;
};

type Reminder = {
  listingId: string;
  level: 'alert' | 'warning';
  message: string;
};

type RequestItem = {
  id: string;
  itemName: string;
  requesterName: string;
  days: number;
  offeredAmount: number;
  type: 'incoming' | 'outgoing';
};

type HistoryItem = {
  id: string;
  itemName: string;
  counterpart: string;
  amount: number;
  completedOn: string;
  role: 'owner' | 'renter';
};

type RentalsViewProps = {
  createdListings?: ListingSubmissionSummary[];
  onOpenOwnerChat?: (ownerName: string) => void;
  searchQuery?: string;
};

const EMPTY_CREATED_LISTINGS: ListingSubmissionSummary[] = [];

type IssueDraft = {
  issueType: IssueType;
  severity: Severity;
  description: string;
};

const seededListingsData: ListingItem[] = [
  {
    id: 'l1',
    itemName: 'Casio Calculator',
    rentedBy: 'Rohan S.',
    duration: 'Apr 15 - Apr 28',
    earnings: 240,
    status: 'pending_return',
    source: 'seeded',
  },
  {
    id: 'l2',
    itemName: 'Dell Laptop',
    rentedBy: 'Ankit Sharma',
    duration: 'Apr 05 - Apr 26',
    earnings: 2100,
    status: 'active',
    source: 'seeded',
  },
  {
    id: 'l3',
    itemName: 'Physics Notes',
    rentedBy: 'Sneha K.',
    duration: 'Apr 01 - Apr 10',
    earnings: 300,
    status: 'overdue',
    source: 'seeded',
  },
];

const myRentalsData: RentalItem[] = [
  {
    id: 'r1',
    itemName: 'Engineering Books',
    ownerName: 'Priya Verma',
    pricePerDay: 20,
    totalPaid: 300,
    returnDate: 'Apr 25',
    status: 'on_time',
  },
  {
    id: 'r2',
    itemName: 'Laptop Stand',
    ownerName: 'Mohit Jain',
    pricePerDay: 15,
    totalPaid: 120,
    returnDate: 'Apr 18',
    status: 'returning_soon',
  },
  {
    id: 'r3',
    itemName: 'Audio Speaker',
    ownerName: 'Kunal P.',
    pricePerDay: 35,
    totalPaid: 350,
    returnDate: 'Apr 12',
    status: 'overdue',
  },
];

const seededRequestsData: RequestItem[] = [
  {
    id: 'rq1',
    itemName: 'Dell Laptop',
    requesterName: 'Arjun Patel',
    days: 4,
    offeredAmount: 1600,
    type: 'incoming',
  },
  {
    id: 'rq2',
    itemName: 'Engineering Books',
    requesterName: 'You',
    days: 7,
    offeredAmount: 300,
    type: 'outgoing',
  },
  {
    id: 'rq3',
    itemName: 'Casio Calculator',
    requesterName: 'Nikita S.',
    days: 5,
    offeredAmount: 250,
    type: 'incoming',
  },
  {
    id: 'rq4',
    itemName: 'Audio Speaker',
    requesterName: 'Rahul M.',
    days: 2,
    offeredAmount: 180,
    type: 'incoming',
  },
];

const seededHistoryData: HistoryItem[] = [
  {
    id: 'h1',
    itemName: 'Maths Notes',
    counterpart: 'Sonal Jain',
    amount: 180,
    completedOn: 'Apr 02, 2026',
    role: 'owner',
  },
  {
    id: 'h2',
    itemName: 'Tripod Stand',
    counterpart: 'Karan V.',
    amount: 220,
    completedOn: 'Mar 28, 2026',
    role: 'renter',
  },
];

function isObjectId(value: string) {
  return /^[a-fA-F0-9]{24}$/.test(value);
}

function formatHistoryDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

const listingStatusStyles: Record<ListingsStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  active: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-slate-200 text-slate-700',
  pending_return: 'bg-amber-100 text-amber-700',
  overdue: 'bg-rose-100 text-rose-700',
};

const listingStatusLabel: Record<ListingsStatus, string> = {
  pending: 'Pending',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
  pending_return: 'Pending Return',
  overdue: 'Overdue',
};

const rentalStatusStyles: Record<RentalsStatus, string> = {
  on_time: 'bg-emerald-100 text-emerald-700',
  returning_soon: 'bg-amber-100 text-amber-700',
  overdue: 'bg-rose-100 text-rose-700',
  completed: 'bg-blue-100 text-blue-700',
};

const rentalStatusLabel: Record<RentalsStatus, string> = {
  on_time: 'On Time',
  returning_soon: 'Returning Soon',
  overdue: 'Overdue',
  completed: 'Completed',
};

type RentalsTab = 'my_listings' | 'my_rentals' | 'requests' | 'history';

function isDbId(id: string) {
  return /^[a-fA-F0-9]{24}$/.test(id);
}

function formatDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return `${startDate} - ${endDate}`;
  }

  const startFormatted = start.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  const endFormatted = end.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  return `${startFormatted} - ${endFormatted}`;
}

function defaultIssueDraft(): IssueDraft {
  return {
    issueType: 'damage',
    severity: 'medium',
    description: '',
  };
}

function getListingChatTargetName(listing: ListingItem) {
  const renter = listing.rentedBy.trim();
  if (!renter || renter.toLowerCase() === 'awaiting requests') {
    return `${listing.itemName} Chat`;
  }
  return renter;
}

export default function RentalsView({ createdListings, onOpenOwnerChat, searchQuery = '' }: RentalsViewProps) {
  const stableCreatedListings = createdListings ?? EMPTY_CREATED_LISTINGS;
  const [activeTab, setActiveTab] = useState<RentalsTab>('my_listings');
  const [listings, setListings] = useState<ListingItem[]>(seededListingsData);
  const [myRentals, setMyRentals] = useState<RentalItem[]>(myRentalsData);
  const [requests, setRequests] = useState<RequestItem[]>(seededRequestsData);
  const [historyRecords, setHistoryRecords] = useState<HistoryItem[]>(seededHistoryData);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const [openListingPanel, setOpenListingPanel] = useState<Record<string, ActionPanel | undefined>>({});
  const [openRentalPanel, setOpenRentalPanel] = useState<Record<string, ActionPanel | undefined>>({});
  const [extendDaysById, setExtendDaysById] = useState<Record<string, string>>({});
  const [issueDraftById, setIssueDraftById] = useState<Record<string, IssueDraft>>({});

  const requestsCount = requests.length;

  const createdListingCards = useMemo<ListingItem[]>(() => {
    return stableCreatedListings.map((listing, index) => ({
      id: listing.itemId || `created-${index}-${listing.title}`,
      itemName: listing.title,
      rentedBy: 'Awaiting requests',
      duration: formatDateRange(listing.start_date, listing.end_date),
      earnings: listing.rent_price * Math.max(listing.duration, 1),
      status: 'pending',
      category: listing.category,
      rentPrice: listing.rent_price,
      deposit: listing.deposit,
      availabilityDays: listing.availability_days,
      source: 'live',
    }));
  }, [stableCreatedListings]);

  const refreshListings = useCallback(async () => {
    setIsLoadingListings(true);
    try {
      const [listingsRes, remindersRes] = await Promise.all([
        fetch('/api/listings'),
        fetch('/api/listings/reminders'),
      ]);

      const nextListings: ListingItem[] = [];

      if (listingsRes.ok) {
        const listingsPayload = (await listingsRes.json()) as {
          listings?: Array<{
            id: string;
            title: string;
            renter_name?: string;
            start_date: string;
            end_date: string;
            earnings: number;
            status: ListingsStatus;
            category?: string;
            rent_price?: number;
            deposit?: number;
            availability_days?: string[];
          }>;
        };

        (listingsPayload.listings || []).forEach((listing) => {
          nextListings.push({
            id: listing.id,
            itemName: listing.title,
            rentedBy: listing.renter_name || 'Awaiting requests',
            duration: formatDateRange(listing.start_date, listing.end_date),
            earnings: listing.earnings,
            status: listing.status || 'pending',
            category: listing.category,
            rentPrice: listing.rent_price,
            deposit: listing.deposit,
            availabilityDays: listing.availability_days || [],
            source: 'live',
          });
        });
      }

      if (remindersRes.ok) {
        const remindersPayload = (await remindersRes.json()) as { reminders?: Reminder[] };
        setReminders(remindersPayload.reminders || []);
      }

      const merged = [...nextListings, ...createdListingCards, ...seededListingsData];
      const unique = new Map<string, ListingItem>();
      merged.forEach((item) => {
        if (!unique.has(item.id)) {
          unique.set(item.id, item);
        }
      });
      setListings(Array.from(unique.values()));
    } catch {
      const merged = [...createdListingCards, ...seededListingsData];
      const unique = new Map<string, ListingItem>();
      merged.forEach((item) => {
        if (!unique.has(item.id)) {
          unique.set(item.id, item);
        }
      });
      setListings(Array.from(unique.values()));
    } finally {
      setIsLoadingListings(false);
    }
  }, [createdListingCards]);

  const refreshRequestsAndHistory = useCallback(async () => {
    try {
      const [requestsRes, historyRes] = await Promise.all([
        fetch('/api/requests'),
        fetch('/api/history'),
      ]);

      if (requestsRes.ok) {
        const requestsPayload = (await requestsRes.json()) as { requests?: RequestItem[] };
        setRequests(requestsPayload.requests || []);
      }

      if (historyRes.ok) {
        const historyPayload = (await historyRes.json()) as {
          history?: Array<{
            id: string;
            itemName: string;
            counterpart: string;
            amount: number;
            completedOn: string;
            role: 'owner' | 'renter';
          }>;
        };

        setHistoryRecords(
          (historyPayload.history || []).map((record) => ({
            ...record,
            completedOn: formatHistoryDate(record.completedOn),
          }))
        );
      }
    } catch {
      setRequests(seededRequestsData);
      setHistoryRecords(seededHistoryData);
    }
  }, []);

  useEffect(() => {
    void refreshListings();
  }, [refreshListings]);

  useEffect(() => {
    void refreshRequestsAndHistory();
  }, [refreshRequestsAndHistory]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredListings = useMemo(() => {
    const base = listings.filter((item) => {
      const searchHit =
        !normalizedSearch ||
        item.itemName.toLowerCase().includes(normalizedSearch) ||
        item.rentedBy.toLowerCase().includes(normalizedSearch) ||
        (item.category || '').toLowerCase().includes(normalizedSearch);

      const statusHit =
        filterMode === 'all' ||
        (filterMode === 'pending' && item.status === 'pending') ||
        (filterMode === 'active' && (item.status === 'active' || item.status === 'pending_return')) ||
        (filterMode === 'overdue' && item.status === 'overdue') ||
        (filterMode === 'completed' && item.status === 'completed');

      return searchHit && statusHit;
    });

    const sorted = [...base];
    if (sortBy === 'earnings_desc') sorted.sort((a, b) => b.earnings - a.earnings);
    if (sortBy === 'earnings_asc') sorted.sort((a, b) => a.earnings - b.earnings);
    if (sortBy === 'name') sorted.sort((a, b) => a.itemName.localeCompare(b.itemName));
    return sorted;
  }, [listings, normalizedSearch, filterMode, sortBy]);

  const filteredRentals = useMemo(() => {
    const base = myRentals.filter((item) => {
      const searchHit =
        !normalizedSearch ||
        item.itemName.toLowerCase().includes(normalizedSearch) ||
        item.ownerName.toLowerCase().includes(normalizedSearch);

      const statusHit =
        filterMode === 'all' ||
        (filterMode === 'pending' && item.status === 'returning_soon') ||
        (filterMode === 'active' && item.status === 'on_time') ||
        (filterMode === 'overdue' && item.status === 'overdue') ||
        (filterMode === 'completed' && item.status === 'completed');

      return searchHit && statusHit;
    });

    const sorted = [...base];
    if (sortBy === 'earnings_desc') sorted.sort((a, b) => b.totalPaid - a.totalPaid);
    if (sortBy === 'earnings_asc') sorted.sort((a, b) => a.totalPaid - b.totalPaid);
    if (sortBy === 'name') sorted.sort((a, b) => a.itemName.localeCompare(b.itemName));
    return sorted;
  }, [myRentals, normalizedSearch, filterMode, sortBy]);

  const filteredRequests = useMemo(() => {
    return requests.filter((item) => {
      if (!normalizedSearch) return true;
      return (
        item.itemName.toLowerCase().includes(normalizedSearch) ||
        item.requesterName.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [requests, normalizedSearch]);

  const filteredHistory = useMemo(() => {
    return historyRecords.filter((item) => {
      if (!normalizedSearch) return true;
      return (
        item.itemName.toLowerCase().includes(normalizedSearch) ||
        item.counterpart.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [historyRecords, normalizedSearch]);

  const updateListing = (id: string, updater: (current: ListingItem) => ListingItem) => {
    setListings((prev) => prev.map((item) => (item.id === id ? updater(item) : item)));
  };

  const updateIssueDraft = (id: string, patch: Partial<IssueDraft>) => {
    setIssueDraftById((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || defaultIssueDraft()),
        ...patch,
      },
    }));
  };

  const toggleListingPanel = (listing: ListingItem, panel: ActionPanel) => {
    setOpenListingPanel((prev) => ({
      ...prev,
      [listing.id]: prev[listing.id] === panel ? undefined : panel,
    }));
  };

  const toggleRentalPanel = (rentalId: string, panel: ActionPanel) => {
    setOpenRentalPanel((prev) => ({
      ...prev,
      [rentalId]: prev[rentalId] === panel ? undefined : panel,
    }));
  };

  const submitListingExtend = async (listing: ListingItem) => {
    const extraDays = Number(extendDaysById[listing.id] || 0);
    if (!extraDays || extraDays < 1) {
      setToast('Enter valid extra days.');
      return;
    }

    if (isDbId(listing.id)) {
      const response = await fetch(`/api/listings/${listing.id}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extraDays }),
      });

      const payload = (await response.json()) as {
        error?: string;
        listing?: { start_date: string; end_date: string; earnings: number; deposit: number; status: ListingsStatus };
        aiRecommendation?: { note?: string };
      };

      if (!response.ok) {
        setToast(payload.error || 'Extension failed');
        return;
      }

      updateListing(listing.id, (current) => ({
        ...current,
        duration: payload.listing?.end_date && payload.listing?.start_date
          ? formatDateRange(payload.listing.start_date, payload.listing.end_date)
          : current.duration,
        earnings: payload.listing?.earnings ?? current.earnings,
        deposit: payload.listing?.deposit ?? current.deposit,
        status: payload.listing?.status ?? current.status,
      }));

      setToast(payload.aiRecommendation?.note || 'Rental period extended.');
    } else {
      updateListing(listing.id, (current) => ({
        ...current,
        earnings: current.earnings + (current.rentPrice || 0) * extraDays,
        status: 'active',
      }));
      setToast('Rental period extended.');
    }

    setExtendDaysById((prev) => ({ ...prev, [listing.id]: '' }));
    setOpenListingPanel((prev) => ({ ...prev, [listing.id]: undefined }));
  };

  const submitListingReturn = async (listing: ListingItem) => {
    if (isDbId(listing.id)) {
      const response = await fetch(`/api/listings/${listing.id}/mark-returned`, { method: 'POST' });
      const payload = (await response.json()) as { error?: string; trustImpact?: { behaviorNote?: string } };

      if (!response.ok) {
        setToast(payload.error || 'Unable to mark return');
        return;
      }

      updateListing(listing.id, (current) => ({ ...current, status: 'completed' }));
      setToast(payload.trustImpact?.behaviorNote || 'Marked as returned.');
    } else {
      updateListing(listing.id, (current) => ({ ...current, status: 'completed' }));
      setToast('Marked as returned.');
    }

    setOpenListingPanel((prev) => ({ ...prev, [listing.id]: undefined }));
  };

  const submitListingIssue = async (listing: ListingItem) => {
    const issue = issueDraftById[listing.id] || defaultIssueDraft();
    if (issue.description.trim().length < 3) {
      setToast('Issue description is required.');
      return;
    }

    if (isDbId(listing.id)) {
      const response = await fetch(`/api/listings/${listing.id}/report-issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(issue),
      });

      const payload = (await response.json()) as { error?: string; listing?: { status: ListingsStatus } };

      if (!response.ok) {
        setToast(payload.error || 'Failed to report issue');
        return;
      }

      updateListing(listing.id, (current) => ({
        ...current,
        status: payload.listing?.status ?? (issue.issueType === 'fraud' ? 'cancelled' : current.status),
      }));
      setToast('Issue reported successfully.');
    } else {
      updateListing(listing.id, (current) => ({
        ...current,
        status: issue.issueType === 'fraud' ? 'cancelled' : current.status,
      }));
      setToast('Issue reported successfully.');
    }

    setIssueDraftById((prev) => ({ ...prev, [listing.id]: defaultIssueDraft() }));
    setOpenListingPanel((prev) => ({ ...prev, [listing.id]: undefined }));
  };

  const submitRentalExtend = (rental: RentalItem) => {
    const key = `rental-${rental.id}`;
    const extraDays = Number(extendDaysById[key] || 0);
    if (!extraDays || extraDays < 1) {
      setToast('Enter valid extra days.');
      return;
    }

    setMyRentals((prev) =>
      prev.map((item) =>
        item.id === rental.id
          ? {
              ...item,
              totalPaid: item.totalPaid + item.pricePerDay * extraDays,
              status: 'returning_soon',
            }
          : item
      )
    );

    setToast('Rental extended and total paid updated.');
    setExtendDaysById((prev) => ({ ...prev, [key]: '' }));
    setOpenRentalPanel((prev) => ({ ...prev, [rental.id]: undefined }));
  };

  const submitRentalReturn = (rental: RentalItem) => {
    setMyRentals((prev) => prev.map((item) => (item.id === rental.id ? { ...item, status: 'completed' } : item)));
    setToast('Rental marked as completed.');
    setOpenRentalPanel((prev) => ({ ...prev, [rental.id]: undefined }));
  };

  const submitRentalIssue = (rental: RentalItem) => {
    const key = `rental-${rental.id}`;
    const issue = issueDraftById[key] || defaultIssueDraft();
    if (issue.description.trim().length < 3) {
      setToast('Issue description is required.');
      return;
    }

    setToast('Issue submitted for review.');
    setIssueDraftById((prev) => ({ ...prev, [key]: defaultIssueDraft() }));
    setOpenRentalPanel((prev) => ({ ...prev, [rental.id]: undefined }));
  };

  const acceptRequest = (request: RequestItem) => {
    const localAccept = () => {
      setRequests((prev) => prev.filter((item) => item.id !== request.id));
      setHistoryRecords((prev) => [
        {
          id: `history-${Date.now()}`,
          itemName: request.itemName,
          counterpart: request.requesterName,
          amount: request.offeredAmount,
          completedOn: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          role: request.type === 'incoming' ? 'owner' : 'renter',
        },
        ...prev,
      ]);
      setToast('Request accepted.');
    };

    if (!isObjectId(request.id)) {
      localAccept();
      return;
    }

    void (async () => {
      try {
        const response = await fetch(`/api/requests/${request.id}/accept`, { method: 'POST' });
        const payload = (await response.json()) as {
          success?: boolean;
          error?: string;
          history?: {
            id: string;
            itemName: string;
            counterpart: string;
            amount: number;
            completedOn: string;
            role: 'owner' | 'renter';
          };
        };

        if (!response.ok || !payload.history) {
          setToast(payload.error || 'Unable to accept request');
          return;
        }

        const history = payload.history;
        if (
          !history.id ||
          !history.itemName ||
          !history.counterpart ||
          typeof history.amount !== 'number' ||
          !history.completedOn ||
          (history.role !== 'owner' && history.role !== 'renter')
        ) {
          setToast('Unable to accept request');
          return;
        }

        const nextHistoryRecord: HistoryItem = {
          id: history.id,
          itemName: history.itemName,
          counterpart: history.counterpart,
          amount: history.amount,
          completedOn: formatHistoryDate(history.completedOn),
          role: history.role,
        };

        setRequests((prev) => prev.filter((item) => item.id !== request.id));
        setHistoryRecords((prev) => [
          nextHistoryRecord,
          ...prev,
        ]);
        setToast('Request accepted.');
      } catch {
        setToast('Unable to accept request');
      }
    })();
  };

  const declineRequest = (requestId: string) => {
    const localDecline = () => {
      setRequests((prev) => prev.filter((item) => item.id !== requestId));
      setToast('Request removed.');
    };

    if (!isObjectId(requestId)) {
      localDecline();
      return;
    }

    void (async () => {
      try {
        const response = await fetch(`/api/requests/${requestId}/decline`, { method: 'POST' });
        const payload = (await response.json()) as { success?: boolean; error?: string };
        if (!response.ok) {
          setToast(payload.error || 'Unable to decline request');
          return;
        }

        setRequests((prev) => prev.filter((item) => item.id !== requestId));
        setToast('Request removed.');
      } catch {
        setToast('Unable to decline request');
      }
    })();
  };

  return (
    <div className="w-full bg-[#f8fafe] flex flex-col font-sans max-w-6xl mx-auto pb-24 h-full overflow-y-auto hide-scrollbar">
      {toast && (
        <div className="sticky top-0 z-30 px-6 pt-4">
          <div className="rounded-lg bg-[#1c2b4c] px-4 py-2 text-sm text-white shadow-md">{toast}</div>
        </div>
      )}

      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="bg-[#1b52d6] text-white p-1 rounded">
            <MessageSquare className="w-5 h-5 fill-current" />
          </div>
          <h2 className="text-xl font-bold text-[#1c2b4c]">My Rentals</h2>
        </div>
        <div className="flex items-center gap-3 relative">
          <div className="flex items-center gap-1 border border-slate-200 rounded px-2 py-1 bg-white">
            <span className="text-sm text-slate-600">Sort:</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortBy)}
              className="text-sm text-slate-700 bg-transparent outline-none"
            >
              <option value="recent">Recent</option>
              <option value="earnings_desc">High to Low</option>
              <option value="earnings_asc">Low to High</option>
              <option value="name">Name</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </div>
          <button onClick={() => setShowFilterMenu((prev) => !prev)} className="text-slate-500 border border-slate-200 p-1.5 rounded bg-white hover:bg-slate-50">
            <Menu className="w-5 h-5" />
          </button>
          {showFilterMenu && (
            <div className="absolute right-0 top-12 z-20 rounded-lg border border-slate-200 bg-white p-2 shadow-md w-44">
              <p className="px-2 pb-1 text-xs font-semibold text-slate-500">Quick Filter</p>
              {(['all', 'pending', 'active', 'overdue', 'completed'] as FilterMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setFilterMode(mode);
                    setShowFilterMenu(false);
                  }}
                  className={`w-full rounded px-2 py-1.5 text-left text-sm ${filterMode === mode ? 'bg-blue-50 text-[#1b52d6]' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {mode === 'all' ? 'All' : mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-6 pt-3 bg-white border-b border-slate-200 flex flex-wrap gap-6">
        <button onClick={() => setActiveTab('my_listings')} className={`pb-3 border-b-[3px] font-semibold text-[15px] ${activeTab === 'my_listings' ? 'border-[#1b52d6] text-[#1b52d6]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>My Listings</button>
        <button onClick={() => setActiveTab('my_rentals')} className={`pb-3 border-b-[3px] font-semibold text-[15px] ${activeTab === 'my_rentals' ? 'border-[#1b52d6] text-[#1b52d6]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>My Rentals</button>
        <button onClick={() => setActiveTab('requests')} className={`pb-3 border-b-[3px] font-semibold text-[15px] flex items-center gap-1.5 ${activeTab === 'requests' ? 'border-[#1b52d6] text-[#1b52d6]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Requests <span className="bg-slate-400 text-white text-[11px] w-[18px] h-[18px] rounded-full flex justify-center items-center">{requestsCount}</span></button>
        <button onClick={() => setActiveTab('history')} className={`pb-3 border-b-[3px] font-semibold text-[15px] ${activeTab === 'history' ? 'border-[#1b52d6] text-[#1b52d6]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>History</button>
      </div>

      <div className="p-6">
        {activeTab === 'my_listings' && (
          <>
            <h3 className="text-[#1b52d6] font-bold text-[17px] mb-4">My Listings</h3>

            {reminders.length > 0 && (
              <div className="mb-4 space-y-2">
                {reminders.slice(0, 3).map((reminder) => (
                  <div key={`${reminder.listingId}-${reminder.message}`} className={`rounded-md px-3 py-2 text-sm ${reminder.level === 'alert' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                    {reminder.message}
                  </div>
                ))}
              </div>
            )}

            {isLoadingListings && <p className="text-sm text-slate-500 mb-3">Refreshing latest listings...</p>}

            <div className="space-y-4">
              {filteredListings.length === 0 && (
                <div className="rounded-xl bg-white border border-slate-200 p-6 text-sm text-slate-500">No listings match current search/filter.</div>
              )}
              {filteredListings.map((item) => (
                <article key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h4 className="font-bold text-[#1c2b4c] text-[17px]">{item.itemName}</h4>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-sm ${listingStatusStyles[item.status]}`}>{listingStatusLabel[item.status]}</span>
                      </div>
                      <p className="text-[14px] text-slate-600">Rented by: {item.rentedBy}</p>
                      <p className="text-[14px] text-slate-600">Duration: {item.duration}</p>
                      {item.category && <p className="text-[14px] text-slate-600">Category: {item.category}</p>}
                      {typeof item.rentPrice === 'number' && <p className="text-[14px] text-slate-600">Rent: ₹ {item.rentPrice}/day</p>}
                      {typeof item.deposit === 'number' && <p className="text-[14px] text-slate-600">Deposit: ₹ {item.deposit}</p>}
                      {item.availabilityDays && item.availabilityDays.length > 0 && <p className="text-[14px] text-slate-600">Availability: {item.availabilityDays.join(', ')}</p>}
                      <p className="text-[14px] font-semibold text-[#1c2b4c] mt-1">Earnings: ₹ {item.earnings.toLocaleString('en-IN')}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 md:max-w-[360px] md:justify-end">
                      <button onClick={() => toggleListingPanel(item, 'extend')} className="bg-[#1b52d6] text-white px-3 py-1.5 rounded font-medium text-[13px]">Extend</button>
                      <button onClick={() => onOpenOwnerChat?.(getListingChatTargetName(item))} className="bg-[#2563eb] text-white px-3 py-1.5 rounded font-medium text-[13px]">Message</button>
                      <button onClick={() => toggleListingPanel(item, 'return')} className="bg-[#16a34a] text-white px-3 py-1.5 rounded font-medium text-[13px]">Mark as Returned</button>
                      <button onClick={() => toggleListingPanel(item, 'issue')} className="bg-[#ef4444] text-white px-3 py-1.5 rounded font-medium text-[13px]">Report Issue</button>
                    </div>
                  </div>

                  {openListingPanel[item.id] === 'extend' && (
                    <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <p className="text-sm font-semibold text-[#1c2b4c] mb-2">Extend Rental</p>
                      <div className="flex gap-2">
                        <input type="number" min={1} value={extendDaysById[item.id] || ''} onChange={(event) => setExtendDaysById((prev) => ({ ...prev, [item.id]: event.target.value }))} placeholder="Extra days" className="w-40 rounded-md border border-slate-300 px-3 py-2 text-sm" />
                        <button onClick={() => void submitListingExtend(item)} className="rounded-md bg-[#1b52d6] px-3 py-2 text-sm font-semibold text-white">Apply</button>
                        <button onClick={() => setOpenListingPanel((prev) => ({ ...prev, [item.id]: undefined }))} className="rounded-md border border-slate-300 px-3 py-2 text-sm">Cancel</button>
                      </div>
                    </div>
                  )}

                  {openListingPanel[item.id] === 'return' && (
                    <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                      <p className="text-sm text-slate-700 mb-2">Confirm return for this listing?</p>
                      <div className="flex gap-2">
                        <button onClick={() => void submitListingReturn(item)} className="rounded-md bg-[#16a34a] px-3 py-2 text-sm font-semibold text-white">Confirm</button>
                        <button onClick={() => setOpenListingPanel((prev) => ({ ...prev, [item.id]: undefined }))} className="rounded-md border border-slate-300 px-3 py-2 text-sm">Cancel</button>
                      </div>
                    </div>
                  )}

                  {openListingPanel[item.id] === 'issue' && (
                    <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 space-y-2">
                      <p className="text-sm font-semibold text-[#1c2b4c]">Report Issue</p>
                      <div className="flex flex-wrap gap-2">
                        <select value={(issueDraftById[item.id] || defaultIssueDraft()).issueType} onChange={(event) => updateIssueDraft(item.id, { issueType: event.target.value as IssueType })} className="rounded-md border border-slate-300 px-2 py-2 text-sm">
                          <option value="damage">Damage</option>
                          <option value="fraud">Fraud</option>
                          <option value="late_return">Late Return</option>
                          <option value="other">Other</option>
                        </select>
                        <select value={(issueDraftById[item.id] || defaultIssueDraft()).severity} onChange={(event) => updateIssueDraft(item.id, { severity: event.target.value as Severity })} className="rounded-md border border-slate-300 px-2 py-2 text-sm">
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <textarea value={(issueDraftById[item.id] || defaultIssueDraft()).description} onChange={(event) => updateIssueDraft(item.id, { description: event.target.value })} rows={2} placeholder="Describe issue" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                      <div className="flex gap-2">
                        <button onClick={() => void submitListingIssue(item)} className="rounded-md bg-[#ef4444] px-3 py-2 text-sm font-semibold text-white">Submit</button>
                        <button onClick={() => setOpenListingPanel((prev) => ({ ...prev, [item.id]: undefined }))} className="rounded-md border border-slate-300 px-3 py-2 text-sm">Cancel</button>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </>
        )}

        {activeTab === 'my_rentals' && (
          <>
            <h3 className="text-[#1b52d6] font-bold text-[17px] mb-4">My Rentals</h3>
            <div className="space-y-4">
              {filteredRentals.length === 0 && (
                <div className="rounded-xl bg-white border border-slate-200 p-6 text-sm text-slate-500">No rentals match current search/filter.</div>
              )}
              {filteredRentals.map((item) => {
                const rentalKey = `rental-${item.id}`;
                return (
                  <article key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h4 className="font-bold text-[#1c2b4c] text-[17px]">{item.itemName}</h4>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-sm ${rentalStatusStyles[item.status]}`}>{rentalStatusLabel[item.status]}</span>
                        </div>
                        <p className="text-[14px] text-slate-600">Owner: {item.ownerName}</p>
                        <p className="text-[14px] text-slate-600">Price/day: ₹ {item.pricePerDay}</p>
                        <p className="text-[14px] text-slate-600">Total Paid: ₹ {item.totalPaid.toLocaleString('en-IN')}</p>
                        <p className="text-[14px] font-semibold text-[#1c2b4c] mt-1">Return Date: {item.returnDate}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 md:max-w-[360px] md:justify-end">
                        <button onClick={() => toggleRentalPanel(item.id, 'extend')} className="bg-[#1b52d6] text-white px-3 py-1.5 rounded font-medium text-[13px]">Extend</button>
                        <button onClick={() => onOpenOwnerChat?.(item.ownerName)} className="bg-[#2563eb] text-white px-3 py-1.5 rounded font-medium text-[13px]">Message Owner</button>
                        <button onClick={() => toggleRentalPanel(item.id, 'return')} className="bg-[#16a34a] text-white px-3 py-1.5 rounded font-medium text-[13px]">Return Now</button>
                        <button onClick={() => toggleRentalPanel(item.id, 'issue')} className="bg-[#ef4444] text-white px-3 py-1.5 rounded font-medium text-[13px]">Raise Issue</button>
                      </div>
                    </div>

                    {openRentalPanel[item.id] === 'extend' && (
                      <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                        <p className="text-sm font-semibold text-[#1c2b4c] mb-2">Extend Rental</p>
                        <div className="flex gap-2">
                          <input type="number" min={1} value={extendDaysById[rentalKey] || ''} onChange={(event) => setExtendDaysById((prev) => ({ ...prev, [rentalKey]: event.target.value }))} placeholder="Extra days" className="w-40 rounded-md border border-slate-300 px-3 py-2 text-sm" />
                          <button onClick={() => submitRentalExtend(item)} className="rounded-md bg-[#1b52d6] px-3 py-2 text-sm font-semibold text-white">Apply</button>
                          <button onClick={() => toggleRentalPanel(item.id, 'extend')} className="rounded-md border border-slate-300 px-3 py-2 text-sm">Cancel</button>
                        </div>
                      </div>
                    )}

                    {openRentalPanel[item.id] === 'return' && (
                      <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                        <p className="text-sm text-slate-700 mb-2">Confirm return for this rental?</p>
                        <div className="flex gap-2">
                          <button onClick={() => submitRentalReturn(item)} className="rounded-md bg-[#16a34a] px-3 py-2 text-sm font-semibold text-white">Confirm</button>
                          <button onClick={() => toggleRentalPanel(item.id, 'return')} className="rounded-md border border-slate-300 px-3 py-2 text-sm">Cancel</button>
                        </div>
                      </div>
                    )}

                    {openRentalPanel[item.id] === 'issue' && (
                      <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 space-y-2">
                        <p className="text-sm font-semibold text-[#1c2b4c]">Raise Issue</p>
                        <div className="flex flex-wrap gap-2">
                          <select value={(issueDraftById[rentalKey] || defaultIssueDraft()).issueType} onChange={(event) => updateIssueDraft(rentalKey, { issueType: event.target.value as IssueType })} className="rounded-md border border-slate-300 px-2 py-2 text-sm">
                            <option value="damage">Damage</option>
                            <option value="fraud">Fraud</option>
                            <option value="late_return">Late Return</option>
                            <option value="other">Other</option>
                          </select>
                          <select value={(issueDraftById[rentalKey] || defaultIssueDraft()).severity} onChange={(event) => updateIssueDraft(rentalKey, { severity: event.target.value as Severity })} className="rounded-md border border-slate-300 px-2 py-2 text-sm">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                        <textarea value={(issueDraftById[rentalKey] || defaultIssueDraft()).description} onChange={(event) => updateIssueDraft(rentalKey, { description: event.target.value })} rows={2} placeholder="Describe issue" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                        <div className="flex gap-2">
                          <button onClick={() => submitRentalIssue(item)} className="rounded-md bg-[#ef4444] px-3 py-2 text-sm font-semibold text-white">Submit</button>
                          <button onClick={() => toggleRentalPanel(item.id, 'issue')} className="rounded-md border border-slate-300 px-3 py-2 text-sm">Cancel</button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-3">
            {filteredRequests.length === 0 && (
              <div className="rounded-xl bg-white border border-slate-200 p-6 text-sm text-slate-500">No pending requests.</div>
            )}
            {filteredRequests.map((request) => (
              <article key={request.id} className="rounded-xl bg-white border border-slate-200 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h4 className="text-base font-bold text-[#1c2b4c]">{request.itemName}</h4>
                    <p className="text-sm text-slate-600">
                      {request.type === 'incoming' ? `Requester: ${request.requesterName}` : 'Request sent by you'}
                    </p>
                    <p className="text-sm text-slate-600">Duration: {request.days} days</p>
                    <p className="text-sm font-semibold text-[#1c2b4c]">Offer: ₹ {request.offeredAmount}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => onOpenOwnerChat?.(request.requesterName)} className="rounded-md bg-[#2563eb] px-3 py-1.5 text-sm font-semibold text-white">Chat</button>
                    <button onClick={() => acceptRequest(request)} className="rounded-md bg-[#16a34a] px-3 py-1.5 text-sm font-semibold text-white">Accept</button>
                    <button onClick={() => declineRequest(request.id)} className="rounded-md bg-[#ef4444] px-3 py-1.5 text-sm font-semibold text-white">Decline</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3">
            {filteredHistory.length === 0 && (
              <div className="rounded-xl bg-white border border-slate-200 p-6 text-sm text-slate-500">No history records found.</div>
            )}
            {filteredHistory.map((record) => (
              <article key={record.id} className="rounded-xl bg-white border border-slate-200 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h4 className="text-base font-bold text-[#1c2b4c]">{record.itemName}</h4>
                    <p className="text-sm text-slate-600">{record.role === 'owner' ? `Rented to: ${record.counterpart}` : `Owner: ${record.counterpart}`}</p>
                    <p className="text-sm text-slate-500">Completed on: {record.completedOn}</p>
                  </div>
                  <div className="text-sm font-semibold text-[#1c2b4c]">₹ {record.amount}</div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
