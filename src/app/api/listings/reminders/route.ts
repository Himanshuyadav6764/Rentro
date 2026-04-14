import { NextResponse } from 'next/server';
import Item from '@/models/Item';
import { connectToDatabase } from '@/lib/db';

const DAY_MS = 24 * 60 * 60 * 1000;

export async function GET() {
  try {
    await connectToDatabase();

    const items = await Item.find({ status: { $in: ['pending', 'active', 'return_requested'] } }).lean();
    const now = Date.now();

    const reminders = items
      .map((item) => {
        if (item.status === 'return_requested') {
          return {
            listingId: item._id.toString(),
            level: 'warning',
            message: `${item.title} has a return approval request pending.`,
          };
        }

        const endDate = new Date(item.end_date).getTime();
        const diffDays = Math.ceil((endDate - now) / DAY_MS);

        if (Number.isNaN(diffDays)) {
          return null;
        }

        if (diffDays < 0) {
          return {
            listingId: item._id.toString(),
            level: 'alert',
            message: `${item.title} is overdue by ${Math.abs(diffDays)} day(s).`,
          };
        }

        if (diffDays <= 2) {
          return {
            listingId: item._id.toString(),
            level: 'warning',
            message: `${item.title} ends in ${diffDays} day(s).`,
          };
        }

        return null;
      })
      .filter((value): value is { listingId: string; level: 'alert' | 'warning'; message: string } => Boolean(value));

    return NextResponse.json({ success: true, reminders });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load reminders';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
