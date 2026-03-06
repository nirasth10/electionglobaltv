import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import BreakingNews from '@/models/BreakingNews';
import { socketEmit } from '@/app/lib/socketEmit';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await req.json();

        const updatedItem = await BreakingNews.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true }
        );

        if (!updatedItem) {
            return NextResponse.json({ error: 'News not found' }, { status: 404 });
        }

        await socketEmit('news_updated');

        return NextResponse.json(updatedItem);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update news' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;

        const deletedItem = await BreakingNews.findByIdAndDelete(id);

        if (!deletedItem) {
            return NextResponse.json({ error: 'News not found' }, { status: 404 });
        }

        await socketEmit('news_updated');

        return NextResponse.json({ message: 'News deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete news' }, { status: 500 });
    }
}
