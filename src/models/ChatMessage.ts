import { Schema, model, models } from 'mongoose';

export interface IChatMessage {
  listing_id: string;
  sender_role: 'owner' | 'renter';
  text: string;
  is_suspicious: boolean;
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    listing_id: { type: String, required: true, index: true },
    sender_role: { type: String, enum: ['owner', 'renter'], required: true },
    text: { type: String, required: true, trim: true },
    is_suspicious: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const ChatMessage = models.ChatMessage || model<IChatMessage>('ChatMessage', ChatMessageSchema);

export default ChatMessage;
