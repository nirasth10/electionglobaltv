import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILeftCandidate {
    _id?: string;
    name: string;
    party: string;
    votes: number;
    changeVotes: number;
    color: string;
    imageUrl: string;
    partySymbol?: string;
    isElected?: boolean;
}

export interface ILeftElectionRegion extends Document {
    name: string;
    nepaliName: string;
    totalCountPercent: any;
    status: 'active' | 'completed' | 'pending';
    isCurrentDisplay: boolean;
    showWidget?: boolean;
    candidates: ILeftCandidate[];
    lastUpdated: Date;
}

const LeftCandidateSchema = new Schema<ILeftCandidate>({
    name: { type: String, required: true },
    party: { type: String, required: true },
    votes: { type: Number, default: 0 },
    changeVotes: { type: Number, default: 0 },
    color: { type: String, default: '#3b82f6' },
    imageUrl: { type: String, default: '' },
    partySymbol: { type: String, default: '' },
    isElected: { type: Boolean, default: false },
});

const LeftElectionRegionSchema = new Schema<ILeftElectionRegion>(
    {
        name: { type: String, required: true },
        nepaliName: { type: String, required: true },
        totalCountPercent: { type: Schema.Types.Mixed, default: 0 },
        status: {
            type: String,
            enum: ['active', 'completed', 'pending'],
            default: 'active',
        },
        isCurrentDisplay: { type: Boolean, default: false },
        showWidget: { type: Boolean, default: true },
        candidates: [LeftCandidateSchema],
        lastUpdated: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

if (mongoose.models.LeftElectionRegion) {
    delete mongoose.models.LeftElectionRegion;
}

const LeftElectionRegion: Model<ILeftElectionRegion> = mongoose.model<ILeftElectionRegion>('LeftElectionRegion', LeftElectionRegionSchema);

export default LeftElectionRegion;
