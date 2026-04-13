import { Schema, model, models } from 'mongoose';

export interface IListingIssue {
  listing_id: string;
  issue_type: 'damage' | 'fraud' | 'late_return' | 'other';
  severity: 'low' | 'medium' | 'high';
  description: string;
  status: 'open' | 'resolved';
  createdAt: Date;
}

const ListingIssueSchema = new Schema<IListingIssue>(
  {
    listing_id: { type: String, required: true, index: true },
    issue_type: { type: String, enum: ['damage', 'fraud', 'late_return', 'other'], required: true },
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    description: { type: String, required: true, trim: true },
    status: { type: String, enum: ['open', 'resolved'], default: 'open' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const ListingIssue = models.ListingIssue || model<IListingIssue>('ListingIssue', ListingIssueSchema);

export default ListingIssue;
