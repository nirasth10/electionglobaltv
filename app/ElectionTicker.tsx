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
      <div className="h-24 bg-[#0a1120]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex overflow-hidden">
        
        {/* Left Section: Branding */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 flex flex-col justify-center items-center min-w-[180px] border-r border-white/10 shadow-xl">
          <p className="text-[10px] font-bold text-white/80 uppercase tracking-[0.2em] leading-none mb-1 mukta-semibold">Global TV</p>
          <h1 className="text-xl font-black text-white leading-tight text-center mukta-extrabold uppercase">
            Election <br /> 2026
          </h1>
        </div>

        {/* Region Info */}
        <div className="px-8 flex flex-col justify-center border-r border-white/5 bg-white/[0.02] min-w-[220px]">
          <p className="text-[11px] font-bold text-blue-400 uppercase tracking-widest mukta-bold">निर्वाचन क्षेत्र (REGION)</p>
          <h2 className="text-2xl font-black text-white mukta-extrabold">झापा-५</h2>
        </div>

        {/* Scrolling Parties Section */}
        <div className="flex-1 flex items-center overflow-x-auto no-scrollbar gap-4 px-6 bg-gradient-to-r from-transparent via-white/[0.01] to-transparent">
          {candidates.map((item) => (
            <div 
              key={item.id} 
              className="flex items-center min-w-[240px] h-16 bg-white/[0.03] border border-white/5 rounded-xl px-4 hover:bg-white/[0.07] transition-all group"
            >
              {/* Party Indicator Color Block */}
              <div 
                className="w-2 h-10 rounded-full mr-4 shadow-[0_0_15px_rgba(0,0,0,0.3)]" 
                style={{ backgroundColor: item.color }}
              />
              
              <div className="flex-1">
                <h3 className="text-lg font-black text-white mukta-extrabold leading-none group-hover:text-blue-300 transition-colors">
                  {item.party}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase mukta-semibold">Status: </span>
                  <span className="text-[11px] font-bold text-emerald-400 animate-pulse mukta-bold">▲ {item.sub}</span>
                </div>
              </div>

              {/* Vote Count */}
              <div className="text-right ml-4">
                <div className="text-xl font-black text-white tabular-nums tracking-tighter mukta-extrabold leading-none">
                  {item.votes.toLocaleString()}
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase mukta-bold">Votes</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Section: Status Indicator */}
        <div className="px-8 flex items-center bg-black/40 border-l border-white/10">
          <div className="flex flex-col items-end">
             <div className="flex items-center gap-2 mb-1">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest mukta-bold">Live Data</span>
             </div>
             <p className="text-[14px] font-black text-white mukta-extrabold leading-none">६५.४%</p>
             <p className="text-[9px] text-slate-500 uppercase mukta-semibold">Total Counted</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ElectionTicker;