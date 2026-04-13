import { NextResponse } from 'next/server';
import { z } from 'zod';
import Item from '@/models/Item';
import User from '@/models/User';
import ListingIssue from '@/models/ListingIssue';
import { connectToDatabase } from '@/lib/db';
import { clampScore, scoreImpactOnIssue } from '@/lib/trustEngine';

const bodySchema = z.object({
  issueType: z.enum(['damage', 'fraud', 'late_return', 'other']),
  severity: z.enum(['low', 'medium', 'high']).default('medium'),
  description: z.string().trim().min(3).max(300),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const payload = bodySchema.parse(await request.json());

    await connectToDatabase();

    const item = await Item.findById(id);
    if (!item) {
      return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });
    }

    await ListingIssue.create({
      listing_id: item._id.toString(),
      issue_type: payload.issueType,
      severity: payload.severity,
      description: payload.description,
      status: 'open',
    });

    item.issues_count = (item.issues_count || 0) + 1;
    item.behavior_notes = [...(item.behavior_notes || []), `Issue reported: ${payload.issueType} (${payload.severity})`].slice(-20);

    if (payload.issueType === 'fraud') {
      item.status = 'cancelled';
    }

    await item.save();

    if (item.owner_id) {
      const owner = await User.findById(item.owner_id);
      if (owner) {
        const impact = scoreImpactOnIssue(payload.severity);
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
        issues_count: item.issues_count,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.issues[0]?.message || 'Invalid issue payload' }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : 'Failed to report issue';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
