'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';

export interface INewsItem {
    _id: string;
    text: string;
    isActive: boolean;
    order: number;
}

interface NewsContextType {
    items: INewsItem[];
    activeItems: INewsItem[];
    isLoading: boolean;
    refreshNews: () => Promise<void>;
    createItem: (item: Partial<INewsItem>) => Promise<void>;
    updateItem: (id: string, updates: Partial<INewsItem>) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
}

const NewsContext = createContext<NewsContextType>({
    items: [],
    activeItems: [],
    isLoading: true,
    refreshNews: async () => { },
    createItem: async () => { },
    updateItem: async () => { },
    deleteItem: async () => { },
});

export function NewsProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<INewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { socket } = useSocket();

    const fetchNews = async () => {
        try {
            const res = await fetch('/api/news');
            if (!res.ok) throw new Error('Failed to fetch news items');
            const data = await res.json();
            setItems(data);
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();

        if (socket) {
            socket.on('news_updated', () => {
                fetchNews();
            });
        }

        return () => {
            if (socket) {
                socket.off('news_updated');
            }
        };
    }, [socket]);

    const activeItems = items.filter(i => i.isActive).sort((a, b) => a.order - b.order);

    const createItem = async (item: Partial<INewsItem>) => {
        const res = await fetch('/api/news', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
        });
        if (!res.ok) throw new Error('Failed to create news item');
        await fetchNews();
    };

    const updateItem = async (id: string, updates: Partial<INewsItem>) => {
        const res = await fetch(`/api/news/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error('Failed to update news item');
        await fetchNews();
    };

    const deleteItem = async (id: string) => {
        const res = await fetch(`/api/news/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete news item');
        await fetchNews();
    };

    return (
        <NewsContext.Provider value={{ items, activeItems, isLoading, refreshNews: fetchNews, createItem, updateItem, deleteItem }}>
            {children}
        </NewsContext.Provider>
    );
}

export const useNews = () => useContext(NewsContext);
