import { NextResponse } from 'next/server';
import RentalRequest from '@/models/RentalRequest';
import RentalHistory from '@/models/RentalHistory';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import Item from '@/models/Item';
import { clampScore, scoreImpactOnRentalStart } from '@/lib/trustEngine';

function isObjectId(value?: string) {
  return Boolean(value && /^[a-fA-F0-9]{24}$/.test(value));
}

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await connectToDatabase();

    const rentalRequest = await RentalRequest.findOne({ _id: id, status: 'pending' });
    if (!rentalRequest) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    rentalRequest.status = 'accepted';
    await rentalRequest.save();

    if (isObjectId(rentalRequest.requester_id)) {
      const renter = await User.findById(rentalRequest.requester_id);
      if (renter) {
        const impact = scoreImpactOnRentalStart();
        renter.trustScore = clampScore((renter.trustScore || 50) + impact.trustDelta);
        renter.riskScore = clampScore((renter.riskScore || 50) + impact.riskDelta);
        await renter.save();
      }
    }

    if (rentalRequest.owner_id && rentalRequest.item_name) {
      const listing = await Item.findOne({
        owner_id: rentalRequest.owner_id,
        title: rentalRequest.item_name,
        status: { $in: ['pending', 'active', 'pending_return', 'return_requested'] },
      }).sort({ createdAt: -1 });

      if (listing) {
        listing.status = 'active';
        listing.renter_name = rentalRequest.requester_name;
        if (isObjectId(rentalRequest.requester_id)) {
          listing.renter_id = rentalRequest.requester_id;
        }
        listing.behavior_notes = [
          ...(listing.behavior_notes || []),
          `Rental accepted for ${rentalRequest.requester_name}.`,
        ].slice(-20);
        await listing.save();
      }
    }

    const history = await RentalHistory.create({
      item_name: rentalRequest.item_name,
      counterpart: rentalRequest.requester_name,
      amount: rentalRequest.offered_amount,
      completed_on: new Date(),
      role: rentalRequest.type === 'incoming' ? 'owner' : 'renter',
    });

    return NextResponse.json({
      success: true,
      requestId: rentalRequest._id.toString(),
      history: {
        id: history._id.toString(),
        itemName: history.item_name,
        counterpart: history.counterpart,
        amount: history.amount,
        completedOn: history.completed_on,
        role: history.role,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to accept request';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
