import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/session';
import { connectToDatabase } from '@/lib/db';
import Message from '@/models/Message';
import { emitMessageCreated } from '@/lib/socketRuntime';

export const runtime = 'nodejs';

const sendMessageSchema = z.object({
  receiverId: z.string().trim().min(1),
  text: z.string().trim().min(1).max(1000),
});

export async function GET(request: Request) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = (searchParams.get('userId') || '').trim();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId query parameter is required' }, { status: 400 });
    }

    const currentUserId = currentUser._id.toString();

    await connectToDatabase();

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      messages: messages.map((message) => ({
        id: message._id.toString(),
        senderId: message.senderId,
        receiverId: message.receiverId,
        text: message.text,
        createdAt: message.createdAt,
        seen: message.seen,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch messages';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = sendMessageSchema.parse(await request.json());
    const senderId = currentUser._id.toString();

    await connectToDatabase();

    const message = await Message.create({
      senderId,
      receiverId: payload.receiverId,
      text: payload.text,
      seen: false,
    });

    const responseMessage = {
      id: message._id.toString(),
      senderId: message.senderId,
      receiverId: message.receiverId,
      text: message.text,
      createdAt: message.createdAt,
      seen: message.seen,
    };

    emitMessageCreated(responseMessage);

    return NextResponse.json({ success: true, message: responseMessage });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.issues[0]?.message || 'Invalid message payload' }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : 'Failed to send message';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
