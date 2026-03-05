import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICandidate {
    _id?: string;
    name: string;
    party: string;
    votes: number;
    changeVotes: number;
    color: string;
    imageUrl: string;
    partySymbol?: string;
}

export interface IElectionRegion extends Document {
    name: string;
    nepaliName: string;
    totalCountPercent: number;
    status: 'active' | 'completed' | 'pending';
    isCurrentDisplay: boolean;
    candidates: ICandidate[];
    lastUpdated: Date;
}

const CandidateSchema = new Schema<ICandidate>({
    name: { type: String, required: true },
    party: { type: String, required: true },
    votes: { type: Number, default: 0 },
    changeVotes: { type: Number, default: 0 },
    color: { type: String, default: '#3b82f6' },
    imageUrl: { type: String, default: '' },
    partySymbol: { type: String, default: '' },
});

const ElectionRegionSchema = new Schema<IElectionRegion>(
    {
        name: { type: String, required: true },
        nepaliName: { type: String, required: true },
        totalCountPercent: { type: Number, default: 0, min: 0, max: 100 },
        status: {
            type: String,
            enum: ['active', 'completed', 'pending'],
            default: 'active',
        },
        isCurrentDisplay: { type: Boolean, default: false },
        candidates: [CandidateSchema],
        lastUpdated: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const ElectionRegion: Model<IElectionRegion> =
    mongoose.models.ElectionRegion ||
    mongoose.model<IElectionRegion>('ElectionRegion', ElectionRegionSchema);

export default ElectionRegion;
