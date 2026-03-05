import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ElectionRegion from '@/models/ElectionRegion';
import TickerItem from '@/models/TickerItem';

export const dynamic = 'force-dynamic';

const SEED_REGIONS = [
    {
        name: 'Jhapa-5',
        nepaliName: 'झापा-५',
        totalCountPercent: 65.4,
        status: 'active',
        isCurrentDisplay: true,
        candidates: [
            {
                name: 'केपी शर्मा ओली',
                party: 'CPN-UML',
                votes: 12450,
                changeVotes: 120,
                color: '#ef4444',
                imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/KP_Sharma_Oli.jpg/440px-KP_Sharma_Oli.jpg',
                partySymbol: '🔴',
            },
            {
                name: 'शेर बहादुर देउवा',
                party: 'NC',
                votes: 11890,
                changeVotes: 85,
                color: '#22c55e',
                imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Sher_Bahadur_Deuba_2022.jpg/440px-Sher_Bahadur_Deuba_2022.jpg',
                partySymbol: '🌳',
            },
            {
                name: 'पुष्पकमल दाहाल',
                party: 'CPN-MC',
                votes: 9430,
                changeVotes: 42,
                color: '#dc2626',
                imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Pushpa_Kamal_Dahal_2016.jpg/440px-Pushpa_Kamal_Dahal_2016.jpg',
                partySymbol: '⭐',
            },
            {
                name: 'रवि लामिछाने',
                party: 'RSP',
                votes: 8120,
                changeVotes: 310,
                color: '#06b6d4',
                imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Rabi_Lamichhane.jpg/440px-Rabi_Lamichhane.jpg',
                partySymbol: '🔵',
            },
        ],
    },
    {
        name: 'Kathmandu-1',
        nepaliName: 'काठमाडौं-१',
        totalCountPercent: 72.1,
        status: 'active',
        isCurrentDisplay: false,
        candidates: [
            {
                name: 'बाबुराम भट्टराई',
                party: 'JSP',
                votes: 14200,
                changeVotes: 200,
                color: '#f59e0b',
                imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Baburam_Bhattarai.jpg/440px-Baburam_Bhattarai.jpg',
                partySymbol: '🟡',
            },
            {
                name: 'प्रचण्ड उम्मेदवार',
                party: 'CPN-UML',
                votes: 13500,
                changeVotes: 150,
                color: '#ef4444',
                imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
                partySymbol: '🔴',
            },
        ],
    },
];

const SEED_TICKER = [
    { label: 'LIVE', region: 'झापा-५', party: 'CPN-UML', votes: 12450, changeVotes: 120, color: '#ef4444', isActive: true, order: 0 },
    { label: 'LIVE', region: 'झापा-५', party: 'NC', votes: 11890, changeVotes: 85, color: '#22c55e', isActive: true, order: 1 },
    { label: 'LIVE', region: 'झापा-५', party: 'CPN-MC', votes: 9430, changeVotes: 42, color: '#dc2626', isActive: true, order: 2 },
    { label: 'LIVE', region: 'झापा-५', party: 'RSP', votes: 8120, changeVotes: 310, color: '#06b6d4', isActive: true, order: 3 },
    { label: 'UPDATE', region: 'काठमाडौं-१', party: 'JSP', votes: 14200, changeVotes: 200, color: '#f59e0b', isActive: true, order: 4 },
    { label: 'UPDATE', region: 'काठमाडौं-१', party: 'CPN-UML', votes: 13500, changeVotes: 150, color: '#ef4444', isActive: true, order: 5 },
];

export async function POST() {
    try {
        await connectDB();

        const regionCount = await ElectionRegion.countDocuments();
        const tickerCount = await TickerItem.countDocuments();

        if (regionCount > 0 || tickerCount > 0) {
            return NextResponse.json({ message: 'Database already seeded', seeded: false });
        }

        await ElectionRegion.insertMany(SEED_REGIONS);
        await TickerItem.insertMany(SEED_TICKER);

        return NextResponse.json({ message: 'Database seeded successfully', seeded: true });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({ error: 'Seeding failed' }, { status: 500 });
    }
}

// Force reseed (clears existing data)
export async function DELETE() {
    try {
        await connectDB();
        await ElectionRegion.deleteMany({});
        await TickerItem.deleteMany({});
        await ElectionRegion.insertMany(SEED_REGIONS);
        await TickerItem.insertMany(SEED_TICKER);
        return NextResponse.json({ message: 'Database reseeded successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Reseed failed' }, { status: 500 });
    }
}
