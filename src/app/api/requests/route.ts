import { NextResponse } from 'next/server';
import { z } from 'zod';
import RentalRequest from '@/models/RentalRequest';
import { connectToDatabase } from '@/lib/db';

const seedRequests = [
  {
    item_name: 'Dell Laptop',
    requester_name: 'Arjun Patel',
    days: 4,
    offered_amount: 1600,
    type: 'incoming' as const,
    status: 'pending' as const,
  },
  {
    item_name: 'Engineering Books',
    requester_name: 'You',
    days: 7,
    offered_amount: 300,
    type: 'outgoing' as const,
    status: 'pending' as const,
  },
  {
    item_name: 'Casio Calculator',
    requester_name: 'Nikita S.',
    days: 5,
    offered_amount: 250,
    type: 'incoming' as const,
    status: 'pending' as const,
  },
  {
    item_name: 'Audio Speaker',
    requester_name: 'Rahul M.',
    days: 2,
    offered_amount: 180,
    type: 'incoming' as const,
    status: 'pending' as const,
  },
];

const createSchema = z.object({
  itemName: z.string().trim().min(2).max(120),
  requesterName: z.string().trim().min(2).max(120),
  days: z.number().int().min(1).max(90),
  offeredAmount: z.number().min(0),
  type: z.enum(['incoming', 'outgoing']).default('incoming'),
});

export async function GET() {
  try {
    await connectToDatabase();

    const pendingCount = await RentalRequest.countDocuments({ status: 'pending' });
    if (pendingCount === 0) {
      await RentalRequest.insertMany(seedRequests);
    }

    const requests = await RentalRequest.find({ status: 'pending' }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      requests: requests.map((request) => ({
        id: request._id.toString(),
        itemName: request.item_name,
        requesterName: request.requester_name,
        days: request.days,
        offeredAmount: request.offered_amount,
        type: request.type,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load requests';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = createSchema.parse(await request.json());
    await connectToDatabase();

    const created = await RentalRequest.create({
      item_name: payload.itemName,
      requester_name: payload.requesterName,
      days: payload.days,
      offered_amount: payload.offeredAmount,
      type: payload.type,
      status: 'pending',
    });

    return NextResponse.json({
      success: true,
      request: {
        id: created._id.toString(),
        itemName: created.item_name,
        requesterName: created.requester_name,
        days: created.days,
        offeredAmount: created.offered_amount,
        type: created.type,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.issues[0]?.message || 'Invalid request' }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : 'Failed to create request';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
