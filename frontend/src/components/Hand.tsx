import React from 'react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

interface HandProps {
    cards: string[]; // Labels like "J♠" or "10♥"
    selectedIndex: number | null;
    onSelect: (index: number) => void;
    isCurrentPlayer: boolean;
}

const Hand: React.FC<HandProps> = ({ cards, selectedIndex, onSelect, isCurrentPlayer }) => {

    // Parse card for visual
    const getCardParts = (c: string) => {
        const suit = c.slice(-1);
        const rank = c.slice(0, -1);
        const isRed = suit === '♥' || suit === '♦';
        return { rank, suit, isRed };
    };

    return (
        <div className="relative flex justify-center items-end h-40 w-full perspective-500">
            {cards.length === 0 && (
                <div className="text-slate-500 font-mono text-sm border-2 border-dashed border-slate-800 rounded-lg p-4">
                    Empty Hand
                </div>
            )}

            <div className="flex -space-x-4 hover:space-x-1 transition-all duration-300 px-8 py-4 bg-black/20 backdrop-blur-xl rounded-full border border-white/5 shadow-2xl overflow-visible">
                {cards.map((card, i) => {
                    const { rank, suit, isRed } = getCardParts(card);
                    const isSelected = selectedIndex === i;
                    const isJack = rank === 'J';
                    const twoEyed = isJack && (suit === '♦' || suit === '♣');

                    return (
                        <motion.button
                            key={`${i}-${card}`}
                            layout
                            initial={{ y: 50, opacity: 0, rotate: -10 + i * 2 }}
                            animate={{
                                y: isSelected ? -30 : 0,
                                opacity: 1,
                                rotate: isSelected ? 0 : (-10 + (i * (20 / cards.length))),
                                scale: isSelected ? 1.2 : 1,
                                zIndex: isSelected ? 50 : i
                            }}
                            whileHover={{ y: -20, rotate: 0, zIndex: 40, scale: 1.1 }}
                            onClick={() => isCurrentPlayer && onSelect(i)}
                            className={cn(
                                "relative w-24 h-36 rounded-xl shadow-xl flex flex-col justify-between p-2 border transition-colors duration-200",
                                // Material
                                "bg-gradient-to-br from-slate-100 to-slate-300",
                                isSelected ? "ring-4 ring-blue-500 ring-offset-2 ring-offset-slate-900 border-blue-400" : "border-slate-400",
                                !isCurrentPlayer && "opacity-60 grayscale"
                            )}
                        >
                            {/* Top Left */}
                            <div className={cn("text-left leading-none", isRed ? "text-red-600" : "text-slate-900")}>
                                <div className="font-bold text-lg">{rank}</div>
                                <div className="text-xl">{suit}</div>
                            </div>

                            {/* Center Big */}
                            <div className={cn("absolute inset-0 flex items-center justify-center text-5xl opacity-20 pointer-events-none", isRed ? "text-red-500" : "text-black")}>
                                {suit}
                            </div>

                            {/* Bottom Right */}
                            <div className={cn("text-right leading-none rotate-180", isRed ? "text-red-600" : "text-slate-900")}>
                                <div className="font-bold text-lg">{rank}</div>
                                <div className="text-xl">{suit}</div>
                            </div>

                            {/* Jack Tag */}
                            {isJack && (
                                <div className={cn(
                                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold uppercase py-0.5 px-2 rounded-full border shadow-sm backdrop-blur-sm whitespace-nowrap",
                                    twoEyed ? "bg-blue-100 text-blue-700 border-blue-300" : "bg-red-100 text-red-700 border-red-300"
                                )}>
                                    {twoEyed ? "Two-Eyed" : "One-Eyed"}
                                </div>
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export default Hand;
