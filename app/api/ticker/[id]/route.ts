import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import TickerItem from '@/models/TickerItem';
import { socketEmit } from '@/app/lib/socketEmit';

export const dynamic = 'force-dynamic';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await request.json();
        const updated = await TickerItem.findByIdAndUpdate(id, body, { new: true });
        if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const all = await TickerItem.find({}).sort({ order: 1 }).lean();
        await socketEmit('ticker:updated', all);

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update ticker item' }, { status: 500 });
    }
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const deleted = await TickerItem.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const all = await TickerItem.find({}).sort({ order: 1 }).lean();
        await socketEmit('ticker:updated', all);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete ticker item' }, { status: 500 });
    }
}
