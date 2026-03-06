import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import BreakingNews from '@/models/BreakingNews';
import { socketEmit } from '@/app/lib/socketEmit';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();
        const news = await BreakingNews.find().sort({ order: 1 });
        return NextResponse.json(news);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();

        // Find max order to put the new one at the end
        const maxOrderNews = await BreakingNews.findOne().sort({ order: -1 });
        const nextOrder = maxOrderNews ? maxOrderNews.order + 1 : 0;

        const newItem = new BreakingNews({ ...body, order: nextOrder });
        await newItem.save();

        await socketEmit('news_updated');

        return NextResponse.json(newItem, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create news' }, { status: 500 });
    }
}
