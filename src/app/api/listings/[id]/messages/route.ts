import { NextResponse } from 'next/server';
import { z } from 'zod';
import Item from '@/models/Item';
import ChatMessage from '@/models/ChatMessage';
import { connectToDatabase } from '@/lib/db';
import { detectSuspiciousWords } from '@/lib/trustEngine';

const bodySchema = z.object({
  senderRole: z.enum(['owner', 'renter']).default('owner'),
  text: z.string().trim().min(1).max(300),
});

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await connectToDatabase();

    const messages = await ChatMessage.find({ listing_id: id }).sort({ createdAt: 1 }).lean();

    return NextResponse.json({
      success: true,
      messages: messages.map((message) => ({
        id: message._id.toString(),
        listing_id: message.listing_id,
        sender_role: message.sender_role,
        text: message.text,
        is_suspicious: message.is_suspicious,
        createdAt: message.createdAt,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load messages';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const payload = bodySchema.parse(await request.json());

    await connectToDatabase();

    const item = await Item.findById(id);
    if (!item) {
      return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });
    }

    const detection = detectSuspiciousWords(payload.text);

    const messageDoc = await ChatMessage.create({
      listing_id: id,
      sender_role: payload.senderRole,
      text: payload.text,
      is_suspicious: detection.isSuspicious,
    });

    if (detection.isSuspicious) {
      item.behavior_notes = [...(item.behavior_notes || []), `Suspicious chat detected: ${detection.matched.join(', ')}`].slice(-20);
      await item.save();
    }

    return NextResponse.json({
      success: true,
      message: {
        id: messageDoc._id,
        listing_id: messageDoc.listing_id,
        sender_role: messageDoc.sender_role,
        text: messageDoc.text,
        is_suspicious: messageDoc.is_suspicious,
        createdAt: messageDoc.createdAt,
      },
      warning: detection.isSuspicious ? 'User risky lag raha hai. Suspicious words detected.' : null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.issues[0]?.message || 'Invalid message payload' }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : 'Failed to send message';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
