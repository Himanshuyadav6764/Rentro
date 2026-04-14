export type ListingData = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  image_urls?: string[];
  rent_price?: number;
  deposit?: number;
  duration?: number;
  owner_id?: string;
  location_label?: string;
  location_area?: string;
  location_city?: string;
};

type ListingsResponse = {
  success?: boolean;
  listings?: ListingData[];
};

export async function fetchListingsData(): Promise<ListingData[]> {
  const response = await fetch('/api/listings', { cache: 'no-store' });
  const payload = (await response.json()) as ListingsResponse;

  if (!response.ok || !payload.success) {
    throw new Error('Unable to load listings');
  }

  return payload.listings || [];
}

export async function fetchListingById(itemId: string): Promise<ListingData | null> {
  const listings = await fetchListingsData();
  return listings.find((listing) => listing.id === itemId) || null;
}
