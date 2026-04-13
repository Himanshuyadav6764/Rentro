import { NextResponse } from 'next/server';
import RentalRequest from '@/models/RentalRequest';
import { connectToDatabase } from '@/lib/db';

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await connectToDatabase();

    const rentalRequest = await RentalRequest.findOne({ _id: id, status: 'pending' });
    if (!rentalRequest) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    rentalRequest.status = 'declined';
    await rentalRequest.save();

    return NextResponse.json({
      success: true,
      requestId: rentalRequest._id.toString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to decline request';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
