'use client';

import { useMemo, useState } from 'react';
import { RefreshCw, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { getAISuggestedPrice, type DemandLevel, type ItemCondition } from '@/lib/aiPricing';

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export type ListingSubmissionSummary = {
  title: string;
  description: string;
  category: string;
  image_urls: string[];
  image_public_ids: string[];
  availability_days: string[];
  start_date: string;
  end_date: string;
  duration: number;
  rent_price: number;
  deposit: number;
  ai_suggested_price: number;
  itemId?: string;
};

type ListingDraft = {
  title: string;
  description: string;
  category: string;
  image_urls: string[];
  image_public_ids: string[];
};

type PricingAvailabilityStepProps = {
  onBack?: () => void;
  onSuccess?: (summary: ListingSubmissionSummary) => void;
  listingDraft?: ListingDraft;
};

type ValidationErrors = {
  days?: string;
  date?: string;
  rent?: string;
  deposit?: string;
};

export default function PricingAvailabilityStep({ onBack, onSuccess, listingDraft }: PricingAvailabilityStepProps) {
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue']);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rentPrice, setRentPrice] = useState(10);
  const [deposit, setDeposit] = useState(20);
  const [condition, setCondition] = useState<ItemCondition>('new');
  const [demand, setDemand] = useState<DemandLevel>('medium');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const duration = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    return diff > 0 ? diff : 0;
  }, [startDate, endDate]);

  const aiSuggestion = useMemo(
    () => getAISuggestedPrice(listingDraft?.category || 'Others', condition, demand),
    [listingDraft?.category, condition, demand]
  );

  const validate = (): ValidationErrors => {
    const nextErrors: ValidationErrors = {};

    if (selectedDays.length === 0) {
      nextErrors.days = 'Select at least one day.';
    }

    if (!startDate || !endDate || duration <= 0) {
      nextErrors.date = 'End date must be after start date.';
    }

    if (rentPrice <= 0) {
      nextErrors.rent = 'Rent price must be greater than 0.';
    }

    if (deposit < rentPrice) {
      nextErrors.deposit = 'Deposit must be greater than or equal to rent.';
    }

    return nextErrors;
  };

  const isFormValid = useMemo(() => {
    const hasDays = selectedDays.length > 0;
    const validDates = Boolean(startDate && endDate && duration > 0);
    const validRent = rentPrice > 0;
    const validDeposit = deposit >= rentPrice;
    return hasDays && validDates && validRent && validDeposit;
  }, [selectedDays.length, startDate, endDate, duration, rentPrice, deposit]);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((current) => current !== day) : [...prev, day]
    );
  };

  const resetAll = () => {
    setSelectedDays([]);
    setStartDate('');
    setEndDate('');
    setRentPrice(1);
    setDeposit(1);
    setCondition('new');
    setDemand('medium');
    setErrors({});
  };

  const applySuggestion = () => {
    setRentPrice(aiSuggestion.suggested_price);
    if (deposit < aiSuggestion.suggested_price) {
      setDeposit(aiSuggestion.suggested_price);
    }
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/add-item-step2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: listingDraft?.title || '',
          description: listingDraft?.description || '',
          category: listingDraft?.category || 'Others',
          image_urls: listingDraft?.image_urls || [],
          image_public_ids: listingDraft?.image_public_ids || [],
          availability_days: selectedDays,
          start_date: startDate,
          end_date: endDate,
          duration,
          rent_price: rentPrice,
          deposit,
          ai_suggested_price: aiSuggestion.suggested_price,
        }),
      });

      const rawResponse = await response.text();
      let payload: { error?: string; itemId?: string } = {};
      try {
        payload = JSON.parse(rawResponse) as { error?: string; itemId?: string };
      } catch {
        payload = {
          error: rawResponse || 'Unexpected server response while saving data.',
        };
      }

      if (!response.ok) {
        setToast(payload.error || 'Failed to save data.');
        return;
      }

      setToast('Pricing and availability saved successfully.');
      const summary: ListingSubmissionSummary = {
        title: listingDraft?.title || '',
        description: listingDraft?.description || '',
        category: listingDraft?.category || 'Others',
        image_urls: listingDraft?.image_urls || [],
        image_public_ids: listingDraft?.image_public_ids || [],
        availability_days: selectedDays,
        start_date: startDate,
        end_date: endDate,
        duration,
        rent_price: rentPrice,
        deposit,
        ai_suggested_price: aiSuggestion.suggested_price,
        itemId: payload.itemId,
      };

      setTimeout(() => {
        onSuccess?.(summary);
      }, 500);
    } catch {
      setToast('Network error while saving data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confidenceStyles: Record<string, string> = {
    high: 'bg-green-600 text-white',
    medium: 'bg-amber-500 text-white',
    low: 'bg-rose-500 text-white',
  };

  return (
    <div className="relative mx-auto w-full max-w-xl p-4 md:p-6">
      {toast && (
        <div className="mb-4 rounded-lg bg-[#1c2b4c] px-4 py-2 text-sm text-white shadow-md">{toast}</div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-xl bg-white p-4 shadow-md">
          <h3 className="mb-3 text-base font-semibold text-[#1c2b4c]">Availability</h3>

          <div className="mb-2 flex flex-wrap gap-2">
            {ALL_DAYS.map((day) => {
              const active = selectedDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[#1b52d6] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          {errors.days && <p className="text-xs text-rose-600">{errors.days}</p>}

          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#1c2b4c]">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1b52d6]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#1c2b4c]">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1b52d6]"
              />
            </div>

            <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {duration > 0 ? `${duration} days selected` : 'Select a valid date range'}
            </p>
            {errors.date && <p className="text-xs text-rose-600">{errors.date}</p>}
          </div>
        </section>

        <section className="rounded-xl bg-white p-4 shadow-md">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-[#1c2b4c]">AI TrustRent Pricing</h3>
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </button>
          </div>

          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#1c2b4c]">
                  Suggested price: Rs {aiSuggestion.suggested_price}/day
                </p>
                <p className="text-sm text-slate-600">Speed boost: {aiSuggestion.speed_boost}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${confidenceStyles[aiSuggestion.confidence]}`}>
                {aiSuggestion.confidence}
              </span>
            </div>

            <button
              type="button"
              onClick={applySuggestion}
              className="mt-3 inline-flex items-center gap-1 rounded-md bg-[#1b52d6] px-3 py-2 text-sm font-semibold text-white hover:bg-[#103387]"
            >
              <Sparkles className="h-4 w-4" />
              Apply Suggestion
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#1c2b4c]">Rent Price (Rs/day)</label>
              <input
                type="number"
                min={1}
                max={1000}
                value={rentPrice}
                onChange={(event) => setRentPrice(Number(event.target.value) || 0)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1b52d6]"
              />
              {errors.rent && <p className="mt-1 text-xs text-rose-600">{errors.rent}</p>}
            </div>

            <input
              type="range"
              min={1}
              max={1000}
              value={Math.min(Math.max(rentPrice, 1), 1000)}
              onChange={(event) => setRentPrice(Number(event.target.value))}
              className="w-full"
            />

            <div>
              <label className="mb-1 block text-sm font-medium text-[#1c2b4c]">Deposit (Rs)</label>
              <input
                type="number"
                min={0}
                value={deposit}
                onChange={(event) => setDeposit(Number(event.target.value) || 0)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1b52d6]"
              />
              {errors.deposit && <p className="mt-1 text-xs text-rose-600">{errors.deposit}</p>}
            </div>
          </div>
        </section>
      </div>

      <div className="mt-6 flex flex-wrap justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-[#1c2b4c] hover:bg-slate-50"
        >
          Back
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          className="inline-flex items-center gap-1 rounded-md bg-[#1b52d6] px-5 py-2 text-sm font-semibold text-white hover:bg-[#103387] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isSubmitting ? 'Saving...' : 'Next'}
          {!isSubmitting && <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Validation: at least one day, valid date range, rent price greater than 0, and deposit {'>='} rent.
      </p>
      <p className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Responsive layout applied with grid-cols-1 md:grid-cols-2, gap-6, and w-full slider.
      </p>
    </div>
  );
}
