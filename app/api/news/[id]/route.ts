import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import BreakingNews from '@/models/BreakingNews';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const body = await req.json();

        const updatedItem = await BreakingNews.findByIdAndUpdate(
            params.id,
            { $set: body },
            { new: true }
        );

        if (!updatedItem) {
            return NextResponse.json({ error: 'News not found' }, { status: 404 });
        }

        const io = (globalThis as any)._io;
        if (io) {
            io.emit('news_updated');
        }

        return NextResponse.json(updatedItem);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update news' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();

        const deletedItem = await BreakingNews.findByIdAndDelete(params.id);

        if (!deletedItem) {
            return NextResponse.json({ error: 'News not found' }, { status: 404 });
        }

        const io = (globalThis as any)._io;
        if (io) {
            io.emit('news_updated');
        }

        return NextResponse.json({ message: 'News deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete news' }, { status: 500 });
    }
}
