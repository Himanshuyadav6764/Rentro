import { Schema, model, models } from 'mongoose';

export interface IItem {
  title: string;
  description: string;
  category: string;
  image_urls: string[];
  image_public_ids: string[];
  owner_id?: string;
  renter_name?: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  availability_days: string[];
  start_date: Date;
  end_date: Date;
  duration: number;
  rent_price: number;
  deposit: number;
  ai_suggested_price: number;
  earnings: number;
  issues_count: number;
  late_returns_count: number;
  behavior_notes: string[];
  location_lat?: number;
  location_lng?: number;
  location_label?: string;
  location_area?: string;
  location_city?: string;
  createdAt: Date;
}

const ItemSchema = new Schema<IItem>({
  title: String,
  description: String,
  category: String,
  image_urls: [String],
  image_public_ids: [String],
  owner_id: String,
  renter_name: { type: String, default: 'Awaiting requests' },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending',
  },
  availability_days: [String],
  start_date: Date,
  end_date: Date,
  duration: Number,
  rent_price: Number,
  deposit: Number,
  ai_suggested_price: Number,
  earnings: { type: Number, default: 0 },
  issues_count: { type: Number, default: 0 },
  late_returns_count: { type: Number, default: 0 },
  behavior_notes: { type: [String], default: [] },
  location_lat: Number,
  location_lng: Number,
  location_label: String,
  location_area: String,
  location_city: String,
  createdAt: { type: Date, default: Date.now },
});

const Item = models.Item || model<IItem>('Item', ItemSchema);

export default Item;
