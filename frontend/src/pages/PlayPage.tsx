import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { api, GameState, LegalMoveResponse } from '../api/client';
import Board from '../components/Board';
import Hand from '../components/Hand';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { RefreshCcw, Cpu, Trash2, Home } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';

const PlayPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null);

    // If no ID, redirect
    useEffect(() => {
        if (!id) navigate('/setup/solo');
    }, [id, navigate]);

    // Game State
    const { data: game, isLoading } = useQuery<GameState>({
        queryKey: ['game', id],
        queryFn: () => api.getState(id!),
        enabled: !!id,
        refetchInterval: 1000,
    });

    // Valid Moves
    const { data: legalMoves } = useQuery<LegalMoveResponse>({
        queryKey: ['legal-moves', id, selectedCardIdx],
        queryFn: () => api.getLegalMoves(id!, selectedCardIdx!),
        enabled: !!id && selectedCardIdx !== null,
    });

    // --- Mutations ---

    const moveMut = useMutation({
        mutationFn: (vars: { r: number, c: number }) =>
            api.playMove(id!, selectedCardIdx!, vars.r, vars.c),
        onSuccess: (data) => {
            setSelectedCardIdx(null);
            queryClient.invalidateQueries({ queryKey: ['game'] });
            // toast("Move played", "success");
            // Check for sequence? (Could be done via looking at logs)
            const lastLog = data.log[data.log.length - 1];
            if (lastLog && lastLog.action === "place") {
                // simple feedback
            }
        },
        onError: (err: any) => {
            toast(err.response?.data?.detail || "Invalid Move", "error");
        }
    });

    const aiStepMut = useMutation({
        mutationFn: () => api.aiStep(id!, 1),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['game'] });
            // toast("AI played turn", "info");
        },
        onError: () => toast("AI stuck or failed", "error")
    });

    const deadCardMut = useMutation({
        mutationFn: () => api.replaceDeadCard(id!, selectedCardIdx!),
        onSuccess: () => {
            toast("Dead card exchanged", "success");
            setSelectedCardIdx(null);
            queryClient.invalidateQueries({ queryKey: ['game'] });
        },
        onError: (err: any) => {
            toast(err.response?.data?.detail || "Card is not dead", "error");
        }
    });

    const restartMut = useMutation({
        mutationFn: async () => {
            // To restart, we might need a backend endpoint or just create new game with same params
            // For now, let's redirect to setup
            navigate('/setup/solo');
        }
    });

    // Auto-Run AI Turn
    useEffect(() => {
        if (game && game.currentPlayerId !== 0 && game.winnerTeam === null) {
            const timer = setTimeout(() => {
                aiStepMut.mutate();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [game?.currentPlayerId, game?.winnerTeam, aiStepMut]);

    // Handlers
    const handleCardSelect = (idx: number) => {
        if (game?.currentTurnIndex !== undefined) {
            if (game.currentPlayerId === 0) {
                setSelectedCardIdx(idx);
            } else {
                toast("It is not your turn!", "error");
            }
        }
    };

    const handleBoardClick = (r: number, c: number) => {
        if (selectedCardIdx === null) {
            toast("Select a card first", "info");
            return;
        }

        const isValid = legalMoves?.positions.some(m => m.r === r && m.c === c);
        if (!isValid) {
            toast("Invalid placement", "error");
            return;
        }

        moveMut.mutate({ r, c });
    };

    if (isLoading || !game) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-blue-500 animate-pulse">Loading Sequence Protocol...</div>
        </div>
    );

    const currentPlayer = game.players.find(p => p.id === game.currentPlayerId);
    const isHumanTurn = currentPlayer?.id === 0;

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
            {/* Ambient Glow */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

            {/* Header */}
            <header className="relative z-10 w-full backdrop-blur-sm border-b border-white/5 bg-black/40">
                <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="hover:text-white text-slate-400 transition-colors">
                            <Home size={20} />
                        </button>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 backdrop-blur text-sm">
                            <span className="text-slate-400">Turn</span>
                            <span className="font-mono text-white font-bold">{game.currentTurnIndex}</span>
                            <div className="w-px h-3 bg-slate-700 mx-1" />
                            <span className={cn("font-bold", game.currentTeamId === 0 ? "text-blue-400" : "text-red-400")}>
                                {game.currentTeamId === 0 ? "Blue Team" : "Red Team"}
                            </span>
                        </div>
                    </div>

                    {/* Game Status/Prompt */}
                    <div className="absolute left-1/2 -translate-x-1/2 text-sm font-bold tracking-widest uppercase text-slate-400">
                        {game.winnerTeam !== null
                            ? <span className="text-emerald-400 animate-bounce">Game Over</span>
                            : isHumanTurn
                                ? <span className="text-blue-400 animate-pulse">Your Turn</span>
                                : <span className="text-purple-400">AI Thinking...</span>}
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={async () => {
                                // Manual refresh/sync
                                queryClient.invalidateQueries({ queryKey: ['game'] });
                                toast("Synced", "info");
                            }}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                            title="Sync Status"
                        >
                            <RefreshCcw size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-[1fr_350px] overflow-hidden">

                {/* Left: Game Area (Flex Column) */}
                <div className="relative flex flex-col items-center bg-radial-gradient from-blue-900/20 to-slate-950 overflow-hidden">

                    {/* Winner Banner (Overlay) */}
                    {game.winnerTeam !== null && (
                        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
                            <div className="bg-slate-900 border-2 border-emerald-500 p-8 rounded-2xl shadow-2xl text-center">
                                <h2 className="text-4xl font-bold text-white mb-2">Team {game.winnerTeam === 0 ? "BLUE" : "RED"} WINS!</h2>
                                <div className="flex gap-4 justify-center mt-6">
                                    <button onClick={() => navigate('/setup/solo')} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold">New Game</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Board Area (Takes remaining space) */}
                    <div className="flex-1 w-full flex items-center justify-center p-4 overflow-hidden relative">
                        {/* Scale wrapper */}
                        <div className="scale-[0.55] sm:scale-[0.65] md:scale-[0.75] lg:scale-[0.85] xl:scale-[0.95] 2xl:scale-[1.1] transition-transform duration-500">
                            <Board
                                grid={game.board}
                                validMoves={legalMoves?.positions || []}
                                onCellClick={handleBoardClick}
                            />
                        </div>
                    </div>

                    {/* Hand Container (Fixed at bottom, no overlap) */}
                    <div className="w-full h-36 shrink-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end pb-4 z-20 relative pointer-events-none">
                        {/* Action Bar (Dead Card) */}
                        {isHumanTurn && selectedCardIdx !== null && (
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-4 animate-in slide-in-from-bottom-2 fade-in pointer-events-auto">
                                <button
                                    onClick={() => deadCardMut.mutate()}
                                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 rounded-full flex items-center gap-2 text-sm font-bold backdrop-blur-md transition-all shadow-lg"
                                >
                                    <Trash2 size={16} />
                                    Exchange Dead Card
                                </button>
                            </div>
                        )}

                        <div className="w-full max-w-4xl mx-auto px-4 z-20">
                            {isHumanTurn ? (
                                <Hand
                                    cards={currentPlayer?.hand || []}
                                    selectedIndex={selectedCardIdx}
                                    onSelect={handleCardSelect}
                                    isCurrentPlayer={true}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-24 gap-3 text-slate-500">
                                    <Cpu size={24} className="animate-spin-slow text-purple-500" />
                                    <span className="font-mono text-xs tracking-wider animate-pulse">AI PROCESSING STRATEGY...</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: HUD Sidebar */}
                <div className="hidden lg:flex flex-col border-l border-slate-800 bg-slate-900/50 backdrop-blur-md">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 p-4 border-b border-slate-800/50">
                        <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                            <div className="text-[10px] text-slate-500 mb-1">DECK</div>
                            <div className="text-xl font-mono text-white">{game.cardsLeft}</div>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                            <div className="text-[10px] text-slate-500 mb-1">YOUR TEAM</div>
                            <div className="text-xl font-mono text-blue-400">BLUE</div>
                        </div>
                    </div>

                    {/* Log */}
                    <div className="flex items-center gap-2 px-4 py-2 pt-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Game Log</span>
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
                                                {entry.team === 0 ? "YOU" : "BOT"}
                                            </span>
                                            <span className="text-slate-500">{entry.action === "place" ? "placed" : "removed"}</span>
                                        </div>
                                        <div className="text-slate-300">
                                            Card <span className="font-bold text-white">{entry.card}</span> at <span className="text-blue-300">[{entry.target?.[0]}, {entry.target?.[1]}]</span>
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

export default PlayPage;
