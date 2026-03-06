'use client';

import { useNewsMarquee } from '@/app/context/NewsMarqueeContext';

const NewsMarquee = () => {
    const { activeItems, heading } = useNewsMarquee();

    if (activeItems.length === 0) return null;

    // Split heading by spaces to place them on new lines if needed, 
    // or just render it as is. The image shows:
    // ELECTION
    // UPDATE
    // 2082
    const headingWords = heading.split(' ');

    const totalChars = activeItems.reduce((sum, item) => sum + item.text.length, 0);
    const marqueeDuration = Math.max(30, Math.round(totalChars * 0.15));

    return (
        <div className="fixed bottom-[116px] sm:bottom-[144px] left-lg left-0 w-full z-40 bg-[#e4e4e4] shadow-md flex overflow-hidden h-12 sm:h-[54px] font-sans antialiased border-y-[2px] border-[#0a1120]/50">
            {/* Heading Section */}
            <div className="bg-white flex flex-col justify-center px-3 sm:px-6 flex-shrink-0 z-20 relative shadow-[4px_0_10px_rgba(0,0,0,0.15)] h-full min-w-[110px] sm:min-w-[170px] border-r border-[#0a1120]/20">
                <h1 className="text-[10px] sm:text-[14px] font-black leading-[1.1] text-[#b91c1c] uppercase tracking-wide mukta-extrabold text-left">
                    {headingWords.map((word, i) => (
                        <span key={i} className="block">{word}</span>
                    ))}
                </h1>
            </div>

            {/* Ticker Section */}
            <div className="flex-1 flex items-center overflow-hidden relative bg-[#e4e4e4]">
                <div
                    className="whitespace-nowrap flex absolute animate-marquee2 h-full items-center"
                    style={{ animationDuration: `${marqueeDuration}s` }}
                >
                    {activeItems.map((item, index) => (
                        <span key={`${item._id}-${index}`} className="flex items-center text-[#0a1120] text-[15px] sm:text-[20px] font-bold mukta-bold leading-none translate-y-[2px]">
                            {index > 0 && (
                                <span className="inline-block w-8 sm:w-16"></span>
                            )}
                            {item.text}
                            <span className="inline-block w-8 sm:w-16"></span>
                            <span className="text-[#b91c1c] text-xs">◆</span>
                        </span>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes marquee2 {
                    0% { transform: translateX(100vw); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee2 {
                    left: 0;
                    animation-name: marquee2;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                    width: max-content;
                }
                .animate-marquee2:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
};

export default NewsMarquee;
