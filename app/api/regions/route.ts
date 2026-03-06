import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ElectionRegion from '@/models/ElectionRegion';
import { socketEmit } from '@/app/lib/socketEmit';

export const dynamic = 'force-dynamic';

// GET all regions
export async function GET() {
    try {
        await connectDB();
        const regions = await ElectionRegion.find({}).sort({ createdAt: 1 }).lean();
        return NextResponse.json(regions);
    } catch (error) {
        console.error('GET /api/regions error:', error);
        return NextResponse.json({ error: 'Failed to fetch regions' }, { status: 500 });
    }
}

// POST create a new region
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();

        const region = await ElectionRegion.create({
            ...body,
            lastUpdated: new Date(),
        });

        // Emit socket event
        const all = await ElectionRegion.find({}).sort({ createdAt: 1 }).lean();
        await socketEmit('regions:updated', all);

        return NextResponse.json(region, { status: 201 });
    } catch (error) {
        console.error('POST /api/regions error:', error);
        return NextResponse.json({ error: 'Failed to create region' }, { status: 500 });
    }
}
