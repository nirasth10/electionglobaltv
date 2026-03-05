import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITickerItem extends Document {
    label: string;
    region: string;
    party: string;
    votes: number;
    changeVotes: number;
    color: string;
    imageUrl?: string;
    isActive: boolean;
    order: number;
}

const TickerItemSchema = new Schema<ITickerItem>(
    {
        label: { type: String, required: true },
        region: { type: String, required: true },
        party: { type: String, required: true },
        votes: { type: Number, default: 0 },
        changeVotes: { type: Number, default: 0 },
        color: { type: String, default: '#3b82f6' },
        imageUrl: { type: String, default: '' },
        isActive: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const TickerItem: Model<ITickerItem> =
    mongoose.models.TickerItem ||
    mongoose.model<ITickerItem>('TickerItem', TickerItemSchema);

export default TickerItem;
