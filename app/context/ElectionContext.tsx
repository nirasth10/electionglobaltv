'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useSocket } from './SocketContext';

export interface ICandidate {
  _id: string;
  name: string;
  party: string;
  votes: number;
  changeVotes: number;
  color: string;
  imageUrl: string;
  partySymbol?: string;
}

export interface IElectionRegion {
  _id: string;
  name: string;
  nepaliName: string;
  totalCountPercent: any;
  status: 'active' | 'completed' | 'pending';
  isCurrentDisplay: boolean;
  showWidget?: boolean;
  candidates: ICandidate[];
  lastUpdated: string;
}

interface ElectionContextType {
  regions: IElectionRegion[];
  currentRegion: IElectionRegion | null;
  isLoading: boolean;
  error: string | null;
  refreshRegions: () => Promise<void>;
  createRegion: (data: Partial<IElectionRegion>) => Promise<void>;
  updateRegion: (id: string, data: Partial<IElectionRegion>) => Promise<void>;
  deleteRegion: (id: string) => Promise<void>;
  setDisplayRegion: (id: string) => Promise<void>;
}

const ElectionContext = createContext<ElectionContextType | undefined>(undefined);

export const ElectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [regions, setRegions] = useState<IElectionRegion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { socket } = useSocket();

  const currentRegion = regions.find((r) => r.isCurrentDisplay) ?? regions[0] ?? null;

  const refreshRegions = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/regions');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setRegions(data);

      // Auto-seed if empty
      if (data.length === 0) {
        await fetch('/api/seed', { method: 'POST' });
        const res2 = await fetch('/api/regions');
        setRegions(await res2.json());
      }
    } catch (err) {
      setError('Failed to load election data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createRegion = useCallback(async (data: Partial<IElectionRegion>) => {
    const res = await fetch('/api/regions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create region');
    await refreshRegions();
  }, [refreshRegions]);

  const updateRegion = useCallback(async (id: string, data: Partial<IElectionRegion>) => {
    const res = await fetch(`/api/regions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update region');
    await refreshRegions();
  }, [refreshRegions]);

  const deleteRegion = useCallback(async (id: string) => {
    const res = await fetch(`/api/regions/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete region');
    await refreshRegions();
  }, [refreshRegions]);

  const setDisplayRegion = useCallback(async (id: string) => {
    await updateRegion(id, { isCurrentDisplay: true });
  }, [updateRegion]);

  // Initial load
  useEffect(() => {
    refreshRegions();
  }, [refreshRegions]);

  // Socket.IO — instant push (works on local dev with server.js)
  useEffect(() => {
    if (!socket) return;
    const handler = (data: IElectionRegion[]) => setRegions(data);
    socket.on('regions:updated', handler);
    return () => { socket.off('regions:updated', handler); };
  }, [socket]);

  return (
    <ElectionContext.Provider value={{
      regions,
      currentRegion,
      isLoading,
      error,
      refreshRegions,
      createRegion,
      updateRegion,
      deleteRegion,
      setDisplayRegion,
    }}>
      {children}
    </ElectionContext.Provider>
  );
};

export const useElection = () => {
  const ctx = useContext(ElectionContext);
  if (!ctx) throw new Error('useElection must be used within ElectionProvider');
  return ctx;
};
