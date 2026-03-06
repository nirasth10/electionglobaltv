import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import LeftElectionRegion from '@/models/LeftElectionRegion';
import { socketEmit } from '@/app/lib/socketEmit';

export const dynamic = 'force-dynamic';

// GET all regions
export async function GET() {
    try {
        await connectDB();
        const regions = await LeftElectionRegion.find({}).sort({ createdAt: 1 }).lean();
        return NextResponse.json(regions);
    } catch (error) {
        console.error('GET /api/left-regions error:', error);
        return NextResponse.json({ error: 'Failed to fetch left regions' }, { status: 500 });
    }
}

// POST create a new region
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();

        const region = await LeftElectionRegion.create({
            ...body,
            lastUpdated: new Date(),
        });

        // Emit socket event
        const all = await LeftElectionRegion.find({}).sort({ createdAt: 1 }).lean();
        await socketEmit('left-regions:updated', all);

        return NextResponse.json(region, { status: 201 });
    } catch (error) {
        console.error('POST /api/left-regions error:', error);
        return NextResponse.json({ error: 'Failed to create left region' }, { status: 500 });
    }
}
