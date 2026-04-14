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
      const matchesSearch =
        !search ||
        `${listing.title || ''} ${listing.description || ''} ${listing.category || ''}`
          .toLowerCase()
          .includes(search);

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
        return false;
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
          return 2;
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

      return createdB - createdA;
    });

    return NextResponse.json({ success: true, listings });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load listings';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
