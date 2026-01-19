import React from 'react';
import { BoardCell } from '../api/client';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface BoardProps {
    grid: BoardCell[][];
    validMoves: { r: number, c: number }[];
    onCellClick: (r: number, c: number) => void;
    ignoreValidation?: boolean;
}

const Board: React.FC<BoardProps> = ({ grid, validMoves, onCellClick, ignoreValidation }) => {

    const isValid = (r: number, c: number) => ignoreValidation || validMoves.some(m => m.r === r && m.c === c);

    return (
        <div className="perspective-1000 py-10 w-full flex justify-center">
            <motion.div
                initial={{ rotateX: 20 }}
                animate={{ rotateX: 20 }}
                transition={{ duration: 1 }}
                className="relative p-4 rounded-xl bg-slate-900 shadow-[0_50px_60px_-15px_rgba(0,0,0,0.8),_0_0_0_10px_#1e293b] border-4 border-slate-700 w-fit mx-auto transform-style-3d will-change-transform"
                style={{
                    transformStyle: 'preserve-3d',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.1) inset'
                }}
            >
                {/* Board Surface Texture */}
                <div className="pointer-events-none absolute inset-0 bg-amber-950 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-30 mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-black/40 mix-blend-multiply" />
                </div>

                <div
                    className="grid grid-cols-10 gap-1.5 transform-style-3d pointer-events-none"
                    style={{ pointerEvents: 'none', transformStyle: 'preserve-3d' }}
                >
                    {grid.map((row, r) => (
                        row.map((cell, c) => {
                            const valid = isValid(r, c);
                            const isOccupied = cell.chipTeam !== null;
                            const isLocked = cell.isLocked;

                            // Suit Color
                            const isRed = cell.label.includes('♥') || cell.label.includes('♦');

                            // Chip Style with 3D gradients
                            let chipGradient = "";
                            if (cell.chipTeam === 0) chipGradient = "bg-gradient-to-tr from-blue-900 via-blue-600 to-blue-400 shadow-blue-900/50";
                            if (cell.chipTeam === 1) chipGradient = "bg-gradient-to-tr from-red-900 via-red-600 to-red-400 shadow-red-900/50";
                            if (cell.chipTeam === 2) chipGradient = "bg-gradient-to-tr from-green-900 via-green-600 to-green-400 shadow-green-900/50";

                            return (
                                <motion.button
                                    key={`${r}-${c}`}
                                    whileHover={{ scale: 1.05, zIndex: 50, translateZ: 10 }}
                                    whileTap={{ scale: 0.95, translateZ: 5 }}
                                    onClick={() => onCellClick(r, c)}
                                    className={cn(
                                        "pointer-events-auto relative w-9 h-12 sm:w-11 sm:h-14 lg:w-12 lg:h-16 flex items-center justify-center rounded-sm sm:rounded-md transition-all duration-200 transform-style-3d group cursor-pointer",
                                        // Card Base Style
                                        cell.isCorner
                                            ? "bg-amber-900/80 border-amber-500/30"
                                            : "bg-slate-200 border-slate-300 shadow-sm hover:brightness-110",

                                        valid ? "ring-2 ring-yellow-400 z-20" : "",
                                    )}
                                    style={{
                                        boxShadow: cell.isCorner ? 'none' : '1px 1px 2px rgba(0,0,0,0.3)',
                                        pointerEvents: 'auto',
                                        zIndex: valid ? 60 : 1 // Ensure valid moves are higher, but base is clickable
                                    }}
                                >
                                    {/* Card Face */}
                                    {!cell.isCorner && (
                                        <div className="flex flex-col items-center justify-center w-full h-full bg-white/50 backdrop-blur-[1px] rounded-[calc(0.25rem-1px)]">
                                            {cell.card ? (
                                                <>
                                                    <span className={cn("text-[8px] sm:text-[10px] font-bold leading-none self-start ml-1 mt-0.5", isRed ? "text-red-600" : "text-slate-900")}>
                                                        {cell.card.rank}
                                                    </span>
                                                    <span className={cn("text-lg sm:text-xl leading-none -my-1 drop-shadow-sm", isRed ? "text-red-500" : "text-slate-800")}>
                                                        {cell.card.suit}
                                                    </span>
                                                    <span className={cn("text-[8px] sm:text-[10px] font-bold leading-none self-end mr-1 mb-0.5 rotate-180", isRed ? "text-red-600" : "text-slate-900")}>
                                                        {cell.card.rank}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-amber-700/50 font-bold text-[8px] tracking-widest">FREE</span>
                                            )}
                                        </div>
                                    )}

                                    {cell.isCorner && (
                                        <div className="w-full h-full rounded-full border-2 border-dashed border-amber-400/30 flex items-center justify-center">
                                            <span className="text-amber-400 text-xl drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]">★</span>
                                        </div>
                                    )}

                                    {/* Chip - 3D Floating Token */}
                                    <AnimatePresence>
                                        {isOccupied && (
                                            <motion.div
                                                initial={{ scale: 0, opacity: 0, z: 50 }}
                                                animate={{ scale: 1, opacity: 1, z: 15 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                style={{ translateZ: 15 }}
                                                className={cn(
                                                    "absolute w-7 h-7 sm:w-9 sm:h-9 rounded-full shadow-[0_10px_10px_rgba(0,0,0,0.4)] flex items-center justify-center backface-hidden",
                                                    chipGradient
                                                )}
                                            >
                                                {/* Specular Highlight for plastic look */}
                                                <div className="absolute top-1 left-2 w-3 h-1.5 bg-white/40 blur-[1px] rounded-full rotate-[-45deg]" />

                                                {/* Inner Ring */}
                                                <div className="w-2/3 h-2/3 rounded-full border-2 border-white/10 opacity-50" />

                                                {isLocked && (
                                                    <div className="absolute inset-0 rounded-full border-2 border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)] animate-pulse" />
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Valid Text - Only show if in validMoves list (Visual Hint) */}
                                    {validMoves.some(m => m.r === r && m.c === c) && !isOccupied && (
                                        <motion.div
                                            style={{ translateZ: 10 }}
                                            animate={{ y: [0, -5, 0] }}
                                            transition={{ repeat: Infinity, duration: 1 }}
                                            className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[8px] font-bold px-1 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none"
                                        >
                                            PLACE
                                        </motion.div>
                                    )}
                                </motion.button>
                            )
                        })
                    ))}
                </div>

                {/* Board Thickness (Faux 3D Edge) */}
                <div
                    className="absolute -bottom-4 left-0 right-0 h-4 bg-slate-800 rounded-b-xl border-x-4 border-b-4 border-slate-700"
                    style={{ transform: 'translateZ(-2px) rotateX(-5deg)', transformOrigin: 'top' }}
                />
            </motion.div>
        </div>
    );
};

export default Board;
