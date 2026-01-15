import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Layers, Zap, FlaskConical, BookOpen, Menu } from 'lucide-react';

const Layout = () => {
    const location = useLocation();

    const navItems = [
        { label: 'Play', path: '/setup/solo', icon: <Layers size={18} /> },
        { label: 'Battle', path: '/setup/battle', icon: <Zap size={18} /> },
        { label: 'Lab', path: '/setup/lab', icon: <FlaskConical size={18} /> },
        { label: 'Rules', path: '/rules', icon: <BookOpen size={18} /> },
    ];

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100 font-sans selection:bg-blue-500/30">

            {/* Ambient Backlight */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[500px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none z-0" />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/5 bg-black/20">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <span className="font-bold text-white leading-none pt-0.5">S</span>
                        </div>
                        <div className="font-bold text-lg tracking-tight">Sequence<span className="text-blue-400 font-light">Pro</span></div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname.startsWith(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-white/10 text-white shadow-inner"
                                            : "text-slate-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {item.icon}
                                    {item.label}
                                </Link>
                            )
                        })}
                    </div>

                    {/* Mobile Menu Toggle (Visual Only for now) */}
                    <button className="md:hidden p-2 text-slate-400 hover:text-white">
                        <Menu />
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 pt-16 min-h-screen flex flex-col">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
