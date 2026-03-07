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
    <div className="fixed left-0 w-full z-40 font-sans antialiased mukta-regular transition-all duration-500" style={{ bottom: '70px' }}>
      <div className="bg-[#063522] border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex overflow-hidden" style={{ height: '96px' }}>

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
                className="flex items-center min-w-[280px] bg-white/[0.03] border border-white/5 rounded-xl px-4 hover:bg-white/[0.07] transition-all group gap-3 flex-shrink-0" style={{ height: '90px' }}
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
                    className="w-10 h-10 rounded-full border border-white/20 object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0 flex flex-col justify-center mt-1">
                  <h3 className="font-black text-white mukta-extrabold leading-none group-hover:text-blue-300 transition-colors" style={{ fontSize: '30px' }}>
                    {item.party}
                  </h3>
                  <div className="flex items-center gap-1.5 font-bold mukta-bold mt-2" style={{ fontSize: '25px' }}>
                    <span className="text-slate-400">अग्रता</span>
                    <span className="text-emerald-400">▲ {item.changeVotes}</span>
                    {/* <span className="text-slate-600 mx-1">|</span> */}
                    {/* <span className="text-white tabular-nums tracking-tighter">{formatNepaliVotes(item.votes)}</span> */}
                  </div>
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