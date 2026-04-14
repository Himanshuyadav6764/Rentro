import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/session';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import Message from '@/models/Message';
import { getOnlineUserIds } from '@/lib/socketRuntime';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserId = currentUser._id.toString();

    await connectToDatabase();

    const users = await User.find({ _id: { $ne: currentUserId } })
      .sort({ updatedAt: -1 })
      .limit(100)
      .lean();

    const messages = await Message.find({
      $or: [{ senderId: currentUserId }, { receiverId: currentUserId }],
    })
      .sort({ createdAt: -1 })
      .lean();

    const latestByPeer = new Map<string, { text: string; createdAt: Date }>();

    for (const message of messages) {
      const peerId = message.senderId === currentUserId ? message.receiverId : message.senderId;
      if (!latestByPeer.has(peerId)) {
        latestByPeer.set(peerId, {
          text: message.text,
          createdAt: message.createdAt,
        });
      }
    }

    const onlineUsers = new Set(getOnlineUserIds());

    const chats = users
      .map((user) => {
        const id = user._id.toString();
        const latest = latestByPeer.get(id);

        return {
          userId: id,
          name: user.name,
          avatar: user.image,
          trustScore: user.trustScore ?? 50,
          lastMessage: latest?.text || 'Start your conversation',
          lastMessageAt: latest?.createdAt || user.updatedAt || user.createdAt,
          online: onlineUsers.has(id),
        };
      })
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

    return NextResponse.json({ success: true, chats });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch chat list';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
