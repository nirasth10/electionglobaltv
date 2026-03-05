'use client';

import { useElection } from '@/app/context/ElectionContext';
import { useSocket } from '@/app/context/SocketContext';
import ElectionTicker from './ElectionTicker';
import BreakingNews from './BreakingNews';
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
      <BreakingNews />
      <ElectionTicker />

      {/* Live connection indicator */}
      <div className="fixed top-3 left-3 z-40 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/50 backdrop-blur border border-white/10 text-[10px] font-bold mukta-bold">
        {isLive ? (
          <><Wifi size={10} className="text-emerald-400" /><span className="text-emerald-400">LIVE</span></>
        ) : (
          <><WifiOff size={10} className="text-red-400" /><span className="text-red-400">Offline</span></>
        )}
      </div>

      {/* Main election widget — top right on desktop, centered on mobile */}
      <div className="fixed top-4 right-4 sm:top-8 sm:right-16 md:right-24 xl:right-[8vw] z-50 font-sans antialiased mukta-regular">
        <div className="w-[calc(100vw-2rem)] sm:w-[320px] max-h-[calc(100vh-130px)] bg-[#0a1120]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden">

          {/* Header */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-white/5 bg-gradient-to-r from-white/[0.03] to-transparent">
            <div className="flex justify-between items-center gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-[11px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-1 mukta-semibold">निर्वाचन क्षेत्र</p>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mukta-extrabold truncate">{currentRegion.nepaliName}</h1>
                <p className="text-[10px] text-slate-500 mukta-semibold mt-0.5">{currentRegion.name}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 mukta-semibold">कुल गणना</div>
                <div className="text-xl sm:text-2xl font-black text-white mukta-extrabold">{currentRegion.totalCountPercent}%</div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full mukta-bold ${currentRegion.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                  currentRegion.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-orange-500/20 text-orange-400'
                  }`}>
                  {currentRegion.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Column Labels */}
          <div className="px-4 sm:px-6 py-2 flex items-center justify-between bg-white/[0.02] border-b border-white/5">
            <span className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mukta-bold">उम्मेदवार</span>
            <span className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mukta-bold">मत (VOTES)</span>
          </div>

          {/* Candidate list */}
          <div className="p-2 sm:p-3 space-y-1.5 overflow-y-auto flex-1">
            {currentRegion.candidates.map((candidate) => (
              <div
                key={candidate._id}
                className="flex items-center p-2 sm:p-3 rounded-xl hover:bg-white/[0.05] transition-colors group gap-2 sm:gap-3"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {candidate.imageUrl ? (
                    <img
                      src={candidate.imageUrl}
                      alt={candidate.name}
                      className="w-11 h-11 sm:w-13 sm:h-13 rounded-full object-cover border-2 border-white/10 group-hover:border-white/25 transition-all"
                    />
                  ) : (
                    <div
                      className="w-11 h-11 sm:w-13 sm:h-13 rounded-full border-2 border-white/10 flex items-center justify-center text-lg font-bold"
                      style={{ backgroundColor: candidate.color + '33', color: candidate.color }}
                    >
                      {candidate.name.charAt(0)}
                    </div>
                  )}
                  {/* Party Flag Badge */}
                  <div
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#0a1120] flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: candidate.color }}
                  >
                    {candidate.partySymbol && candidate.partySymbol.startsWith('http') && (
                      <img src={candidate.partySymbol} alt={candidate.party} className="w-full h-full object-cover" />
                    )}
                  </div>
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm sm:text-base font-bold text-white truncate leading-tight mukta-bold">{candidate.name}</h2>
                  <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mukta-semibold">{candidate.party}</p>
                </div>

                <div className="hidden sm:block h-9 w-[1px] bg-white/10 mx-2" />

                {/* Votes */}
                <div className="text-right w-20 sm:w-24 flex-shrink-0">
                  <div className="text-lg sm:text-2xl font-black text-white tabular-nums tracking-tighter leading-none mukta-extrabold">
                    {candidate.votes.toLocaleString()}
                  </div>
                  <div className="text-[9px] sm:text-[11px] font-bold text-emerald-400 mukta-bold mt-0.5">▲ {candidate.changeVotes}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-3 bg-black/40 border-t border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-200 uppercase tracking-widest mukta-bold">Live Updates</span>
            </div>
            {/* <Link
              href="/dashboard"
              className="text-[9px] sm:text-[11px] font-bold text-blue-400 hover:text-blue-300 uppercase italic tracking-wide mukta-semibold transition"
            >
              📊 Admin Panel
            </Link> */}
          </div>
        </div>
      </div>
    </div>
  );
}