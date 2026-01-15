import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { Play, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

const SoloSetupPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Form State
    const [boardType, setBoardType] = useState('standard');
    const [difficulty, setDifficulty] = useState('smart');
    const [seed, setSeed] = useState<number | ''>('');

    const handleStart = async () => {
        setLoading(true);
        try {
            // If seed is empty, undefined allows backend to generate it
            const actualSeed = seed === '' ? undefined : Number(seed);

            const gameData = await api.newGame(2, boardType, actualSeed, difficulty);

            // Navigate to play page with Game ID
            // We can rename PlayPage to GamePage and use URL param /play/:id
            // For now, let's stick to our pattern. We might need a context or just pass it in URL.
            // Best practice: /game/:id
            navigate(`/game/${gameData.gameId}`);
        } catch (e) {
            console.error(e);
            alert("Failed to create game");
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
                    <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                        <Play size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Solo Setup</h1>
                        <p className="text-slate-400">Human vs AI</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Board Type */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-300">Board Layout</label>
                        <div className="grid grid-cols-2 gap-4">
                            <SelectButton
                                active={boardType === 'standard'}
                                onClick={() => setBoardType('standard')}
                                title="Standard"
                                desc="Official spiral layout"
                            />
                            <SelectButton
                                active={boardType === 'random'}
                                onClick={() => setBoardType('random')}
                                title="Randomized"
                                desc="Chaos mode"
                            />
                        </div>
                    </div>

                    {/* Difficulty */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-300">AI Difficulty</label>
                        <div className="grid grid-cols-2 gap-4">
                            <SelectButton
                                active={difficulty === 'smart'}
                                onClick={() => setDifficulty('smart')}
                                title="Smart"
                                desc="Blocks and builds"
                            />
                            <SelectButton
                                active={difficulty === 'simple'}
                                onClick={() => setDifficulty('simple')}
                                title="Simple"
                                desc="Random moves"
                            />
                        </div>
                    </div>

                    {/* Seed (Advanced) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Map Seed (Optional)</label>
                        <input
                            type="number"
                            placeholder="Random"
                            value={seed}
                            onChange={(e) => setSeed(e.target.value ? Number(e.target.value) : '')}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>

                    {/* CTA */}
                    <button
                        onClick={handleStart}
                        disabled={loading}
                        className="w-full mt-4 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Start Game"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const SelectButton = ({ active, onClick, title, desc }: any) => (
    <button
        onClick={onClick}
        className={cn(
            "p-4 rounded-xl border text-left transition-all duration-200",
            active
                ? "bg-blue-500/20 border-blue-500 ring-1 ring-blue-500"
                : "bg-slate-950 border-slate-800 hover:bg-slate-900 hover:border-slate-600"
        )}
    >
        <div className={cn("font-bold mb-1", active ? "text-blue-400" : "text-white")}>{title}</div>
        <div className="text-xs text-slate-500">{desc}</div>
    </button>
);

export default SoloSetupPage;
