import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ElectionRegion from '@/models/ElectionRegion';
import { socketEmit } from '@/app/lib/socketEmit';

export const dynamic = 'force-dynamic';

// GET single region
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const region = await ElectionRegion.findById(id).lean();
        if (!region) return NextResponse.json({ error: 'Region not found' }, { status: 404 });
        return NextResponse.json(region);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch region' }, { status: 500 });
    }
}

// PUT update region
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await request.json();

        // If setting as current display, unset all others first
        if (body.isCurrentDisplay === true) {
            await ElectionRegion.updateMany({}, { isCurrentDisplay: false });
        }

        const updated = await ElectionRegion.findByIdAndUpdate(
            id,
            { ...body, lastUpdated: new Date() },
            { new: true }
        );

        if (!updated) return NextResponse.json({ error: 'Region not found' }, { status: 404 });

        // Emit socket event
        const all = await ElectionRegion.find({}).sort({ createdAt: 1 }).lean();
        await socketEmit('regions:updated', all);

        return NextResponse.json(updated);
    } catch (error) {
        console.error('PUT /api/regions/[id] error:', error);
        return NextResponse.json({ error: 'Failed to update region' }, { status: 500 });
    }
}

// DELETE region
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const deleted = await ElectionRegion.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ error: 'Region not found' }, { status: 404 });

        // Emit socket event
        const all = await ElectionRegion.find({}).sort({ createdAt: 1 }).lean();
        await socketEmit('regions:updated', all);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete region' }, { status: 500 });
    }
}
