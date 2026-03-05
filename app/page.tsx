'use client';

import ElectionTicker from './ElectionTicker';

const candidates = [
  { id: 1, name: 'केपी शर्मा ओली', party: 'CPN-UML', votes: 12450, sub: 120, color: '#ef4444', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop' },
  { id: 2, name: 'शेर बहादुर देउवा', party: 'NC', votes: 11890, sub: 85, color: '#22c55e', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop' },
  { id: 3, name: 'पुष्पकमल दाहाल', party: 'MC', votes: 9430, sub: 42, color: '#dc2626', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop' },
  { id: 4, name: 'रवि लामिछाने', party: 'RSP', votes: 8120, sub: 310, color: '#06b6d4', img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop' },
];

export default function IndependentElectionWidget() {
  return (
    <div className="min-h-screen w-full">
      <ElectionTicker />
      <div className="fixed top-4 right-4 sm:top-8 sm:right-8 z-50 font-sans antialiased mukta-regular">
      
      <div className="w-[calc(100vw-2rem)] sm:w-[350px] max-h-[calc(100vh-120px)] bg-[#0a1120]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden">
        
        {/* Main Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-white/5 bg-gradient-to-r from-white/[0.03] to-transparent">
          <div className="flex justify-between items-center gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-[12px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-1 mukta-semibold">निर्वाचन क्षेत्र</p>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mukta-extrabold truncate">झापा-५</h1>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-[10px] sm:text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-1 mukta-semibold">कुल गणना</div>
              <div className="text-xl sm:text-2xl font-black text-white mukta-extrabold">६५.४%</div>
            </div>
          </div>
        </div>

        {/* Column Labels */}
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between bg-white/[0.02] border-b border-white/5">
           <span className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mukta-bold">उम्मेदवार (CANDIDATE)</span>
           <span className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mukta-bold">मत (VOTES)</span>
        </div>

        {/* Candidate List Container */}
        <div className="p-2 sm:p-4 space-y-2 overflow-y-auto">
          {candidates.map((candidate) => (
            <div 
              key={candidate.id} 
              className="flex items-center p-2 sm:p-3 rounded-xl hover:bg-white/[0.05] transition-colors group gap-2 sm:gap-3"
            >
              {/* Avatar - Slightly larger for balance */}
              <div className="relative flex-shrink-0">
                <img 
                  src={candidate.img} 
                  alt={candidate.name} 
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all border-2 border-white/10" 
                />
                <div 
                  className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-[#0a1120]" 
                  style={{ backgroundColor: candidate.color }}
                />
              </div>

              {/* Name and Party - Increased Font Sizes */}
              <div className="flex-1 min-w-0 overflow-hidden">
                <h2 className="text-sm sm:text-lg font-bold text-white truncate leading-tight tracking-tight mukta-bold">
                  {candidate.name}
                </h2>
                <p className="text-[10px] sm:text-[12px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 mukta-semibold">
                  {candidate.party}
                </p>
              </div>

              {/* Vertical Separator */}
              <div className="hidden sm:block h-10 w-[1px] bg-white/10 mx-3" />

              {/* Votes Section - Increased Font Sizes */}
              <div className="text-right w-20 sm:w-24 flex-shrink-0">
                <div className="text-xl sm:text-2xl font-black text-white tabular-nums tracking-tighter leading-none mukta-extrabold">
                  {candidate.votes.toLocaleString()}
                </div>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[9px] sm:text-[11px] font-bold text-emerald-400 mukta-bold">▲ {candidate.sub}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-black/40 border-t border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="flex h-2.5 w-2.5 relative flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="text-[10px] sm:text-[12px] font-bold text-slate-200 uppercase tracking-widest mukta-bold">Live Updates</span>
          </div>
          <span className="text-[9px] sm:text-[11px] font-bold text-slate-500 uppercase italic tracking-wide mukta-semibold line-clamp-2 sm:line-clamp-1">अन्तिम नतिजा आउन बाँकी</span>
        </div>

    </div>
      </div>
    </div>
  );
}