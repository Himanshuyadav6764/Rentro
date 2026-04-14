import { Schema, model, models } from 'mongoose';

export interface IRentalRequest {
  item_name: string;
  requester_name: string;
  owner_id?: string;
  owner_name?: string;
  days: number;
  offered_amount: number;
  type: 'incoming' | 'outgoing';
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
}

const RentalRequestSchema = new Schema<IRentalRequest>({
  item_name: { type: String, required: true },
  requester_name: { type: String, required: true },
  owner_id: { type: String },
  owner_name: { type: String },
  days: { type: Number, required: true },
  offered_amount: { type: Number, required: true },
  type: { type: String, enum: ['incoming', 'outgoing'], default: 'incoming' },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

const RentalRequest = models.RentalRequest || model<IRentalRequest>('RentalRequest', RentalRequestSchema);

export default RentalRequest;
