'use client';

import { useNewsMarquee } from '@/app/context/NewsMarqueeContext';

import { useState, useEffect } from 'react';

const NewsMarquee = () => {
    const { activeItems, heading } = useNewsMarquee();
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (activeItems.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % activeItems.length);
        }, 10000); // 10 seconds

        return () => clearInterval(interval);
    }, [activeItems.length]);

    if (activeItems.length === 0) return null;

    const headingWords = heading.split(' ');
    const currentItem = activeItems[currentIndex];

    return (
        <div className="fixed left-0 w-full z-40 bg-[#e4e4e4] shadow-md flex overflow-hidden font-sans antialiased border-y-[2px] border-[#0a1120]/50" style={{ bottom: '166px', height: '80px' }}>
            {/* Heading Section */}
            <div className="bg-white flex flex-col justify-center px-3 sm:px-6 flex-shrink-0 z-20 relative shadow-[4px_0_10px_rgba(0,0,0,0.15)] h-full min-w-[110px] sm:min-w-[170px] border-r border-[#0a1120]/20">
                <h1 className="font-black leading-[1.1] text-[#b91c1c] uppercase tracking-wide mukta-extrabold text-left" style={{ fontSize: '30px' }}>
                    {headingWords.map((word, i) => (
                        <span key={i} className="block">{word}</span>
                    ))}
                </h1>
            </div>

            {/* Flipper Section */}
            <div className="flex-1 flex items-center overflow-hidden relative bg-[#e4e4e4] px-6">
                <div key={currentItem._id} className="flex w-full animate-flip-up items-center min-w-0">
                    <span className="block w-full text-[#0a1120] font-bold pt-4 pb-1 translate-y-[6px] whitespace-nowrap overflow-hidden text-ellipsis" style={{ fontSize: '50px', fontFamily: 'Preeti, sans-serif', lineHeight: '1.5' }}>
                        {currentItem.text}
                    </span>
                </div>
            </div>

            <style jsx>{`
                @keyframes flip-up {
                    0% {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    10% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    90% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    100% {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                }
                .animate-flip-up {
                    animation: flip-up 10s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default NewsMarquee;
