import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Loader2, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';

const LabPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const trials = Number(searchParams.get('trials')) || 100;

    const { data, isLoading } = useQuery({
        queryKey: ['simulation', trials],
        queryFn: () => api.simulate(trials),
        staleTime: Infinity, // Don't refetch on focus
    });

    if (isLoading) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-950 text-slate-100">
            <Loader2 size={48} className="animate-spin text-emerald-500" />
            <h2 className="text-xl font-bold">Running {trials} Simulations...</h2>
            <p className="text-slate-400">This simulates thousands of turns. Please wait.</p>
        </div>
    );

    if (!data) return <div>Error</div>;

    // Prepare chart data
    // data.win_rates = { "0": 45, "1": 55 }
    const chartData = [
        { name: 'Blue Team (P1)', wins: data.win_rates['0'] || 0, color: '#3b82f6' },
        { name: 'Red Team (P2)', wins: data.win_rates['1'] || 0, color: '#ef4444' },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <button onClick={() => navigate('/setup/lab')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-8">
                <ArrowLeft size={16} /> Back to Lab Setup
            </button>

            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Simulation Results</h1>
                <p className="text-slate-400 mb-8">Analysis of {trials} games on Standard Board</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <KpiCard title="Total Games" value={data.games} />
                    <KpiCard title="Average Turns" value={data.avg_turns.toFixed(1)} />
                    <KpiCard title="Blue Win Rate" value={((chartData[0].wins / trials) * 100).toFixed(1) + '%'} color="text-blue-400" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Chart */}
                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                        <h3 className="font-bold mb-6 text-slate-300">Win Distribution</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Bar dataKey="wins" radius={[4, 4, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Stats Table */}
                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 overflow-y-auto max-h-[400px]">
                        <h3 className="font-bold mb-6 text-slate-300">Raw Data (First 20)</h3>
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-800/50">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Winner</th>
                                    <th className="px-4 py-3 rounded-r-lg">Turns</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {data.stats.slice(0, 20).map((row: any, i: number) => (
                                    <tr key={i} className="hover:bg-slate-800/30">
                                        <td className={cn("px-4 py-3 font-bold", row.winner === 0 ? "text-blue-400" : "text-red-400")}>
                                            {row.winner === 0 ? "Blue" : "Red"}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-slate-300">
                                            {row.turns}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const KpiCard = ({ title, value, color = "text-white" }: any) => (
    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
        <div className="text-slate-500 text-sm font-medium mb-1 uppercase tracking-wider">{title}</div>
        <div className={`text-3xl font-bold ${color}`}>{value}</div>
    </div>
);

export default LabPage;
