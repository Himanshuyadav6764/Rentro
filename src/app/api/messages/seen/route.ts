import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/session';
import { connectToDatabase } from '@/lib/db';
import Message from '@/models/Message';
import { emitMessageSeen } from '@/lib/socketRuntime';

export const runtime = 'nodejs';

const markSeenSchema = z.object({
  userId: z.string().trim().min(1),
});

export async function POST(request: Request) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = markSeenSchema.parse(await request.json());
    const currentUserId = currentUser._id.toString();

    await connectToDatabase();

    const unseenMessages = await Message.find({
      senderId: payload.userId,
      receiverId: currentUserId,
      seen: false,
    })
      .select('_id')
      .lean();

    if (unseenMessages.length === 0) {
      return NextResponse.json({ success: true, updatedCount: 0, messageIds: [] });
    }

    const messageIds = unseenMessages.map((message) => message._id.toString());

    await Message.updateMany(
      {
        _id: { $in: unseenMessages.map((message) => message._id) },
      },
      {
        $set: { seen: true },
      },
    );

    emitMessageSeen({
      senderId: payload.userId,
      receiverId: currentUserId,
      messageIds,
      seenAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, updatedCount: messageIds.length, messageIds });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.issues[0]?.message || 'Invalid seen payload' }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : 'Failed to mark messages as seen';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
