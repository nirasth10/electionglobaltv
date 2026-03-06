import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INewsMarqueeSettings extends Document {
    heading: string;
}

const NewsMarqueeSettingsSchema = new Schema<INewsMarqueeSettings>(
    {
        heading: { type: String, default: 'ELECTION UPDATE 2082' },
    },
    { timestamps: true }
);

const NewsMarqueeSettings: Model<INewsMarqueeSettings> =
    mongoose.models.NewsMarqueeSettings ||
    mongoose.model<INewsMarqueeSettings>('NewsMarqueeSettings', NewsMarqueeSettingsSchema);

export default NewsMarqueeSettings;
