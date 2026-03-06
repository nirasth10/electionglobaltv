'use client';

import { useNews } from '@/app/context/NewsContext';
import { useState, useEffect } from 'react';

const BreakingNews = () => {
    const { activeItems } = useNews();
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            setCurrentTime(`${hours}:${minutes}`);
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    if (activeItems.length === 0) return null;

    // ~0.15s per character gives a slow, readable TV-news pace. Min 40s so even short content isn't rushed.
    const totalChars = activeItems.reduce((sum, item) => sum + item.text.length, 0);
    const marqueeDuration = Math.max(40, Math.round(totalChars * 0.15));

    return (
        <div className="fixed bottom-0 left-0 w-full z-50 bg-white border-y-[2px] sm:border-y-[3px] border-[#131313] shadow-lg flex overflow-hidden font-sans antialiased" style={{ height: '70px' }}>
            {/* Logo Section */}
            <div className="bg-[#051A3B] flex items-center justify-center flex-shrink-0 z-20 relative h-full">
                <img src="/logo.png" alt="Global TV" className="w-auto object-contain px-2 sm:px-3 bg-[#051A3B]" style={{ height: '43px' }} />
            </div>

            {/* Breaking News Label */}


            {/* Ticker Section */}
            <div className="flex-1 flex items-center overflow-hidden relative bg-white border-l border-[#051A3B]/10">
                <div className="whitespace-nowrap flex absolute animate-marquee h-full items-center" style={{ animationDuration: `${marqueeDuration}s` }}>
                    {activeItems.map((item, index) => (
                        <span key={`${item._id}-${index}`} className="flex items-center text-[#051A3B] font-extrabold mukta-bold leading-none translate-y-[2px]" style={{ fontSize: '30px' }}>
                            {index > 0 && (
                                <span className="inline-block w-12 sm:w-24"></span>
                            )}
                            {item.text}
                        </span>
                    ))}
                </div>
            </div>

            {/* Time Section */}
            <div className="relative z-20 flex-shrink-0 flex items-center h-full drop-shadow-[-2px_0px_3px_rgba(0,0,0,0.3)]">
                <div className="time-container bg-gradient-to-b from-[#ffffff] via-[#f1f3f5] to-[#d1d5db] h-full flex items-center pr-3 sm:pr-5 text-[#051A3B] font-extrabold tracking-wide overflow-hidden" style={{ fontSize: '30px' }}>
                    <span className="relative z-10 pl-6 sm:pl-8 lg:pl-10 translate-y-[1px]">{currentTime}</span>
                    {/* Glossy overlay */}
                    <div className="absolute top-0 left-0 w-full h-[45%] bg-gradient-to-b from-white/80 to-transparent pointer-events-none z-0"></div>
                </div>
            </div>

            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(100vw); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    left: 0;
                    animation: marquee 60s linear infinite;
                    width: max-content;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
                .time-container {
                    clip-path: polygon(15px 0, 100% 0, 100% 100%, 0% 100%);
                }
                @media (min-width: 640px) {
                    .time-container {
                        clip-path: polygon(25px 0, 100% 0, 100% 100%, 0% 100%);
                    }
                }
            `}</style>
        </div>
    );
};

export default BreakingNews;
