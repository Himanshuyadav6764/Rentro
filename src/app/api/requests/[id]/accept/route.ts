import { NextResponse } from 'next/server';
import RentalRequest from '@/models/RentalRequest';
import RentalHistory from '@/models/RentalHistory';
import { connectToDatabase } from '@/lib/db';

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
