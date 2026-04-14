import { NextResponse } from 'next/server';
import Item from '@/models/Item';
import { connectToDatabase } from '@/lib/db';

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await connectToDatabase();

    const item = await Item.findById(id);
    if (!item) {
      return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });
    }

    if (item.status === 'completed') {
      return NextResponse.json({ success: false, error: 'Listing is already completed' }, { status: 400 });
    }

    item.status = 'return_requested';
    item.behavior_notes = [...(item.behavior_notes || []), 'Renter requested return approval.'].slice(-20);
    await item.save();

    return NextResponse.json({
      success: true,
      listing: {
        id: item._id.toString(),
        status: item.status,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to request return';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
