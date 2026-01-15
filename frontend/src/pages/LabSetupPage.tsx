import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { FlaskConical, Play, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useToast } from '../components/ui/ToastProvider';

const LabSetupPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [trials, setTrials] = useState(100);

    const handleRun = async () => {
        setLoading(true);
        try {
            // We invoke the simulation API
            // Ideally we move to a result page, but the API is sync? 
            // If sync and takes long, might timeout. 
            // For now, let's assume it returns < 5s for 100 games.
            // Better: Navigate to LabResultPage and run query there.
            navigate(`/lab/run?trials=${trials}`);
        } catch (e) {
            console.error(e);
            toast("Simulation Failed", "error");
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
                    <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
                        <FlaskConical size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Monte Carlo Lab</h1>
                        <p className="text-slate-400">Analyze game fairness & probability</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-800/50 p-4 rounded-lg text-sm text-slate-300">
                        The lab runs thousands of high-speed background games to determine
                        statistical win rates, average turns, and first-player advantage.
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-300">Simulation Batch Size (Trials)</label>
                        <div className="grid grid-cols-4 gap-2">
                            {[50, 100, 500, 1000].map(n => (
                                <button
                                    key={n}
                                    onClick={() => setTrials(n)}
                                    className={cn(
                                        "p-3 rounded-lg border font-bold transition-all",
                                        trials === n
                                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                                            : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900"
                                    )}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleRun}
                        disabled={loading}
                        className="w-full mt-4 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Run Simulation"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default LabSetupPage;
