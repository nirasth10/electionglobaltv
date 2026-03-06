import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import LeftElectionRegion from '@/models/LeftElectionRegion';
import { socketEmit } from '@/app/lib/socketEmit';

export const dynamic = 'force-dynamic';

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> } | { params: { id: string } }
) {
    try {
        await connectDB();

        let id: string;
        if ('then' in context.params) {
            id = (await context.params).id;
        } else {
            id = (context as any).params.id;
        }

        const body = await request.json();

        // If setting isCurrentDisplay to true, set all others to false first
        if (body.isCurrentDisplay === true) {
            await LeftElectionRegion.updateMany({}, { $set: { isCurrentDisplay: false } });
        }

        const region = await LeftElectionRegion.findByIdAndUpdate(
            id,
            { ...body, lastUpdated: new Date() },
            { new: true, runValidators: true }
        );

        if (!region) {
            return NextResponse.json({ error: 'Left region not found' }, { status: 404 });
        }

        // Emit updated data
        const all = await LeftElectionRegion.find({}).sort({ createdAt: 1 }).lean();
        await socketEmit('left-regions:updated', all);

        return NextResponse.json(region);
    } catch (error) {
        console.error('PUT /api/left-regions/[id] error:', error);
        return NextResponse.json({ error: 'Failed to update left region' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> } | { params: { id: string } }
) {
    try {
        await connectDB();

        let id: string;
        if ('then' in context.params) {
            id = (await context.params).id;
        } else {
            id = (context as any).params.id;
        }

        const region = await LeftElectionRegion.findByIdAndDelete(id);

        if (!region) {
            return NextResponse.json({ error: 'Left region not found' }, { status: 404 });
        }

        // Emit updated data
        const all = await LeftElectionRegion.find({}).sort({ createdAt: 1 }).lean();
        await socketEmit('left-regions:updated', all);

        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error) {
        console.error('DELETE /api/left-regions/[id] error:', error);
        return NextResponse.json({ error: 'Failed to delete left region' }, { status: 500 });
    }
}
