'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useSocket } from './SocketContext';

export interface ILeftCandidate {
  _id: string;
  name: string;
  party: string;
  votes: number;
  changeVotes: number;
  color: string;
  imageUrl: string;
  partySymbol?: string;
  isElected?: boolean;
}

export interface ILeftElectionRegion {
  _id: string;
  name: string;
  nepaliName: string;
  totalCountPercent: any;
  status: 'active' | 'completed' | 'pending';
  isCurrentDisplay: boolean;
  showWidget?: boolean;
  candidates: ILeftCandidate[];
  lastUpdated: string;
}

interface LeftElectionContextType {
  leftRegions: ILeftElectionRegion[];
  currentLeftRegion: ILeftElectionRegion | null;
  isLoading: boolean;
  error: string | null;
  refreshLeftRegions: () => Promise<void>;
  createRegion: (data: Partial<ILeftElectionRegion>) => Promise<void>;
  updateRegion: (id: string, data: Partial<ILeftElectionRegion>) => Promise<void>;
  deleteRegion: (id: string) => Promise<void>;
  setDisplayRegion: (id: string) => Promise<void>;
}

const LeftElectionContext = createContext<LeftElectionContextType | undefined>(undefined);

export const LeftElectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [leftRegions, setLeftRegions] = useState<ILeftElectionRegion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { socket, socketUnavailable } = useSocket();

  const currentLeftRegion = leftRegions.find((r) => r.isCurrentDisplay) ?? leftRegions[0] ?? null;

  const refreshLeftRegions = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/left-regions');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setLeftRegions(data);

      // Auto-seed if empty
      if (data.length === 0) {
        await fetch('/api/seed', { method: 'POST' });
        const res2 = await fetch('/api/left-regions');
        setLeftRegions(await res2.json());
      }
    } catch (err) {
      setError('Failed to load election data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createRegion = useCallback(async (data: Partial<ILeftElectionRegion>) => {
    const res = await fetch('/api/left-regions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create region');
    await refreshLeftRegions();
  }, [refreshLeftRegions]);

  const updateRegion = useCallback(async (id: string, data: Partial<ILeftElectionRegion>) => {
    const res = await fetch(`/api/left-regions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update region');
    await refreshLeftRegions();
  }, [refreshLeftRegions]);

  const deleteRegion = useCallback(async (id: string) => {
    const res = await fetch(`/api/left-regions/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete region');
    await refreshLeftRegions();
  }, [refreshLeftRegions]);

  const setDisplayRegion = useCallback(async (id: string) => {
    await updateRegion(id, { isCurrentDisplay: true });
  }, [updateRegion]);

  // Initial load
  useEffect(() => {
    refreshLeftRegions();
  }, [refreshLeftRegions]);

  // Socket.IO — instant push (works on local dev with server.js)
  useEffect(() => {
    if (!socket) return;
    const handler = (data: ILeftElectionRegion[]) => setLeftRegions(data);
    socket.on('left-regions:updated', handler);
    return () => { socket.off('left-regions:updated', handler); };
  }, [socket]);

  // Always poll every 5 seconds — guarantees live updates regardless of socket.
  // Socket push is instant when available; polling fills the gap otherwise.
  useEffect(() => {
    const id = setInterval(() => {
      fetch('/api/left-regions')
        .then(r => r.json())
        .then(data => { if (Array.isArray(data)) setLeftRegions(data); })
        .catch(() => { /* silent */ });
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <LeftElectionContext.Provider value={{
      leftRegions,
      currentLeftRegion,
      isLoading,
      error,
      refreshLeftRegions,
      createRegion,
      updateRegion,
      deleteRegion,
      setDisplayRegion,
    }}>
      {children}
    </LeftElectionContext.Provider>
  );
};

export const useLeftElection = () => {
  const ctx = useContext(LeftElectionContext);
  if (!ctx) throw new Error('useLeftElection must be used within LeftElectionProvider');
  return ctx;
};
