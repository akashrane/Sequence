import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useMutation } from '@tanstack/react-query';
import { Users, ArrowRight, Loader2, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../components/ui/ToastProvider';

const LobbyPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [joinCode, setJoinCode] = useState('');

    const createRoomMut = useMutation({
        mutationFn: api.createRoom,
        onSuccess: (data) => {
            navigate(`/room/${data.roomCode}`);
        },
        onError: (error) => {
            console.error("Failed to create room:", error);
            // @ts-ignore
            toast("Failed to create room: " + (error.response?.data?.detail || error.message), "error");
        }
    });

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (joinCode.length === 4) {
            navigate(`/room/${joinCode.toUpperCase()}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            {/* Header */}
            <div className="absolute top-0 left-0 p-6">
                <button onClick={() => navigate('/')} className="hover:text-white text-slate-400 transition-colors flex items-center gap-2">
                    <Home size={20} />
                    <span>Back</span>
                </button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-2xl"
            >
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-blue-500/10 rounded-full">
                        <Users size={40} className="text-blue-400" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-center text-white mb-2">Multiplayer Lobby</h1>
                <p className="text-slate-400 text-center mb-8">Play with a friend in real-time.</p>

                {/* Create Room */}
                <button
                    onClick={() => createRoomMut.mutate()}
                    disabled={createRoomMut.isPending}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                    {createRoomMut.isPending ? <Loader2 className="animate-spin" /> : "Create New Room"}
                </button>

                <div className="relative my-8 text-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700"></div></div>
                    <span className="relative px-4 bg-slate-900 text-slate-500 text-sm">OR JOIN</span>
                </div>

                {/* Join Room */}
                <form onSubmit={handleJoin} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Room Code</label>
                        <input
                            type="text"
                            maxLength={4}
                            placeholder="ABCD"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            className="w-full bg-black/40 border border-slate-700 rounded-lg px-4 py-3 text-2xl font-mono text-center tracking-widest text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none uppercase placeholder:text-slate-700"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={joinCode.length !== 4}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Join Room <ArrowRight size={18} />
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default LobbyPage;
