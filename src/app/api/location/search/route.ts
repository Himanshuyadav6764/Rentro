import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const querySchema = z.object({
  q: z.string().trim().min(2).max(120),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
});

type OpenCageResult = {
  formatted?: string;
  components?: Record<string, string | undefined>;
  geometry?: {
    lat?: number;
    lng?: number;
  };
};

function pickArea(components: Record<string, string | undefined>) {
  return (
    components.suburb ||
    components.neighbourhood ||
    components.city_district ||
    components.district ||
    components.quarter ||
    components.residential ||
    components.road ||
    components.village
  );
}

function pickCity(components: Record<string, string | undefined>) {
  return (
    components.city ||
    components.town ||
    components.county ||
    components.state_district ||
    components.village
  );
}

function formatLocation(area?: string, city?: string, fallback?: string) {
  if (area && city) {
    return `${area}, ${city}`;
  }

  if (area) {
    return area;
  }

  if (city) {
    return city;
  }

  return fallback || "Unknown Location";
}

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

export async function GET(request: Request) {
  try {
    const key = process.env.OPENCAGE_API_KEY;
    if (!key) {
      return NextResponse.json(
        {
          success: false,
          message: "OpenCage API key missing. Set OPENCAGE_API_KEY in environment.",
        },
        { status: 503 },
      );
    }

    const { searchParams } = new URL(request.url);
    const { q, lat, lng } = querySchema.parse({
      q: searchParams.get("q"),
      lat: searchParams.get("lat"),
      lng: searchParams.get("lng"),
    });

    const hasReferenceCoords = lat !== undefined && lng !== undefined;

    const toSuggestions = (results: OpenCageResult[]) => {
      return results
        .filter((item) => item.geometry?.lat !== undefined && item.geometry?.lng !== undefined)
        .filter((item) => (item.components?.country_code || "").toLowerCase() === "in")
        .map((item) => {
          const components = item.components || {};
          const area = pickArea(components);
          const city = pickCity(components);
          const itemLat = item.geometry?.lat as number;
          const itemLng = item.geometry?.lng as number;

          const distanceKm = hasReferenceCoords
            ? getDistanceKm(lat as number, lng as number, itemLat, itemLng)
            : undefined;

          return {
            area,
            city,
            label: formatLocation(area, city, item.formatted),
            lat: itemLat,
            lng: itemLng,
            distanceKm,
            formatted: item.formatted,
          };
        })
        .sort((a, b) => {
          if (a.distanceKm === undefined && b.distanceKm === undefined) {
            return 0;
          }

          if (a.distanceKm === undefined) {
            return 1;
          }

          if (b.distanceKm === undefined) {
            return -1;
          }

          return a.distanceKm - b.distanceKm;
        });
    };

    const fetchCandidates = async (useBounds: boolean) => {
      const endpoint = new URL("https://api.opencagedata.com/geocode/v1/json");
      endpoint.searchParams.set("q", q);
      endpoint.searchParams.set("key", key);
      endpoint.searchParams.set("countrycode", "in");
      endpoint.searchParams.set("language", "en");
      endpoint.searchParams.set("limit", "30");
      endpoint.searchParams.set("no_annotations", "1");

      if (hasReferenceCoords) {
        endpoint.searchParams.set("proximity", `${lng},${lat}`);

        if (useBounds) {
          const latDelta = 2.5;
          const lngDelta = 2.5;
          const minLat = Math.max(-90, (lat as number) - latDelta);
          const maxLat = Math.min(90, (lat as number) + latDelta);
          const minLng = Math.max(-180, (lng as number) - lngDelta);
          const maxLng = Math.min(180, (lng as number) + lngDelta);
          endpoint.searchParams.set("bounds", `${minLng},${minLat},${maxLng},${maxLat}`);
        }
      }

      const response = await fetch(endpoint.toString(), {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as {
        results?: OpenCageResult[];
      };

      return toSuggestions(payload.results || []);
    };

    let suggestions = hasReferenceCoords
      ? ((await fetchCandidates(true)) || [])
      : ((await fetchCandidates(false)) || []);

    if (hasReferenceCoords && suggestions.length === 0) {
      suggestions = (await fetchCandidates(false)) || [];
    }

    suggestions = suggestions.slice(0, 8);

    return NextResponse.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          suggestions: [],
          message: "Please type at least 2 characters.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        suggestions: [],
        message: "Failed to search locations.",
      },
      { status: 500 },
    );
  }
}
