'use client';

import { useElection } from '@/app/context/ElectionContext';
import { useSocket } from '@/app/context/SocketContext';
import ElectionTicker from './ElectionTicker';
import BreakingNews from './BreakingNews';
import ElectionWidget from './ElectionWidget';
import Link from 'next/link';
import { Wifi, WifiOff } from 'lucide-react';

export default function ElectionDisplayPage() {
  const { currentRegion, isLoading } = useElection();
  const { connected, socketUnavailable } = useSocket();
  // On Vercel (no socket server), treat polling as "live"
  const isLive = connected || socketUnavailable;

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl font-semibold mukta-semibold text-slate-300">Loading election data…</p>
        </div>
      </div>
    );
  }

  if (!currentRegion) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-white text-center space-y-4">
          <p className="text-xl text-slate-400 mukta-semibold">No election data available.</p>
          <Link href="/dashboard" className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition mukta-bold">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full pb-24 bg-transparent text-white">
      <ElectionTicker />
      <BreakingNews />

      {/* Live connection indicator */}
      <div className="fixed top-3 left-3 z-40 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/50 backdrop-blur border border-white/10 text-[10px] font-bold mukta-bold">
        {isLive ? (
          <><Wifi size={10} className="text-emerald-400" /><span className="text-emerald-400">LIVE</span></>
        ) : (
          <><WifiOff size={10} className="text-red-400" /><span className="text-red-400">Offline</span></>
        )}
      </div>

      {/* Main election widget */}
      <ElectionWidget />
    </div>
  );
}