import { NextResponse } from 'next/server';
import { z } from 'zod';
import Item from '@/models/Item';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { evaluateExtensionPolicy, clampScore } from '@/lib/trustEngine';

const bodySchema = z.object({
  extraDays: z.number().int().min(1).max(30),
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

    const owner = item.owner_id ? await User.findById(item.owner_id) : null;
    const trustScore = owner?.trustScore ?? 60;
    const riskScore = owner?.riskScore ?? 40;

    const policy = evaluateExtensionPolicy({
      trustScore,
      riskScore,
      extraDays: payload.extraDays,
      issuesCount: item.issues_count || 0,
      lateReturnsCount: item.late_returns_count || 0,
    });

    if (!policy.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: policy.note,
          aiRecommendation: policy,
        },
        { status: 400 }
      );
    }

    const currentEndDate = new Date(item.end_date);
    currentEndDate.setDate(currentEndDate.getDate() + payload.extraDays);
    item.end_date = currentEndDate;
    item.duration = (item.duration || 0) + payload.extraDays;

    const extraPayment = (item.rent_price || 0) * payload.extraDays;
    item.earnings = (item.earnings || 0) + extraPayment;

    const suggestedDeposit = Math.ceil((item.deposit || 0) * policy.suggestedDepositMultiplier);
    if (suggestedDeposit > (item.deposit || 0)) {
      item.deposit = suggestedDeposit;
    }

    item.behavior_notes = [...(item.behavior_notes || []), `Extension approved: +${payload.extraDays} day(s).`].slice(-20);
    item.status = 'active';

    await item.save();

    if (owner) {
      owner.trustScore = clampScore(owner.trustScore + 1);
      owner.riskScore = clampScore(owner.riskScore - 1);
      await owner.save();
    }

    return NextResponse.json({
      success: true,
      listing: {
        id: item._id,
        start_date: item.start_date,
        end_date: item.end_date,
        duration: item.duration,
        deposit: item.deposit,
        earnings: item.earnings,
        status: item.status,
      },
      aiRecommendation: policy,
      extraPayment,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.issues[0]?.message || 'Invalid request' }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : 'Failed to extend listing';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
