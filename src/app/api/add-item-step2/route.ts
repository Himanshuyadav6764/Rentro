import { NextResponse } from 'next/server';
import { z } from 'zod';
import Item from '@/models/Item';
import { connectToDatabase } from '@/lib/db';

const bodySchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  category: z.string().trim().min(1),
  image_urls: z.array(z.string()).max(5).optional().default([]),
  availability_days: z.array(z.string()).min(1),
  start_date: z.string().min(1),
  end_date: z.string().min(1),
  duration: z.number().positive(),
  rent_price: z.number().positive(),
  deposit: z.number().nonnegative(),
  ai_suggested_price: z.number().positive(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = bodySchema.parse(json);

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
      availability_days: payload.availability_days,
      start_date: startDate,
      end_date: endDate,
      duration: payload.duration,
      rent_price: payload.rent_price,
      deposit: payload.deposit,
      ai_suggested_price: payload.ai_suggested_price,
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
