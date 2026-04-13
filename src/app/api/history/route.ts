import { NextResponse } from 'next/server';
import RentalHistory from '@/models/RentalHistory';
import { connectToDatabase } from '@/lib/db';

const seedHistory = [
  {
    item_name: 'Maths Notes',
    counterpart: 'Sonal Jain',
    amount: 180,
    completed_on: new Date('2026-04-02'),
    role: 'owner' as const,
  },
  {
    item_name: 'Tripod Stand',
    counterpart: 'Karan V.',
    amount: 220,
    completed_on: new Date('2026-03-28'),
    role: 'renter' as const,
  },
];

export async function GET() {
  try {
    await connectToDatabase();

    const total = await RentalHistory.countDocuments({});
    if (total === 0) {
      await RentalHistory.insertMany(seedHistory);
    }

    const records = await RentalHistory.find({}).sort({ completed_on: -1, createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      history: records.map((record) => ({
        id: record._id.toString(),
        itemName: record.item_name,
        counterpart: record.counterpart,
        amount: record.amount,
        completedOn: record.completed_on,
        role: record.role,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load history';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
