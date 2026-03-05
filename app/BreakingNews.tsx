'use client';

import { useNews } from '@/app/context/NewsContext';

const BreakingNews = () => {
    const { activeItems } = useNews();

    if (activeItems.length === 0) return null;

    return (
        <div className="fixed bottom-0 left-0 w-full z-40 font-sans antialiased mukta-regular">
            <div className="h-8 sm:h-10 bg-red-600 border-t border-b border-white/20 shadow-lg flex overflow-hidden">
                <div className="bg-gradient-to-r from-red-800 to-red-600 px-4 sm:px-6 flex items-center border-r border-white/20 shadow-xl flex-shrink-0 z-10 relative">
                    <span className="flex h-2.5 w-2.5 relative mr-2 sm:mr-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                    </span>
                    <h2 className="text-xs sm:text-sm font-black text-white mukta-extrabold uppercase tracking-widest whitespace-nowrap drop-shadow-sm">
                        BREAKING NEWS
                    </h2>
                    {/* Corner fold effect */}
                    <div className="absolute right-[-10px] top-0 bottom-0 w-[10px] bg-red-800 flex flex-col justify-between">
                        <div className="border-t-[16px] sm:border-t-[20px] border-l-[10px] border-t-red-900 border-l-transparent"></div>
                        <div className="border-b-[16px] sm:border-b-[20px] border-l-[10px] border-b-red-900 border-l-transparent"></div>
                    </div>
                </div>

                <div className="flex-1 flex items-center overflow-hidden bg-white/10 ml-2 relative">
                    <div className="whitespace-nowrap flex absolute animate-marquee h-full items-center">
                        {activeItems.map((item, index) => (
                            <span key={`${item._id}-${index}`} className="flex items-center text-white text-sm sm:text-base mukta-bold">
                                {index > 0 && (
                                    <img src="/favicon.ico" alt="separator" className="w-4 h-4 mx-6 object-contain drop-shadow" />
                                )}
                                {item.text}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(100vw); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    left: 0;
                    animation: marquee 30s linear infinite;
                    width: max-content;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
};

export default BreakingNews;
