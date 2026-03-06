'use client';

import { useLeftElection } from '@/app/context/LeftElectionContext';
import { formatNepaliVotes } from '@/app/lib/nepali';

export default function LeftElectionWidget() {
    const { currentLeftRegion } = useLeftElection();

    if (!currentLeftRegion) return null;

    // Hide widget if showWidget is explicitly set to false (defaults to true if undefined)
    if (currentLeftRegion.showWidget === false) return null;

    return (
        <div className="fixed top-4 z-50 font-sans antialiased mukta-regular" style={{ left: '20px' }}>
            <div className="w-[calc(100vw-2rem)] sm:w-[360px] max-h-[calc(100vh-130px)] bg-[#0a1120]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden" style={{ marginTop: '160px' }}>
                {/* Header */}
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-white/5 bg-gradient-to-r from-white/[0.03] to-transparent">
                    <div className="flex justify-between items-center gap-2">
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] sm:text-[11px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-1 mukta-semibold">निर्वाचन क्षेत्र</p>
                            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mukta-extrabold truncate">{currentLeftRegion.nepaliName}</h1>
                            <p className="text-[10px] text-slate-500 mukta-semibold mt-0.5">{currentLeftRegion.name}</p>
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
                    {currentLeftRegion.candidates.map((candidate) => (
                        <div
                            key={candidate._id}
                            className="flex items-center p-2 sm:p-3 rounded-xl hover:bg-white/[0.05] transition-colors group gap-3"
                        >
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                                {candidate.imageUrl ? (
                                    <img
                                        src={candidate.imageUrl}
                                        alt={candidate.name}
                                        className="w-[56px] h-[56px] rounded-full object-cover border-2 border-white/10 group-hover:border-white/25 transition-all"
                                    />
                                ) : (
                                    <div
                                        className="w-[56px] h-[56px] rounded-full border-2 border-white/10 flex items-center justify-center text-xl font-bold"
                                    >
                                        {candidate.name.charAt(0)}
                                    </div>
                                )}
                                {/* Party Flag Badge */}
                                <div
                                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-[#0a1120] flex items-center justify-center overflow-hidden"
                                    style={{ backgroundColor: candidate.color }}
                                >
                                    {candidate.partySymbol && candidate.partySymbol.startsWith('http') && (
                                        <img src={candidate.partySymbol} alt={candidate.party} className="w-full h-full object-cover" />
                                    )}
                                </div>
                            </div>

                            {/* Name */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <h2 className="font-bold text-white truncate leading-none mukta-bold" style={{ fontSize: '25px', paddingBottom: '2px' }}>{candidate.name}</h2>
                                <p className="font-bold text-slate-400 uppercase tracking-wider mukta-semibold truncate" style={{ fontSize: '15px', paddingTop: '2px' }}>{candidate.party}</p>
                            </div>

                            <div className="hidden sm:block h-10 w-[1px] bg-white/10 mx-2 flex-shrink-0" />

                            {/* Votes */}
                            <div className="text-right flex-shrink-0 min-w-[70px]">
                                <div className="font-black text-white tabular-nums tracking-tighter leading-none mukta-extrabold" style={{ fontSize: '26px' }}>
                                    {formatNepaliVotes(candidate.votes)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-4 sm:px-6 py-3 bg-black/40 border-t border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="flex h-2.5 w-2.5 relative flex-shrink-0">
                            {/* <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span> */}
                            {/* <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span> */}
                        </span>
                        {/* <span className="text-[10px] sm:text-[11px] font-bold text-slate-200 uppercase tracking-widest mukta-bold">Live Updates</span> */}
                    </div>
                </div>
            </div>
        </div>
    );
}
