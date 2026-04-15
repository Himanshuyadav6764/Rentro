"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, MapPin, Search } from "lucide-react";

type Listing = {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  image_urls?: string[];
  rent_price?: number;
  deposit?: number;
  location_label?: string;
  location_area?: string;
  location_city?: string;
  createdAt?: string;
  distance_km?: number;
};

type SortKey = "newest" | "relevance" | "distance" | "price_low" | "price_high";
type SearchType = "all" | "title" | "description" | "category";

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "newest", label: "Date Published" },
  { value: "relevance", label: "Relevance" },
  { value: "distance", label: "Distance" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
];

const SEARCH_TYPE_OPTIONS: Array<{ value: SearchType; label: string }> = [
  { value: "all", label: "All Fields" },
  { value: "title", label: "Title" },
  { value: "description", label: "Description" },
  { value: "category", label: "Category" },
];

function includesText(source: string | undefined, query: string) {
  return (source || "").toLowerCase().includes(query.toLowerCase());
}

function formatRupees(value: number | undefined) {
  const amount = Number.isFinite(value) ? Number(value) : 0;
  return new Intl.NumberFormat("en-IN").format(amount);
}

function parseOptionalNumber(value: string | null) {
  if (!value || value.trim() === "") {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  return parsed;
}

function getRelevanceScore(item: Listing, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) {
    return 0;
  }

  const title = (item.title || "").toLowerCase();
  const description = (item.description || "").toLowerCase();
  const category = (item.category || "").toLowerCase();

  let score = 0;
  if (title.includes(q)) {
    score += 5;
  }
  if (category.includes(q)) {
    score += 3;
  }
  if (description.includes(q)) {
    score += 2;
  }
  if (title.startsWith(q)) {
    score += 2;
  }

  return score;
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = (searchParams.get("q") || "").trim();
  const lat = searchParams.get("lat") || "";
  const lng = searchParams.get("lng") || "";
  const radiusKm = searchParams.get("radiusKm") || "";

  const [searchInput, setSearchInput] = useState(q);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [appliedMinPrice, setAppliedMinPrice] = useState<number | undefined>(undefined);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [searchType, setSearchType] = useState<SearchType>("all");

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  useEffect(() => {
    let cancelled = false;

    async function fetchListings() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (q) {
          params.set("search", q);
        }
        if (lat && lng) {
          params.set("lat", lat);
          params.set("lng", lng);
          params.set("radiusKm", radiusKm || "50");
        }

        const response = await fetch(`/api/listings?${params.toString()}`, {
          cache: "no-store",
        });

        const payload = (await response.json()) as {
          success?: boolean;
          listings?: Listing[];
        };

        if (!response.ok || !payload.success) {
          if (!cancelled) {
            setListings([]);
          }
          return;
        }

        if (!cancelled) {
          setListings(payload.listings || []);
        }
      } catch {
        if (!cancelled) {
          setListings([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchListings();

    return () => {
      cancelled = true;
    };
  }, [q, lat, lng, radiusKm]);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    for (const item of listings) {
      if (item.category?.trim()) {
        unique.add(item.category.trim());
      }
    }

    return ["all", ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [listings]);

  const filteredListings = useMemo(() => {
    const filtered = listings.filter((item) => {
      const price = Number(item.rent_price || 0);

      if (selectedCategory !== "all") {
        if ((item.category || "").toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      if (appliedMinPrice !== undefined && price < appliedMinPrice) {
        return false;
      }

      if (appliedMaxPrice !== undefined && price > appliedMaxPrice) {
        return false;
      }

      if (!q) {
        return true;
      }

      if (searchType === "title") {
        return includesText(item.title, q);
      }

      if (searchType === "description") {
        return includesText(item.description, q);
      }

      if (searchType === "category") {
        return includesText(item.category, q);
      }

      return includesText(`${item.title || ""} ${item.description || ""} ${item.category || ""}`, q);
    });

    filtered.sort((a, b) => {
      if (sortBy === "price_low") {
        return Number(a.rent_price || 0) - Number(b.rent_price || 0);
      }

      if (sortBy === "price_high") {
        return Number(b.rent_price || 0) - Number(a.rent_price || 0);
      }

      if (sortBy === "distance") {
        const aDistance = a.distance_km ?? Number.POSITIVE_INFINITY;
        const bDistance = b.distance_km ?? Number.POSITIVE_INFINITY;
        return aDistance - bDistance;
      }

      if (sortBy === "relevance") {
        return getRelevanceScore(b, q) - getRelevanceScore(a, q);
      }

      const aDate = new Date(a.createdAt || 0).getTime();
      const bDate = new Date(b.createdAt || 0).getTime();
      return bDate - aDate;
    });

    return filtered;
  }, [appliedMaxPrice, appliedMinPrice, listings, q, searchType, selectedCategory, sortBy]);

  function submitSearch(event: FormEvent) {
    event.preventDefault();

    const next = new URLSearchParams();
    if (searchInput.trim()) {
      next.set("q", searchInput.trim());
    }

    if (lat && lng) {
      next.set("lat", lat);
      next.set("lng", lng);
      next.set("radiusKm", radiusKm || "50");
    }

    router.push(`/search${next.toString() ? `?${next.toString()}` : ""}`);
  }

  function applyBudgetFilter() {
    const min = parseOptionalNumber(minPriceInput);
    const max = parseOptionalNumber(maxPriceInput);

    setAppliedMinPrice(min);
    setAppliedMaxPrice(max);
  }

  function resetFilters() {
    setSelectedCategory("all");
    setSearchType("all");
    setMinPriceInput("");
    setMaxPriceInput("");
    setAppliedMinPrice(undefined);
    setAppliedMaxPrice(undefined);
    setSortBy("newest");
  }

  const hasLocation = Boolean(lat && lng);

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1320px] items-center gap-4 px-4 py-3 md:px-6">
          <form onSubmit={submitSearch} className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search items..."
              className="w-full bg-transparent text-sm font-medium outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-[#1b52d6] px-4 py-2 text-sm font-bold text-white hover:bg-[#1748bd]"
            >
              Search
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1320px] gap-5 px-4 py-5 md:px-6">
        <aside className="hidden w-[300px] shrink-0 border-r border-slate-200 pr-6 md:block">
          <div className="mb-5 border-b border-slate-200 pb-5">
            <button className="flex w-full items-center justify-between text-left">
              <span className="text-[30px] font-black leading-none">CATEGORIES</span>
              <ChevronDown className="h-5 w-5 text-slate-700" />
            </button>
            <div className="mt-4 space-y-2">
              {categories.map((category) => {
                const isActive = selectedCategory.toLowerCase() === category.toLowerCase();
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-[28px] font-semibold transition-colors ${
                      isActive ? "text-black" : "text-slate-700 hover:text-black"
                    }`}
                  >
                    <span className="text-xl">{isActive ? "-" : ""}</span>
                    <span>{category === "all" ? "All Categories" : category}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-5 border-b border-slate-200 pb-5">
            <button className="flex w-full items-center justify-between text-left">
              <span className="text-[30px] font-black leading-none">LOCATIONS</span>
              <ChevronDown className="h-5 w-5 text-slate-700" />
            </button>
            <div className="mt-4 text-sm text-slate-600">
              {hasLocation ? "Nearby radius active (50 km)" : "All India"}
            </div>
          </div>

          <div className="mb-5">
            <p className="text-[30px] font-black leading-none text-slate-400">Filters</p>
          </div>

          <div className="mb-5 border-b border-slate-200 pb-6">
            <button className="flex w-full items-center justify-between text-left">
              <span className="text-[30px] font-black leading-none">BUDGET</span>
              <ChevronDown className="h-5 w-5 text-slate-700" />
            </button>
            <p className="mt-3 text-sm text-slate-500">Choose a range below</p>
            <div className="mt-4 flex items-center gap-2">
              <input
                value={minPriceInput}
                onChange={(event) => setMinPriceInput(event.target.value.replace(/\D/g, ""))}
                placeholder="min"
                className="w-24 border border-slate-300 px-2 py-1.5 text-sm outline-none"
              />
              <span className="text-sm text-slate-600">to</span>
              <input
                value={maxPriceInput}
                onChange={(event) => setMaxPriceInput(event.target.value.replace(/\D/g, ""))}
                placeholder="max"
                className="w-24 border border-slate-300 px-2 py-1.5 text-sm outline-none"
              />
              <button
                type="button"
                onClick={applyBudgetFilter}
                className="rounded bg-slate-800 px-4 py-1.5 text-sm font-bold text-white hover:bg-slate-900"
              >
                Apply
              </button>
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-400">Search Type</p>
            <select
              value={searchType}
              onChange={(event) => setSearchType(event.target.value as SearchType)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold outline-none"
            >
              {SEARCH_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Reset Filters
            </button>
          </div>
        </aside>

        <section className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Search Results</h1>
              <p className="text-sm font-medium text-slate-500">
                {q ? `Showing results for \"${q}\"` : "Showing all listings"} · {filteredListings.length} items
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="sortBy" className="text-sm font-black uppercase text-slate-800">
                SORT BY :
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortKey)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold outline-none"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-2 md:hidden">
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortKey)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm font-semibold text-slate-600">
              Loading listings...
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-10 text-center">
              <p className="text-lg font-bold text-slate-800">No results found</p>
              <p className="mt-2 text-sm text-slate-500">Try changing search, category, or budget filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {filteredListings.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-xl border border-slate-300 bg-white">
                  <div className="relative h-44 bg-slate-100">
                    <Image
                      src={item.image_urls?.[0] || "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1280&q=80"}
                      alt={item.title || "Listing image"}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-1.5 p-4">
                    <h2 className="line-clamp-1 text-lg font-black text-slate-900">{item.title || "Untitled Item"}</h2>
                    <p className="line-clamp-1 text-sm font-semibold text-slate-500">{item.description || "No description"}</p>
                    <p className="text-xl font-black text-slate-900">₹ {formatRupees(item.rent_price)}</p>
                    <p className="text-sm font-semibold text-slate-600">Category: {item.category || "Others"}</p>
                    <p className="text-sm font-semibold text-slate-600">Deposit: ₹ {formatRupees(item.deposit)}</p>
                    <p className="line-clamp-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {item.location_label || item.location_area || item.location_city || "Location unavailable"}
                    </p>
                    {item.distance_km !== undefined ? (
                      <p className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                        <MapPin className="h-3.5 w-3.5" />
                        {item.distance_km.toFixed(1)} km away
                      </p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
