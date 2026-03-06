import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INewsMarquee extends Document {
    text: string;
    isActive: boolean;
    order: number;
}

const NewsMarqueeSchema = new Schema<INewsMarquee>(
    {
        text: { type: String, required: true },
        isActive: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const NewsMarquee: Model<INewsMarquee> =
    mongoose.models.NewsMarquee ||
    mongoose.model<INewsMarquee>('NewsMarquee', NewsMarqueeSchema);

export default NewsMarquee;
