import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameWebSocket } from '../hooks/useGameWebSocket';
import Board from '../components/Board';
import { Home, Loader2, Copy, Check } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { cn } from '../lib/utils';
import Hand from '../components/Hand';

const MultiplayerPage = () => {
    const { id } = useParams<{ id: string }>(); // This is the room code
    const navigate = useNavigate();
    const { toast } = useToast();
    const { isConnected, lastMessage, sendMessage, playerId, playerCount } = useGameWebSocket(id);
    const [copied, setCopied] = useState(false);

    // Local state for selections
    const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null);

    // Derived state from WS message
    const gameState = lastMessage?.state; // Matches GameState interface from backend

    const handleCopy = () => {
        if (id) {
            navigator.clipboard.writeText(id);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast("Room Code Copied", "success");
        }
    };

    if (!gameState && (!playerId && playerId !== 0)) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-blue-400">
                <Loader2 size={40} className="animate-spin" />
                <span className="font-mono text-xl">Connecting to Room {id}...</span>
            </div>
        </div>
    );

    // Determine my player (fallback if playerId is null, though it shouldn't be once gameState flows)
    const myPlayer = (gameState && playerId !== null) ? gameState.players[playerId] : null;
    const isMyTurn = gameState && playerId !== null && gameState.currentPlayerId === playerId;

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 overflow-hidden">
            {/* Header */}
            <header className="relative z-10 w-full backdrop-blur-sm border-b border-white/5 bg-indigo-900/10">
                <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="hover:text-white text-slate-400 transition-colors">
                            <Home size={20} />
                        </button>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 backdrop-blur text-sm">
                            <span className="text-slate-400">Room</span>
                            <button onClick={handleCopy} className="flex items-center gap-2 font-mono text-white font-bold hover:bg-white/10 px-2 rounded transition-colors">
                                {id}
                                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-slate-400" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-red-500")} />
                        <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                            {isConnected ? "Live" : "Reconnecting"}
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Area */}
            <div className="relative flex-1 grid grid-cols-1 lg:grid-cols-[1fr_350px] overflow-hidden">

                {/* Waiting Modal Overlay */}
                {playerCount < 2 && (
                    <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
                        <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
                            <Loader2 size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-white mb-2">Waiting for Players</h2>
                            <p className="text-slate-400 mb-6">Share the room code to start.</p>

                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-6">
                                <span className="block text-xs uppercase text-slate-500 mb-1">Room Code</span>
                                <div className="text-4xl font-mono font-bold text-white tracking-widest gap-2 flex justify-center items-center">
                                    {id}
                                    <button onClick={handleCopy} className="p-2 hover:bg-white/10 rounded ml-2 text-slate-400 hover:text-white transition-colors">
                                        {copied ? <Check size={20} /> : <Copy size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center px-4 py-2 bg-slate-800/50 rounded-lg">
                                <span className="text-slate-300">Players Joined</span>
                                <span className="font-bold text-blue-400">{playerCount} / 2</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Left: Board */}
                <div className="relative flex items-center justify-center bg-radial-gradient from-indigo-900/20 to-slate-950 overflow-hidden">
                    <div className="scale-[0.85] sm:scale-[1.0] lg:scale-[1.2] xl:scale-[1.3] 2xl:scale-[1.5] origin-center transition-transform duration-500">
                        {gameState && (
                            <Board
                                grid={gameState.board}
                                validMoves={[]}
                                ignoreValidation={true} // Allow all clicks, let server validate
                                onCellClick={(r, c) => {
                                    // Send MOVE event
                                    if (selectedCardIdx !== null) {
                                        sendMessage("MOVE", { cardIndex: selectedCardIdx, target: { r, c } });
                                        setSelectedCardIdx(null);
                                    }
                                }}
                            />
                        )}
                    </div>

                    {/* Hand (Only for MY player) */}
                    <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent flex flex-col justify-end pb-2">
                        <div className="w-full max-w-4xl mx-auto px-4">
                            {myPlayer ? (
                                <Hand
                                    cards={myPlayer.hand}
                                    selectedIndex={selectedCardIdx}
                                    onSelect={setSelectedCardIdx}
                                    isCurrentPlayer={isMyTurn}
                                />
                            ) : (
                                <div className="text-center text-slate-500 pb-4">Spectating</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Sidebar */}
                <div className="hidden lg:flex flex-col border-l border-slate-800 bg-slate-900/50 backdrop-blur-md">
                    <div className="p-4 border-b border-slate-800/50">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Players</h3>
                        <div className="mt-2 space-y-2">
                            {gameState?.players.map((p: any) => (
                                <div key={p.id} className={cn("flex items-center justify-between p-2 rounded-lg border",
                                    p.id === gameState.currentPlayerId ? "bg-slate-800 border-indigo-500/50" : "border-transparent"
                                )}>
                                    <div className="flex items-center gap-2">
                                        <span className={p.teamId === 0 ? "text-blue-400" : "text-red-400"}>
                                            Player {p.id}
                                        </span>
                                        {p.id === playerId && <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">YOU</span>}
                                    </div>
                                    {p.id === gameState.currentPlayerId && <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded">TURN</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MultiplayerPage;
