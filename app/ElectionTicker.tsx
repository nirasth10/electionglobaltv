'use client';

const candidates = [
  { id: 1, party: 'CPN-UML', votes: 12450, sub: 120, color: '#ef4444' },
  { id: 2, party: 'NC', votes: 11890, sub: 85, color: '#22c55e' },
  { id: 3, party: 'MC', votes: 9430, sub: 42, color: '#dc2626' },
  { id: 4, party: 'RSP', votes: 8120, sub: 310, color: '#06b6d4' },
];

const ElectionTicker = () => {
  return (
    <div className="fixed bottom-0 left-0 w-full z-50 font-sans antialiased mukta-regular">
      <div className="h-[80px] sm:h-[96px] bg-[#0a1120]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex overflow-hidden">
        
        {/* Left Section: Branding */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-3 sm:px-6 flex flex-col justify-center items-center min-w-[120px] sm:min-w-[180px] border-r border-white/10 shadow-xl">
          <p className="text-[8px] sm:text-[10px] font-bold text-white/80 uppercase tracking-[0.2em] leading-none mb-1 mukta-semibold"></p>
          <h1 className="text-base sm:text-xl font-black text-white leading-tight text-center mukta-extrabold uppercase">
            Election <br /> 2026
          </h1>
        </div>

        {/* Region Info */}
        <div className="px-4 sm:px-8 flex flex-col justify-center border-r border-white/5 bg-white/[0.02] min-w-[140px] sm:min-w-[220px]">
          <p className="text-[9px] sm:text-[11px] font-bold text-blue-400 uppercase tracking-widest mukta-bold">निर्वाचन क्षेत्र (REGION)</p>
          <h2 className="text-lg sm:text-2xl font-black text-white mukta-extrabold">झापा-५</h2>
        </div>

        {/* Scrolling Parties Section */}
        <div className="flex-1 flex items-center overflow-x-auto no-scrollbar gap-2 sm:gap-4 px-4 sm:px-6 bg-gradient-to-r from-transparent via-white/[0.01] to-transparent">
          {candidates.map((item) => (
            <div 
              key={item.id} 
              className="flex items-center min-w-[200px] sm:min-w-[240px] h-14 sm:h-16 bg-white/[0.03] border border-white/5 rounded-xl px-3 sm:px-4 hover:bg-white/[0.07] transition-all group gap-2 sm:gap-3"
            >
              {/* Party Indicator Color Block */}
              <div 
                className="w-2 h-8 sm:h-10 rounded-full flex-shrink-0 shadow-[0_0_15px_rgba(0,0,0,0.3)]" 
                style={{ backgroundColor: item.color }}
              />
              
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-black text-white mukta-extrabold leading-none group-hover:text-blue-300 transition-colors truncate">
                  {item.party}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase mukta-semibold whitespace-nowrap">Status: </span>
                  <span className="text-[9px] sm:text-[11px] font-bold text-emerald-400 animate-pulse mukta-bold whitespace-nowrap">▲ {item.sub}</span>
                </div>
              </div>

              {/* Vote Count */}
              <div className="text-right ml-2 sm:ml-4 flex-shrink-0">
                <div className="text-lg sm:text-xl font-black text-white tabular-nums tracking-tighter mukta-extrabold leading-none">
                  {item.votes.toLocaleString()}
                </div>
                <p className="text-[8px] sm:text-[10px] text-slate-500 font-bold uppercase mukta-bold">Votes</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Section: Status Indicator */}
        <div className="px-4 sm:px-8 flex items-center bg-black/40 border-l border-white/10 min-w-[130px] sm:min-w-[150px]">
          <div className="flex flex-col items-end w-full">
             <div className="flex items-center gap-1 sm:gap-2 mb-1">
                <span className="flex h-2 w-2 relative flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-[8px] sm:text-[10px] font-bold text-slate-200 uppercase tracking-widest mukta-bold whitespace-nowrap">Live Data</span>
             </div>
             <p className="text-[12px] sm:text-[14px] font-black text-white mukta-extrabold leading-none">६५.४%</p>
             <p className="text-[7px] sm:text-[9px] text-slate-500 uppercase mukta-semibold whitespace-nowrap">Total Counted</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ElectionTicker;