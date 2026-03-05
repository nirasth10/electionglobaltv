import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import TickerItem from '@/models/TickerItem';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();
        const items = await TickerItem.find({}).sort({ order: 1 }).lean();
        return NextResponse.json(items);
    } catch (error) {
        console.error('GET /api/ticker error:', error);
        return NextResponse.json({ error: 'Failed to fetch ticker items' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const count = await TickerItem.countDocuments();
        const item = await TickerItem.create({ ...body, order: count });

        const io = (globalThis as any)._io;
        if (io) {
            const all = await TickerItem.find({}).sort({ order: 1 }).lean();
            io.emit('ticker:updated', all);
        }

        return NextResponse.json(item, { status: 201 });
    } catch (error) {
        console.error('POST /api/ticker error:', error);
        return NextResponse.json({ error: 'Failed to create ticker item' }, { status: 500 });
    }
}
