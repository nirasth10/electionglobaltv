import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import NewsMarquee from '@/models/NewsMarquee';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();
        const news = await NewsMarquee.find().sort({ order: 1 });
        return NextResponse.json(news);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch marquee news' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();

        const maxOrderNews = await NewsMarquee.findOne().sort({ order: -1 });
        const nextOrder = maxOrderNews ? maxOrderNews.order + 1 : 0;

        const newItem = new NewsMarquee({ ...body, order: nextOrder });
        await newItem.save();

        const io = (globalThis as any)._io;
        if (io) {
            io.emit('news_marquee_updated');
        }

        return NextResponse.json(newItem, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create marquee news' }, { status: 500 });
    }
}
