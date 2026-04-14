import { NextResponse } from 'next/server';
import Item from '@/models/Item';
import { connectToDatabase } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const earthRadius = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

function parseOptionalNumber(value: string | null) {
  if (value === null || value.trim() === '') {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  return parsed;
}

function expandTokenVariants(token: string) {
  const normalized = token.trim().toLowerCase();
  if (!normalized) {
    return [] as string[];
  }

  const variants = new Set<string>([normalized]);

  if (normalized.endsWith('es') && normalized.length > 3) {
    variants.add(normalized.slice(0, -2));
  }

  if (normalized.endsWith('s') && normalized.length > 2) {
    variants.add(normalized.slice(0, -1));
  }

  const synonymMap: Record<string, string[]> = {
    mobile: ['mobiles', 'phone', 'phones', 'smartphone', 'smartphones'],
    mobiles: ['mobile', 'phone', 'phones', 'smartphone', 'smartphones'],
    phone: ['phones', 'mobile', 'mobiles', 'smartphone', 'smartphones'],
    phones: ['phone', 'mobile', 'mobiles', 'smartphone', 'smartphones'],
    book: ['books', 'notebook', 'notebooks', 'notes'],
    books: ['book', 'notebook', 'notebooks', 'notes'],
    laptop: ['laptops', 'notebook', 'notebooks'],
    laptops: ['laptop', 'notebook', 'notebooks'],
    calculator: ['calculators', 'calc'],
    calculators: ['calculator', 'calc'],
  };

  for (const synonym of synonymMap[normalized] || []) {
    variants.add(synonym);
  }

  return Array.from(variants);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').trim().toLowerCase();
    const category = (searchParams.get('category') || '').trim().toLowerCase();
    const lat = parseOptionalNumber(searchParams.get('lat'));
    const lng = parseOptionalNumber(searchParams.get('lng'));
    const maxDistanceKm = parseOptionalNumber(searchParams.get('radiusKm')) || 50;

    const hasValidCoords =
      lat !== undefined &&
      lng !== undefined &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180;

    const currentUser = await getCurrentUser();
    const currentUserId = currentUser?._id?.toString();

    await connectToDatabase();

    const items = await Item.find({}).sort({ createdAt: -1 }).lean();

    const mappedListings = items.map((item) => {
      const itemLat = typeof item.location_lat === 'number' ? item.location_lat : undefined;
      const itemLng = typeof item.location_lng === 'number' ? item.location_lng : undefined;
      const distanceKm =
        hasValidCoords && itemLat !== undefined && itemLng !== undefined
          ? getDistanceKm(lat as number, lng as number, itemLat, itemLng)
          : undefined;

      return {
        id: item._id.toString(),
        title: item.title,
        description: item.description,
        category: item.category,
        image_urls: item.image_urls || [],
        status: item.status || 'pending',
        renter_name: item.renter_name || 'Awaiting requests',
        availability_days: item.availability_days || [],
        start_date: item.start_date,
        end_date: item.end_date,
        duration: item.duration || 0,
        rent_price: item.rent_price || 0,
        deposit: item.deposit || 0,
        earnings:
          typeof item.earnings === 'number'
            ? item.earnings
            : (item.rent_price || 0) * (item.duration || 0),
        issues_count: item.issues_count || 0,
        late_returns_count: item.late_returns_count || 0,
        behavior_notes: item.behavior_notes || [],
        createdAt: item.createdAt,
        owner_id: item.owner_id,
        location_lat: itemLat,
        location_lng: itemLng,
        location_label: item.location_label,
        location_area: item.location_area,
        location_city: item.location_city,
        distance_km: distanceKm,
      };
    });

    const filtered = mappedListings.filter((listing) => {
      const searchableText = `${listing.title || ''} ${listing.description || ''} ${listing.category || ''} ${listing.location_label || ''} ${listing.location_area || ''} ${listing.location_city || ''}`
        .toLowerCase()
        .trim();

      const searchTokens = search.split(/\s+/).filter(Boolean);
      const matchesSearch =
        searchTokens.length === 0 ||
        searchTokens.every((token) => {
          const variants = expandTokenVariants(token);
          return variants.some((variant) => searchableText.includes(variant));
        });

      const matchesCategory =
        !category || category === 'all' || (listing.category || '').toLowerCase() === category;

      if (!matchesSearch || !matchesCategory) {
        return false;
      }

      if (!hasValidCoords) {
        return true;
      }

      const isOwnerListing =
        Boolean(currentUserId) && Boolean(listing.owner_id) && listing.owner_id === currentUserId;

      if (isOwnerListing) {
        return true;
      }

      if (listing.distance_km === undefined) {
        // Keep listings with missing coordinates in response so search still returns data.
        return true;
      }

      // In explicit search mode, return all matching dashboard data and rank by distance buckets.
      if (search) {
        return true;
      }

      return listing.distance_km <= maxDistanceKm;
    });

    const listings = filtered.sort((a, b) => {
      const createdA = new Date(a.createdAt || 0).getTime();
      const createdB = new Date(b.createdAt || 0).getTime();

      if (!hasValidCoords) {
        return createdB - createdA;
      }

      const bucket = (distanceKm: number | undefined) => {
        if (distanceKm === undefined) {
          return 3;
        }

        if (distanceKm <= 10) {
          return 0;
        }

        if (distanceKm <= 50) {
          return 1;
        }

        return 2;
      };

      const bucketA = bucket(a.distance_km);
      const bucketB = bucket(b.distance_km);

      if (bucketA !== bucketB) {
        return bucketA - bucketB;
      }

      const distanceA = a.distance_km ?? Number.POSITIVE_INFINITY;
      const distanceB = b.distance_km ?? Number.POSITIVE_INFINITY;

      if (distanceA !== distanceB) {
        return distanceA - distanceB;
      }

      return createdB - createdA;
    });

    return NextResponse.json({ success: true, listings });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load listings';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
