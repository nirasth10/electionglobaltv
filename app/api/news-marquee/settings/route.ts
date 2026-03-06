import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import NewsMarqueeSettings from '@/models/NewsMarqueeSettings';
import { socketEmit } from '@/app/lib/socketEmit';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();
        let settings = await NewsMarqueeSettings.findOne();
        if (!settings) {
            settings = await NewsMarqueeSettings.create({ heading: 'ELECTION UPDATE 2082' });
        }
        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();

        let settings = await NewsMarqueeSettings.findOne();
        if (settings) {
            settings.heading = body.heading;
            await settings.save();
        } else {
            settings = await NewsMarqueeSettings.create({ heading: body.heading });
        }

        await socketEmit('news_marquee_updated');

        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
