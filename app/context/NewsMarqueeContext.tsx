'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';

export interface INewsMarqueeItem {
    _id: string;
    text: string;
    isActive: boolean;
    order: number;
}

interface NewsMarqueeContextType {
    heading: string;
    items: INewsMarqueeItem[];
    activeItems: INewsMarqueeItem[];
    isLoading: boolean;
    refreshNews: () => Promise<void>;
    updateHeading: (newHeading: string) => Promise<void>;
    createItem: (item: Partial<INewsMarqueeItem>) => Promise<void>;
    updateItem: (id: string, updates: Partial<INewsMarqueeItem>) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
}

const NewsMarqueeContext = createContext<NewsMarqueeContextType>({
    heading: 'ELECTION UPDATE 2082',
    items: [],
    activeItems: [],
    isLoading: true,
    refreshNews: async () => { },
    updateHeading: async () => { },
    createItem: async () => { },
    updateItem: async () => { },
    deleteItem: async () => { },
});

export function NewsMarqueeProvider({ children }: { children: React.ReactNode }) {
    const [heading, setHeading] = useState('ELECTION UPDATE 2082');
    const [items, setItems] = useState<INewsMarqueeItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { socket } = useSocket();

    const fetchData = async () => {
        try {
            const [newsRes, settingsRes] = await Promise.all([
                fetch('/api/news-marquee'),
                fetch('/api/news-marquee/settings')
            ]);

            if (newsRes.ok) {
                const data = await newsRes.json();
                setItems(data);
            }
            if (settingsRes.ok) {
                const settings = await settingsRes.json();
                if (settings?.heading) {
                    setHeading(settings.heading);
                }
            }
        } catch (error) {
            console.error('Error fetching marquee news:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchData();
    }, []);

    // Socket.IO
    useEffect(() => {
        if (!socket) return;
        const handler = () => fetchData();
        socket.on('news_marquee_updated', handler);
        return () => { socket.off('news_marquee_updated', handler); };
    }, [socket]);

    const activeItems = items.filter(i => i.isActive).sort((a, b) => a.order - b.order);

    const updateHeading = async (newHeading: string) => {
        const res = await fetch('/api/news-marquee/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ heading: newHeading }),
        });
        if (!res.ok) throw new Error('Failed to update heading');
        await fetchData();
    };

    const createItem = async (item: Partial<INewsMarqueeItem>) => {
        const res = await fetch('/api/news-marquee', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
        });
        if (!res.ok) throw new Error('Failed to create news item');
        await fetchData();
    };

    const updateItem = async (id: string, updates: Partial<INewsMarqueeItem>) => {
        const res = await fetch(`/api/news-marquee/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error('Failed to update news item');
        await fetchData();
    };

    const deleteItem = async (id: string) => {
        const res = await fetch(`/api/news-marquee/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete news item');
        await fetchData();
    };

    return (
        <NewsMarqueeContext.Provider value={{ heading, items, activeItems, isLoading, refreshNews: fetchData, updateHeading, createItem, updateItem, deleteItem }}>
            {children}
        </NewsMarqueeContext.Provider>
    );
}

export const useNewsMarquee = () => useContext(NewsMarqueeContext);
