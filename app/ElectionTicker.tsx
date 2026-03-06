'use client';

import { useTicker } from '@/app/context/TickerContext';
import Link from 'next/link';
import { useElection } from './context/ElectionContext';
import { useNews } from '@/app/context/NewsContext';
import { formatNepaliVotes } from '@/app/lib/nepali';

const ElectionTicker = () => {
  const { activeItems } = useTicker();
  const { currentRegion } = useElection();
  const { activeItems: newsItems } = useNews();
  const hasNews = newsItems.length > 0;

  return (
    <div className="fixed bottom-9 sm:bottom-12 left-0 w-full z-40 font-sans antialiased mukta-regular transition-all duration-500">
      <div className="h-[80px] sm:h-[96px] bg-[#0a1120]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex overflow-hidden">

        {/* Branding */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 px-3 sm:px-6 flex flex-col justify-center items-center min-w-[110px] sm:min-w-[170px] border-r border-white/10 shadow-xl flex-shrink-0">
          <p className="text-[8px] sm:text-[10px] font-bold text-white/80 uppercase tracking-[0.2em] leading-none mb-1 mukta-semibold"></p>
          <h1 className="text-sm sm:text-xl font-black text-white leading-tight text-center mukta-extrabold uppercase">
            Election<br />2082
          </h1>
        </div>

        {/* Region badge */}
        {/* {currentRegion && (
          <div className="px-3 sm:px-6 flex flex-col justify-center border-r border-white/5 bg-white/[0.02] min-w-[120px] sm:min-w-[200px] flex-shrink-0">
            <p className="text-[9px] sm:text-[11px] font-bold text-blue-400 uppercase tracking-widest mukta-bold">क्षेत्र / REGION</p>
            <h2 className="text-base sm:text-2xl font-black text-white mukta-extrabold truncate">{currentRegion.nepaliName}</h2>
          </div>
        )} */}

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
                  {/* <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase mukta-semibold">{item.label} {item.region}</p> */}
                  <h3 className="text-sm sm:text-base font-black text-white mukta-extrabold leading-none group-hover:text-blue-300 transition-colors">
                    {item.party}
                  </h3>
                  {/* <span className="text-[9px] sm:text-[10px] font-bold text-emerald-400 mukta-bold">▲ {item.changeVotes}</span> */}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-base sm:text-lg font-black text-white tabular-nums tracking-tighter mukta-extrabold leading-none">
                    {formatNepaliVotes(item.votes)}
                  </div>
                  <p className="text-[8px] sm:text-[9px] text-slate-500 font-bold uppercase mukta-bold">Votes</p>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default ElectionTicker;