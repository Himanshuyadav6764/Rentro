import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
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
    const { lat, lng } = querySchema.parse({
      lat: searchParams.get("lat"),
      lng: searchParams.get("lng"),
    });

    const endpoint = new URL("https://api.opencagedata.com/geocode/v1/json");
    endpoint.searchParams.set("q", `${lat},${lng}`);
    endpoint.searchParams.set("key", key);
    endpoint.searchParams.set("countrycode", "in");
    endpoint.searchParams.set("language", "en");
    endpoint.searchParams.set("limit", "1");
    endpoint.searchParams.set("no_annotations", "1");

    const response = await fetch(endpoint.toString(), {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Location service unavailable. Please try again.",
        },
        { status: 502 },
      );
    }

    const payload = (await response.json()) as {
      results?: OpenCageResult[];
    };

    const topResult = payload.results?.[0];
    if (!topResult?.components) {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to detect area for these coordinates.",
        },
        { status: 404 },
      );
    }

    const area = pickArea(topResult.components);
    const city = pickCity(topResult.components);
    const countryCode = (topResult.components.country_code || "").toLowerCase();

    if (countryCode && countryCode !== "in") {
      return NextResponse.json(
        {
          success: false,
          message: "Only India locations are supported right now.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      location: {
        area,
        city,
        label: formatLocation(area, city, topResult.formatted),
        lat: topResult.geometry?.lat ?? lat,
        lng: topResult.geometry?.lng ?? lng,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid latitude or longitude.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to resolve location. Please try again.",
      },
      { status: 500 },
    );
  }
}
