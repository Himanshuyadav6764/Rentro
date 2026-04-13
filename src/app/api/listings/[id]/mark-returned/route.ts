import { NextResponse } from 'next/server';
import Item from '@/models/Item';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/db';
import { clampScore, scoreImpactOnReturn } from '@/lib/trustEngine';

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await connectToDatabase();

    const item = await Item.findById(id);
    if (!item) {
      return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });
    }

    const now = new Date();
    const endDate = new Date(item.end_date);
    const msDiff = now.getTime() - endDate.getTime();
    const daysLate = msDiff > 0 ? Math.ceil(msDiff / (24 * 60 * 60 * 1000)) : 0;
    const isLate = daysLate > 0;

    const impact = scoreImpactOnReturn({ isLate, daysLate });

    item.status = 'completed';
    item.late_returns_count = (item.late_returns_count || 0) + (isLate ? 1 : 0);
    item.behavior_notes = [...(item.behavior_notes || []), impact.behaviorNote].slice(-20);
    await item.save();

    if (item.owner_id) {
      const owner = await User.findById(item.owner_id);
      if (owner) {
        owner.trustScore = clampScore(owner.trustScore + impact.trustDelta);
        owner.riskScore = clampScore(owner.riskScore + impact.riskDelta);
        await owner.save();
      }
    }

    return NextResponse.json({
      success: true,
      listing: {
        id: item._id,
        status: item.status,
        late_returns_count: item.late_returns_count,
      },
      trustImpact: impact,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to mark return';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
