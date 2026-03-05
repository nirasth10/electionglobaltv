'use client';

import { useTicker } from '@/app/context/TickerContext';
import Link from 'next/link';
import { useElection } from './context/ElectionContext';
import { useNews } from '@/app/context/NewsContext';

const ElectionTicker = () => {
  const { activeItems } = useTicker();
  const { currentRegion } = useElection();
  const { activeItems: newsItems } = useNews();
  const hasNews = newsItems.length > 0;

  return (
    <div className={`fixed left-0 w-full z-50 font-sans antialiased mukta-regular transition-all duration-500 ${hasNews ? 'bottom-[32px] sm:bottom-[40px]' : 'bottom-0'}`}>
      <div className="h-[80px] sm:h-[96px] bg-[#0a1120]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex overflow-hidden">

        {/* Branding */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 px-3 sm:px-6 flex flex-col justify-center items-center min-w-[110px] sm:min-w-[170px] border-r border-white/10 shadow-xl flex-shrink-0">
          <p className="text-[8px] sm:text-[10px] font-bold text-white/80 uppercase tracking-[0.2em] leading-none mb-1 mukta-semibold"></p>
          <h1 className="text-sm sm:text-xl font-black text-white leading-tight text-center mukta-extrabold uppercase">
            Election<br />2083
          </h1>
        </div>

        {/* Region badge */}
        {currentRegion && (
          <div className="px-3 sm:px-6 flex flex-col justify-center border-r border-white/5 bg-white/[0.02] min-w-[120px] sm:min-w-[200px] flex-shrink-0">
            <p className="text-[9px] sm:text-[11px] font-bold text-blue-400 uppercase tracking-widest mukta-bold">क्षेत्र / REGION</p>
            <h2 className="text-base sm:text-2xl font-black text-white mukta-extrabold truncate">{currentRegion.nepaliName}</h2>
          </div>
        )}

        {/* Scrolling items */}
        <div className="flex-1 flex items-center overflow-x-auto no-scrollbar gap-2 sm:gap-4 px-3 sm:px-5 bg-gradient-to-r from-transparent via-white/[0.01] to-transparent">
          {activeItems.length === 0 ? (
            <span className="text-slate-500 text-xs mukta-semibold">No ticker items — add some in the dashboard</span>
          ) : (
            activeItems.map((item) => (
              <div
                key={item._id}
                className="flex items-center min-w-[190px] sm:min-w-[230px] h-14 sm:h-16 bg-white/[0.03] border border-white/5 rounded-xl px-3 sm:px-4 hover:bg-white/[0.07] transition-all group gap-2 sm:gap-3 flex-shrink-0"
              >
                {/* 
                <div
                  className="w-2 h-8 sm:h-10 border border-white/10 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                */}
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.party}
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-white/20 object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase mukta-semibold">{item.label} • {item.region}</p>
                  <h3 className="text-sm sm:text-base font-black text-white mukta-extrabold leading-none group-hover:text-blue-300 transition-colors truncate">
                    {item.party}
                  </h3>
                  <span className="text-[9px] sm:text-[10px] font-bold text-emerald-400 mukta-bold">▲ {item.changeVotes}</span>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-base sm:text-lg font-black text-white tabular-nums tracking-tighter mukta-extrabold leading-none">
                    {item.votes.toLocaleString()}
                  </div>
                  <p className="text-[8px] sm:text-[9px] text-slate-500 font-bold uppercase mukta-bold">Votes</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: live status + admin */}
        <div className="px-3 sm:px-6 flex items-center bg-black/40 border-l border-white/10 gap-3 flex-shrink-0">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <span className="flex h-2 w-2 relative flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-200 uppercase tracking-widest mukta-bold whitespace-nowrap">Live</span>
            </div>
            {currentRegion && (
              <>
                <p className="text-[12px] sm:text-[14px] font-black text-white mukta-extrabold leading-none">{currentRegion.totalCountPercent}%</p>
                <p className="text-[7px] sm:text-[9px] text-slate-500 uppercase mukta-semibold whitespace-nowrap">Counted</p>
              </>
            )}
          </div>
          {/* <Link
            href="/dashboard"
            className="hidden sm:block ml-2 px-3 py-2 bg-blue-600/50 hover:bg-blue-600 text-white text-[10px] font-bold rounded-lg transition mukta-bold whitespace-nowrap"
          >
            Admin
          </Link> */}
        </div>
      </div>
    </div>
  );
};

export default ElectionTicker;