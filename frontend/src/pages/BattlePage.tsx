import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { api, GameState } from '../api/client';
import Board from '../components/Board';
import { cn } from '../lib/utils';
import { Play, Pause, FastForward, SkipForward, Home, RefreshCw } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';

const BattlePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');

    // Game State
    const { data: game, isLoading } = useQuery<GameState>({
        queryKey: ['game', id],
        queryFn: () => api.getState(id!),
        enabled: !!id,
        // Short polling to keep UI in sync if we do backend loop? 
        // Actually we will trigger steps from frontend to control speed easily.
        refetchInterval: isPlaying ? 500 : 2000,
    });

    const aiStepMut = useMutation({
        mutationFn: (steps: number) => api.aiStep(id!, steps),
        onSuccess: (data) => {
            queryClient.setQueryData(['game', id], data);
            if (data.winnerTeam !== null) {
                setIsPlaying(false);
            }
        },
        onError: () => {
            setIsPlaying(false);
            toast("Simulation Error", "error");
        }
    });

    // Auto Loop
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (isPlaying && game && game.winnerTeam === null) {
            const delay = speed === 'slow' ? 1500 : speed === 'normal' ? 800 : 200;

            interval = setInterval(() => {
                // If fast, maybe do multiple steps?
                // For visual clarity, 1 step is best unless "turbo"
                aiStepMut.mutate(1);
            }, delay);
        }

        return () => clearInterval(interval);
    }, [isPlaying, speed, game?.winnerTeam, aiStepMut]);

    if (isLoading || !game) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-purple-500 animate-pulse font-mono">Initializing Battle Protocol...</div>
        </div>
    );

    return (
        <div className="h-[calc(100vh-4rem)] w-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
            {/* Header */}
            <header className="relative z-10 w-full backdrop-blur-sm border-b border-white/5 bg-purple-900/10">
                <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="hover:text-white text-slate-400 transition-colors">
                            <Home size={20} />
                        </button>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 backdrop-blur text-sm">
                            <span className="text-slate-400">Turn</span>
                            <span className="font-mono text-white font-bold">{game.currentTurnIndex}</span>
                        </div>
                        <div className="text-sm font-bold tracking-widest uppercase text-purple-400 animate-pulse">
                            {game.winnerTeam !== null ? "Battle Ended" : isPlaying ? "Simulation Running" : "Paused"}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-700">
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                isPlaying ? "bg-amber-500/20 text-amber-500" : "bg-emerald-500/20 text-emerald-500"
                            )}
                        >
                            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                        </button>

                        <div className="w-px h-6 bg-slate-700 mx-1" />

                        <button onClick={() => setSpeed('slow')} className={cn("px-2 py-1 text-xs font-mono rounded", speed === 'slow' && "bg-slate-700 text-white")}>1x</button>
                        <button onClick={() => setSpeed('normal')} className={cn("px-2 py-1 text-xs font-mono rounded", speed === 'normal' && "bg-slate-700 text-white")}>2x</button>
                        <button onClick={() => setSpeed('fast')} className={cn("px-2 py-1 text-xs font-mono rounded", speed === 'fast' && "bg-slate-700 text-white")}>Max</button>

                        <div className="w-px h-6 bg-slate-700 mx-1" />

                        <button onClick={() => aiStepMut.mutate(1)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400" title="Step +1">
                            <SkipForward size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-[1fr_350px] overflow-hidden">
                {/* Winner Overlay */}
                {game.winnerTeam !== null && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-slate-900 border-2 border-purple-500 p-8 rounded-2xl shadow-2xl text-center">
                            <h2 className="text-4xl font-bold text-white mb-2">Team {game.winnerTeam} Wins!</h2>
                            <p className="text-slate-400 mb-6">Total Turns: {game.currentTurnIndex}</p>
                            <div className="flex gap-4 justify-center">
                                <button onClick={() => navigate('/setup/battle')} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold">New Battle</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Left: Huge Board */}
                <div className="relative flex items-center justify-center bg-radial-gradient from-purple-900/20 to-slate-950 overflow-hidden">
                    <div className="scale-[0.85] sm:scale-[1.0] lg:scale-[1.2] xl:scale-[1.3] 2xl:scale-[1.5] origin-center transition-transform duration-500">
                        <Board
                            grid={game.board}
                            validMoves={[]}
                            onCellClick={() => { }}
                        />
                    </div>
                </div>

                {/* Right: Log Feed */}
                <div className="hidden lg:flex flex-col border-l border-slate-800 bg-slate-900/50 backdrop-blur-md">
                    <div className="flex items-center gap-2 p-4 border-b border-slate-800/50">
                        <RefreshCw size={14} className={cn("text-purple-400", isPlaying && "animate-spin")} />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Battle Feed</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-slate-800">
                        <div className="flex flex-col-reverse min-h-full">
                            {game.log.slice().reverse().map((entry, i) => (
                                <div key={i} className="flex gap-3 px-4 py-3 border-b border-slate-800/30 text-xs font-mono hover:bg-white/5 transition-colors">
                                    <span className="text-slate-600 shrink-0 w-8">
                                        {game.currentTurnIndex - i}
                                    </span>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={cn("font-bold px-1.5 rounded", entry.team === 0 ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400")}>
                                                TEAM {entry.team}
                                            </span>
                                            <span className="text-slate-500">{entry.action}</span>
                                        </div>
                                        <div className="text-slate-300">
                                            Card <span className="font-bold text-white">{entry.card}</span> at <span className="text-purple-300">[{entry.target?.[0]}, {entry.target?.[1]}]</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BattlePage;
