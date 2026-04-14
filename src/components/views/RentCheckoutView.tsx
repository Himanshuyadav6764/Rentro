"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronLeft, Loader2, MapPin, Shield } from "lucide-react";
import { fetchListingById, type ListingData } from "@/lib/listingData";

type RentCheckoutViewProps = {
  itemId?: string | null;
};

function formatCurrency(value: number) {
  return `\u20b9 ${value.toLocaleString("en-IN")}`;
}

export default function RentCheckoutView({ itemId }: RentCheckoutViewProps) {
  const router = useRouter();
  const [item, setItem] = React.useState<ListingData | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [durationDays, setDurationDays] = React.useState(3);

  React.useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      if (!itemId) {
        setError("Item id missing in checkout URL.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const listing = await fetchListingById(itemId);
        if (!listing) {
          if (!cancelled) {
            setError("Listing not found.");
            setItem(null);
          }
          return;
        }

        if (!cancelled) {
          setItem(listing);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load listing details.");
          setItem(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [itemId]);

  const rentPerDay = item?.rent_price || 0;
  const deposit = item?.deposit || 0;
  const rentalAmount = rentPerDay * durationDays;
  const payableNow = rentalAmount + deposit;

  const handleConfirmRent = async () => {
    if (!item) {
      setError("Listing unavailable for checkout.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let requesterName = "You";

      const meRes = await fetch("/api/user/me", { cache: "no-store" });
      if (meRes.ok) {
        const mePayload = (await meRes.json()) as {
          success?: boolean;
          user?: { name?: string };
        };

        if (mePayload.success && mePayload.user?.name?.trim()) {
          requesterName = mePayload.user.name.trim();
        }
      }

      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemName: item.title,
          requesterName,
          days: durationDays,
          offeredAmount: rentalAmount,
          type: "outgoing",
          ownerId: item.owner_id,
        }),
      });

      const payload = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !payload.success) {
        setError(payload.error || "Unable to create rental request.");
        return;
      }

      router.push("/?tab=rentals&rentalsTab=requests");
    } catch {
      setError("Unable to create rental request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faff] px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => router.back()}
          className="mb-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          <ChevronLeft size={16} />
          Back
        </button>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
            <h1 className="text-2xl font-black text-slate-900">Rent Checkout</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">Review item details and confirm your request.</p>

            {loading ? (
              <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-slate-500">
                <Loader2 size={18} className="animate-spin" />
                Loading listing...
              </div>
            ) : error ? (
              <div className="mt-6 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>
            ) : item ? (
              <div className="mt-6 space-y-4">
                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                  <img
                    src={item.image_urls?.[0] || "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&q=80&w=1000"}
                    alt={item.title}
                    className="h-52 w-full object-cover"
                  />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">{item.category || "General"}</p>
                  <h2 className="mt-1 text-2xl font-black text-slate-900">{item.title}</h2>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">{item.description || "No description added."}</p>
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <MapPin size={16} className="text-brand" />
                  <span>{item.location_label || item.location_area || item.location_city || "Location unavailable"}</span>
                </div>
              </div>
            ) : null}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
            <h3 className="text-lg font-black text-slate-900">Booking Details</h3>

            <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">Duration</label>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDurationDays((prev) => Math.max(1, prev - 1))}
                  className="h-9 w-9 rounded-lg border border-slate-200 bg-white text-lg font-black text-slate-700"
                >
                  -
                </button>
                <div className="min-w-[140px] rounded-lg border border-slate-200 bg-white px-4 py-2 text-center text-sm font-black text-slate-800">
                  {durationDays} day{durationDays > 1 ? "s" : ""}
                </div>
                <button
                  type="button"
                  onClick={() => setDurationDays((prev) => Math.min(30, prev + 1))}
                  className="h-9 w-9 rounded-lg border border-slate-200 bg-white text-lg font-black text-slate-700"
                >
                  +
                </button>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
                <CalendarDays size={14} />
                Select between 1 and 30 days
              </div>
            </div>

            <div className="mt-5 space-y-3 rounded-2xl border border-slate-100 bg-white p-4">
              <CheckoutRow label="Rent per day" value={formatCurrency(rentPerDay)} />
              <CheckoutRow label="Duration" value={`${durationDays} day${durationDays > 1 ? "s" : ""}`} />
              <CheckoutRow label="Total rent" value={formatCurrency(rentalAmount)} />
              <CheckoutRow label="Security deposit" value={formatCurrency(deposit)} />
              <div className="mt-2 border-t border-slate-200 pt-3">
                <CheckoutRow label="Payable now" value={formatCurrency(payableNow)} highlight />
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
              <div className="flex items-center gap-2">
                <Shield size={16} />
                Status after confirm: Pending (request sent to owner)
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleConfirmRent()}
              disabled={loading || submitting || !item}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1b52d6] px-5 py-4 text-base font-black text-white shadow-lg shadow-[#1b52d6]/30 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
              {submitting ? "Creating Request..." : "Confirm Rent"}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

function CheckoutRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold text-slate-600">{label}</span>
      <span className={`text-sm font-black ${highlight ? "text-slate-900" : "text-slate-800"}`}>{value}</span>
    </div>
  );
}
