import React, { useMemo, useState } from 'react';
import { ChevronDown, Menu, MessageSquare } from 'lucide-react';

type ListingsStatus = 'active' | 'pending_return' | 'overdue';
type RentalsStatus = 'on_time' | 'returning_soon' | 'overdue';

type ListingItem = {
  id: string;
  itemName: string;
  rentedBy: string;
  duration: string;
  earnings: number;
  status: ListingsStatus;
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

const myListingsData: ListingItem[] = [
  {
    id: 'l1',
    itemName: 'Casio Calculator',
    rentedBy: 'Rohan S.',
    duration: 'Apr 15 - Apr 28',
    earnings: 240,
    status: 'pending_return',
  },
  {
    id: 'l2',
    itemName: 'Dell Laptop',
    rentedBy: 'Ankit Sharma',
    duration: 'Apr 05 - Apr 26',
    earnings: 2100,
    status: 'active',
  },
  {
    id: 'l3',
    itemName: 'Physics Notes',
    rentedBy: 'Sneha K.',
    duration: 'Apr 01 - Apr 10',
    earnings: 300,
    status: 'overdue',
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

const listingStatusStyles: Record<ListingsStatus, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  pending_return: 'bg-amber-100 text-amber-700',
  overdue: 'bg-rose-100 text-rose-700',
};

const listingStatusLabel: Record<ListingsStatus, string> = {
  active: 'Active',
  pending_return: 'Pending Return',
  overdue: 'Overdue',
};

const rentalStatusStyles: Record<RentalsStatus, string> = {
  on_time: 'bg-emerald-100 text-emerald-700',
  returning_soon: 'bg-amber-100 text-amber-700',
  overdue: 'bg-rose-100 text-rose-700',
};

const rentalStatusLabel: Record<RentalsStatus, string> = {
  on_time: 'On Time',
  returning_soon: 'Returning Soon',
  overdue: 'Overdue',
};

type RentalsTab = 'my_listings' | 'my_rentals' | 'requests' | 'history';

export default function RentalsView() {
  const [activeTab, setActiveTab] = useState<RentalsTab>('my_listings');

  const requestsCount = useMemo(() => 4, []);

  return (
    <div className="w-full bg-[#f8fafe] flex flex-col font-sans max-w-6xl mx-auto pb-24 h-full overflow-y-auto">
      
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
           <div className="bg-[#1b52d6] text-white p-1 rounded">
             <MessageSquare className="w-5 h-5 fill-current" />
           </div>
           <h2 className="text-xl font-bold text-[#1c2b4c]">My Rentals</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 border border-slate-200 rounded px-2 py-1 bg-white cursor-pointer hover:bg-slate-50">
            <span className="text-sm text-slate-600">Sort: Recent</span>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </div>
          <button className="text-slate-500 border border-slate-200 p-1.5 rounded bg-white hover:bg-slate-50">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-3 bg-white border-b border-slate-200 flex flex-wrap gap-6">
        <button
          onClick={() => setActiveTab('my_listings')}
          className={`pb-3 border-b-[3px] font-semibold text-[15px] ${
            activeTab === 'my_listings'
              ? 'border-[#1b52d6] text-[#1b52d6]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          My Listings
        </button>
        <button
          onClick={() => setActiveTab('my_rentals')}
          className={`pb-3 border-b-[3px] font-semibold text-[15px] ${
            activeTab === 'my_rentals'
              ? 'border-[#1b52d6] text-[#1b52d6]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          My Rentals
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 border-b-[3px] font-semibold text-[15px] flex items-center gap-1.5 ${
            activeTab === 'requests'
              ? 'border-[#1b52d6] text-[#1b52d6]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Requests
          <span className="bg-slate-400 text-white text-[11px] w-[18px] h-[18px] rounded-full flex justify-center items-center">
            {requestsCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 border-b-[3px] font-semibold text-[15px] ${
            activeTab === 'history'
              ? 'border-[#1b52d6] text-[#1b52d6]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          History
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'my_listings' && (
          <>
            <h3 className="text-[#1b52d6] font-bold text-[17px] mb-4">My Listings</h3>
            <div className="space-y-4">
              {myListingsData.map((item) => (
                <article key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h4 className="font-bold text-[#1c2b4c] text-[17px]">{item.itemName}</h4>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-sm ${listingStatusStyles[item.status]}`}>
                          {listingStatusLabel[item.status]}
                        </span>
                      </div>
                      <p className="text-[14px] text-slate-600">Rented by: {item.rentedBy}</p>
                      <p className="text-[14px] text-slate-600">Duration: {item.duration}</p>
                      <p className="text-[14px] font-semibold text-[#1c2b4c] mt-1">Earnings: ₹ {item.earnings.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 md:max-w-[320px] md:justify-end">
                      <button className="bg-[#1b52d6] text-white px-3 py-1.5 rounded font-medium text-[13px] hover:bg-[#103387]">Extend</button>
                      <button className="bg-[#2563eb] text-white px-3 py-1.5 rounded font-medium text-[13px] hover:bg-[#1d4ed8]">Message</button>
                      <button className="bg-[#16a34a] text-white px-3 py-1.5 rounded font-medium text-[13px] hover:bg-[#15803d]">Mark as Returned</button>
                      <button className="bg-[#ef4444] text-white px-3 py-1.5 rounded font-medium text-[13px] hover:bg-[#dc2626]">Report Issue</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {activeTab === 'my_rentals' && (
          <>
            <h3 className="text-[#1b52d6] font-bold text-[17px] mb-4">My Rentals</h3>
            <div className="space-y-4">
              {myRentalsData.map((item) => (
                <article key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h4 className="font-bold text-[#1c2b4c] text-[17px]">{item.itemName}</h4>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-sm ${rentalStatusStyles[item.status]}`}>
                          {rentalStatusLabel[item.status]}
                        </span>
                      </div>
                      <p className="text-[14px] text-slate-600">Owner: {item.ownerName}</p>
                      <p className="text-[14px] text-slate-600">Price/day: ₹ {item.pricePerDay}</p>
                      <p className="text-[14px] text-slate-600">Total Paid: ₹ {item.totalPaid.toLocaleString('en-IN')}</p>
                      <p className="text-[14px] font-semibold text-[#1c2b4c] mt-1">Return Date: {item.returnDate}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 md:max-w-[320px] md:justify-end">
                      <button className="bg-[#1b52d6] text-white px-3 py-1.5 rounded font-medium text-[13px] hover:bg-[#103387]">Extend</button>
                      <button className="bg-[#2563eb] text-white px-3 py-1.5 rounded font-medium text-[13px] hover:bg-[#1d4ed8]">Message Owner</button>
                      <button className="bg-[#16a34a] text-white px-3 py-1.5 rounded font-medium text-[13px] hover:bg-[#15803d]">Return Now</button>
                      <button className="bg-[#ef4444] text-white px-3 py-1.5 rounded font-medium text-[13px] hover:bg-[#dc2626]">Raise Issue</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {activeTab === 'requests' && (
          <div className="rounded-xl bg-white border border-slate-200 p-8 text-center text-slate-600">
            <p className="text-lg font-semibold text-[#1c2b4c]">Requests</p>
            <p className="mt-1">Incoming and outgoing rental requests will appear here.</p>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="rounded-xl bg-white border border-slate-200 p-8 text-center text-slate-600">
            <p className="text-lg font-semibold text-[#1c2b4c]">History</p>
            <p className="mt-1">Completed rentals and listing history will appear here.</p>
          </div>
        )}

      </div>
    </div>
  );
}
