'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useSocket } from './SocketContext';

export interface ITickerItem {
    _id: string;
    label: string;
    region: string;
    party: string;
    votes: number;
    changeVotes: number;
    color: string;
    imageUrl?: string;
    isActive: boolean;
    order: number;
}

interface TickerContextType {
    items: ITickerItem[];
    activeItems: ITickerItem[];
    isLoading: boolean;
    refreshTicker: () => Promise<void>;
    createItem: (data: Partial<ITickerItem>) => Promise<void>;
    updateItem: (id: string, data: Partial<ITickerItem>) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
}

const TickerContext = createContext<TickerContextType | undefined>(undefined);

export const TickerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<ITickerItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { socket } = useSocket();

    const activeItems = items.filter((i) => i.isActive);

    const refreshTicker = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/ticker');
            if (!res.ok) throw new Error('Failed to fetch ticker');
            setItems(await res.json());
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createItem = useCallback(async (data: Partial<ITickerItem>) => {
        const res = await fetch('/api/ticker', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to create ticker item');
    }, []);

    const updateItem = useCallback(async (id: string, data: Partial<ITickerItem>) => {
        const res = await fetch(`/api/ticker/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update ticker item');
    }, []);

    const deleteItem = useCallback(async (id: string) => {
        const res = await fetch(`/api/ticker/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete ticker item');
    }, []);

    useEffect(() => { refreshTicker(); }, [refreshTicker]);

    useEffect(() => {
        if (!socket) return;
        const handler = (data: ITickerItem[]) => setItems(data);
        socket.on('ticker:updated', handler);
        return () => { socket.off('ticker:updated', handler); };
    }, [socket]);

    return (
        <TickerContext.Provider value={{ items, activeItems, isLoading, refreshTicker, createItem, updateItem, deleteItem }}>
            {children}
        </TickerContext.Provider>
    );
};

export const useTicker = () => {
    const ctx = useContext(TickerContext);
    if (!ctx) throw new Error('useTicker must be used within TickerProvider');
    return ctx;
};
