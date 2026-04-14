import { Schema, model, models } from 'mongoose';

export interface IMessage {
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: Date;
  seen: boolean;
}

const MessageSchema = new Schema<IMessage>(
  {
    senderId: { type: String, required: true, index: true },
    receiverId: { type: String, required: true, index: true },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
    seen: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });
MessageSchema.index({ receiverId: 1, seen: 1, createdAt: -1 });

const Message = models.Message || model<IMessage>('Message', MessageSchema);

export default Message;
