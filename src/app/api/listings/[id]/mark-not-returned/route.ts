import { NextResponse } from 'next/server';
import Item from '@/models/Item';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/db';
import { clampScore, scoreImpactOnNotReturned } from '@/lib/trustEngine';

function isObjectId(value?: string) {
  return Boolean(value && /^[a-fA-F0-9]{24}$/.test(value));
}

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await connectToDatabase();

    const item = await Item.findById(id);
    if (!item) {
      return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });
    }

    const impact = scoreImpactOnNotReturned();

    item.status = 'dispute';
    item.behavior_notes = [
      ...(item.behavior_notes || []),
      impact.behaviorNote,
      'Red flag: renter failed to return item.',
    ].slice(-20);
    await item.save();

    if (item.renter_id && isObjectId(item.renter_id)) {
      const renter = await User.findById(item.renter_id);
      if (renter) {
        renter.trustScore = clampScore((renter.trustScore || 50) + impact.trustDelta);
        renter.riskScore = clampScore((renter.riskScore || 50) + impact.riskDelta);
        await renter.save();
      }
    }

    return NextResponse.json({
      success: true,
      listing: {
        id: item._id.toString(),
        status: item.status,
      },
      trustImpact: impact,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to mark as not returned';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
