import { Schema, model, models } from 'mongoose';

export interface IRentalHistory {
  item_name: string;
  counterpart: string;
  amount: number;
  completed_on: Date;
  role: 'owner' | 'renter';
  createdAt: Date;
}

const RentalHistorySchema = new Schema<IRentalHistory>({
  item_name: { type: String, required: true },
  counterpart: { type: String, required: true },
  amount: { type: Number, required: true },
  completed_on: { type: Date, default: Date.now },
  role: { type: String, enum: ['owner', 'renter'], required: true },
  createdAt: { type: Date, default: Date.now },
});

const RentalHistory = models.RentalHistory || model<IRentalHistory>('RentalHistory', RentalHistorySchema);

export default RentalHistory;
