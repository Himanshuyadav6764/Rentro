import { NextResponse } from 'next/server';
import { z } from 'zod';
import Item from '@/models/Item';
import { connectToDatabase } from '@/lib/db';
import { getCurrentJwtUser } from '@/lib/auth';

const bodySchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  category: z.string().trim().min(1),
  image_urls: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .refine(
          (value) => {
            if (value.startsWith('/uploads/')) {
              return true;
            }

            return z.url().safeParse(value).success;
          },
          { message: 'Invalid image URL format' }
        )
    )
    .max(5)
    .optional()
    .default([]),
  image_public_ids: z.array(z.string().trim().min(1)).max(5).optional().default([]),
  availability_days: z.array(z.string()).min(1),
  start_date: z.string().min(1),
  end_date: z.string().min(1),
  duration: z.number().positive(),
  rent_price: z.number().positive(),
  deposit: z.number().nonnegative(),
  ai_suggested_price: z.number().positive(),
  location: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      label: z.string().trim().min(1).optional(),
      area: z.string().trim().min(1).optional(),
      city: z.string().trim().min(1).optional(),
    })
    .optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = bodySchema.parse(json);
    const currentUser = await getCurrentJwtUser();

    if (payload.deposit < payload.rent_price) {
      return NextResponse.json(
        { error: 'Deposit must be greater than or equal to rent price' },
        { status: 400 }
      );
    }

    const startDate = new Date(payload.start_date);
    const endDate = new Date(payload.end_date);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate <= startDate) {
      return NextResponse.json({ error: 'Invalid date range' }, { status: 400 });
    }

    await connectToDatabase();

    const item = await Item.create({
      title: payload.title,
      description: payload.description,
      category: payload.category,
      image_urls: payload.image_urls,
      image_public_ids: payload.image_public_ids,
      owner_id: currentUser?._id?.toString(),
      renter_name: 'Awaiting requests',
      status: 'pending',
      availability_days: payload.availability_days,
      start_date: startDate,
      end_date: endDate,
      duration: payload.duration,
      rent_price: payload.rent_price,
      deposit: payload.deposit,
      ai_suggested_price: payload.ai_suggested_price,
      earnings: payload.rent_price * payload.duration,
      issues_count: 0,
      late_returns_count: 0,
      behavior_notes: [],
      location_lat: payload.location?.lat,
      location_lng: payload.location?.lng,
      location_label: payload.location?.label,
      location_area: payload.location?.area,
      location_city: payload.location?.city,
    });

    return NextResponse.json({ success: true, itemId: item._id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || 'Invalid payload' }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : 'Failed to save pricing & availability';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
