import { Schema, model, models } from 'mongoose';

export interface IItem {
  title: string;
  description: string;
  category: string;
  image_urls: string[];
  availability_days: string[];
  start_date: Date;
  end_date: Date;
  duration: number;
  rent_price: number;
  deposit: number;
  ai_suggested_price: number;
  createdAt: Date;
}

const ItemSchema = new Schema<IItem>({
  title: String,
  description: String,
  category: String,
  image_urls: [String],
  availability_days: [String],
  start_date: Date,
  end_date: Date,
  duration: Number,
  rent_price: Number,
  deposit: Number,
  ai_suggested_price: Number,
  createdAt: { type: Date, default: Date.now },
});

const Item = models.Item || model<IItem>('Item', ItemSchema);

export default Item;
