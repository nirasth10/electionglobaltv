import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBreakingNews extends Document {
    text: string;
    isActive: boolean;
    order: number;
}

const BreakingNewsSchema = new Schema<IBreakingNews>(
    {
        text: { type: String, required: true },
        isActive: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const BreakingNews: Model<IBreakingNews> =
    mongoose.models.BreakingNews ||
    mongoose.model<IBreakingNews>('BreakingNews', BreakingNewsSchema);

export default BreakingNews;
