
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Bot, FlaskConical, Play, Github, Linkedin, Globe } from 'lucide-react';
import { cn } from '../lib/utils';

const LandingPage = () => {
    return (
        <div className="flex-1 flex flex-col h-full items-center justify-between relative overflow-hidden bg-slate-950">

            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 blur-[100px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 blur-[100px] rounded-full mix-blend-screen" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-900/50 blur-[120px] rounded-full" />

                {/* Stars / Dust */}
                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay" />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-6 relative z-10 py-2 lg:py-6">

                {/* Hero */}
                <div className="text-center space-y-8 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        New: Multiplayer & AI Labs
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl lg:text-8xl font-black tracking-tighter text-white leading-[1.1]"
                    >
                        Classic Strategy.
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                            Reimagined.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
                    >
                        Experience the ultimate board game simulator. Challenge our smart AI, analyze win-rates in the Monte Carlo Lab, or battle friends in real-time.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
                    >
                        <Link
                            to="/setup/solo"
                            className="group relative px-8 py-4 bg-white text-slate-950 rounded-full font-bold text-lg shadow-[0_0_40px_-5px_rgba(255,255,255,0.3)] hover:shadow-white/50 transition-all hover:scale-105 flex items-center gap-3"
                        >
                            <Play fill="currentColor" size={20} />
                            <span>Play Solo</span>
                        </Link>
                        <Link
                            to="/setup/multiplayer"
                            className="px-8 py-4 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 hover:border-blue-500 rounded-full font-bold text-lg transition-all hover:scale-105 backdrop-blur-sm flex items-center gap-2"
                        >
                            <Users size={20} />
                            Multiplayer
                        </Link>
                        <Link
                            to="/rules"
                            className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 text-white border border-slate-700 hover:border-slate-500 rounded-full font-bold text-lg transition-all hover:scale-105 backdrop-blur-sm"
                        >
                            How to Play
                        </Link>
                    </motion.div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full">
                    <FeatureCard
                        to="/setup/battle"
                        icon={<Bot className="text-purple-400" size={32} />}
                        title="AI Battle Arena"
                        desc="Watch smart bots fight against each other. Adjust speed and strategies."
                        gradient="group-hover:from-purple-500/20 group-hover:to-indigo-500/20"
                    />
                    <FeatureCard
                        to="/setup/lab"
                        icon={<FlaskConical className="text-emerald-400" size={32} />}
                        title="Monte Carlo Lab"
                        desc="Run thousands of simulations to determine the fair win-rate of board layouts."
                        gradient="group-hover:from-emerald-500/20 group-hover:to-teal-500/20"
                    />
                    <FeatureCard
                        to="/setup/multiplayer"
                        icon={<Users className="text-cyan-400" size={32} />}
                        title="Multiplayer"
                        desc="Create a lobby and challenge friends to a game of Sequence in real-time."
                        gradient="group-hover:from-cyan-500/20 group-hover:to-blue-500/20"
                    />
                </div>
            </div>

            {/* Footer */}
            <footer className="w-full relative z-20 py-8 border-t border-white/5 bg-black/20 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} SequencePro. All rights reserved.
                    </p>

                    <a
                        href="https://akashrane.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900 transition-all duration-300"
                    >
                        <span className="text-slate-400 text-sm group-hover:text-white transition-colors">Made by</span>
                        <span className="text-blue-400 font-bold text-sm bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:opacity-100 transition-opacity">
                            Akash Rane
                        </span>
                        <ArrowRight size={14} className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </a>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ to, icon, title, desc, gradient }) => (
    <Link to={to} className={cn(
        "group relative p-8 rounded-3xl bg-slate-900/40 border border-white/5 hover:border-white/10 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
    )}>
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500", gradient)} />
        <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 mb-6">
                {icon}
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-200 transition-colors">{title}</h3>
            <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">{desc}</p>
        </div>
    </Link>
);

export default LandingPage;
