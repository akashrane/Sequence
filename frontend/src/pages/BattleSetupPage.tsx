import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { Zap, Loader2, Cpu } from 'lucide-react';
import { cn } from '../lib/utils';

const BattleSetupPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Form State
    const [nPlayers, setNPlayers] = useState(2);
    const [boardType, setBoardType] = useState('standard');
    const [difficulty, setDifficulty] = useState('smart');

    const handleStart = async () => {
        setLoading(true);
        try {
            // Create game with these params.
            // Note: For Battle, we might want to flag that ALL players are bots.
            // Currently backend assigns P0 as human-ish. 
            // We will handle "All Bot" logic in the BattlePage loop.
            const gameData = await api.newGame(nPlayers, boardType, undefined, difficulty);
            navigate(`/battle/${gameData.gameId}`);
        } catch (e) {
            console.error(e);
            alert("Failed to start battle");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-20 p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-8 rounded-2xl shadow-xl"
            >
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
                        <Zap size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">AI Battle Arena</h1>
                        <p className="text-slate-400">Watch bots fight for dominance</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Players */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-300">Bot Count</label>
                        <div className="grid grid-cols-4 gap-2">
                            {[2, 3, 4, 6].map(n => (
                                <button
                                    key={n}
                                    onClick={() => setNPlayers(n)}
                                    className={cn(
                                        "p-3 rounded-lg border font-bold transition-all",
                                        nPlayers === n
                                            ? "bg-purple-500/20 border-purple-500 text-purple-300"
                                            : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900"
                                    )}
                                >
                                    {n} Bots
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Board Type */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-300">Board Layout</label>
                        <div className="grid grid-cols-2 gap-4">
                            <SelectButton
                                active={boardType === 'standard'}
                                onClick={() => setBoardType('standard')}
                                title="Standard"
                                desc="Official layout"
                                color="purple"
                            />
                            <SelectButton
                                active={boardType === 'random'}
                                onClick={() => setBoardType('random')}
                                title="Randomized"
                                desc="Chaos mode"
                                color="purple"
                            />
                        </div>
                    </div>

                    {/* Difficulty */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-300">AI Intelligence</label>
                        <div className="grid grid-cols-2 gap-4">
                            <SelectButton
                                active={difficulty === 'smart'}
                                onClick={() => setDifficulty('smart')}
                                title="Smart"
                                desc="Aggressive & defensive"
                                color="purple"
                            />
                            <SelectButton
                                active={difficulty === 'simple'}
                                onClick={() => setDifficulty('simple')}
                                title="Simple"
                                desc="Random moves"
                                color="purple"
                            />
                        </div>
                    </div>

                    {/* CTA */}
                    <button
                        onClick={handleStart}
                        disabled={loading}
                        className="w-full mt-4 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <><Cpu size={20} /> Initialize Battle</>}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const SelectButton = ({ active, onClick, title, desc, color = 'blue' }: any) => {
    // Dynamic color class mapping is tricky with tailwind JIT if not safe-listed, 
    // so we'll just hardcode purple logic for this page or use props carefully.
    const activeClass = "bg-purple-500/20 border-purple-500 ring-1 ring-purple-500";

    return (
        <button
            onClick={onClick}
            className={cn(
                "p-4 rounded-xl border text-left transition-all duration-200",
                active
                    ? activeClass
                    : "bg-slate-950 border-slate-800 hover:bg-slate-900 hover:border-slate-600"
            )}
        >
            <div className={cn("font-bold mb-1", active ? "text-purple-400" : "text-white")}>{title}</div>
            <div className="text-xs text-slate-500">{desc}</div>
        </button>
    );
};

export default BattleSetupPage;
