import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Bot, FlaskConical, Play } from 'lucide-react';
import { cn } from '../lib/utils';

const LandingPage = () => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden">

            {/* Hero Section */}
            <div className="max-w-4xl w-full text-center space-y-8 mt-10 lg:mt-0 relative z-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6">
                        Master the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400">
                            Sequence Board
                        </span>
                    </h1>
                    <p className="text-slate-400 text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
                        The ultimate strategy board game simulator. Battle smart AI, analyze probability in the lab, or challenge friends in real-time.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <Link
                        to="/setup/solo"
                        className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-lg shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] transition-all hover:scale-105 flex items-center gap-3 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        <Play fill="currentColor" size={20} />
                        <span>Play Solo</span>
                    </Link>
                    <Link
                        to="/setup/multiplayer"
                        className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 text-white border border-slate-700 hover:border-slate-600 rounded-full font-bold text-lg transition-all hover:scale-105 flex items-center gap-3 backdrop-blur-sm"
                    >
                        <Users size={20} />
                        <span>Multiplayer</span>
                    </Link>
                </motion.div>
            </div>

            {/* Feature Grid */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-6xl w-full z-20"
            >
                <FeatureCard
                    to="/setup/battle"
                    icon={<Bot className="text-purple-400" size={32} />}
                    title="AI Battle Arena"
                    desc="Watch smart bots fight against each other. Adjust speed and strategies."
                    gradient="group-hover:from-purple-500/10 group-hover:to-indigo-500/10"
                />
                <FeatureCard
                    to="/setup/lab"
                    icon={<FlaskConical className="text-emerald-400" size={32} />}
                    title="Monte Carlo Lab"
                    desc="Run thousands of simulations to determine the fair win-rate of board layouts."
                    gradient="group-hover:from-emerald-500/10 group-hover:to-teal-500/10"
                />
                <FeatureCard
                    to="/rules"
                    icon={<div className="text-amber-400 font-serif font-bold text-2xl">?</div>}
                    title="Game Rules"
                    desc="Learn how to play, understand Dead Cards, and master the Jacks."
                    gradient="group-hover:from-amber-500/10 group-hover:to-orange-500/10"
                />
            </motion.div>

            {/* Decorative Background Elements */}
            {/* Floating cards or geometric shapes could go here */}
        </div>
    );
};

const FeatureCard = ({ to, icon, title, desc, gradient }) => (
    <Link to={to} className={cn("group relative p-6 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm hover:border-slate-600 transition-all duration-300 hover:-translate-y-1 block overflow-hidden")}>
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500", gradient)} />
        <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <div>
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
            <div className="flex items-center text-blue-400 text-sm font-bold group-hover:translate-x-2 transition-transform">
                Explore <ArrowRight size={14} className="ml-1" />
            </div>
        </div>
    </Link>
);

export default LandingPage;
