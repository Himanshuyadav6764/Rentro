import { NextResponse } from 'next/server';
import Item from '@/models/Item';
import { connectToDatabase } from '@/lib/db';

export async function GET() {
  try {
    await connectToDatabase();

    const items = await Item.find({}).sort({ createdAt: -1 }).lean();

    const listings = items.map((item) => ({
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
      earnings: typeof item.earnings === 'number' ? item.earnings : (item.rent_price || 0) * (item.duration || 0),
      issues_count: item.issues_count || 0,
      late_returns_count: item.late_returns_count || 0,
      behavior_notes: item.behavior_notes || [],
      createdAt: item.createdAt,
    }));

    return NextResponse.json({ success: true, listings });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load listings';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
