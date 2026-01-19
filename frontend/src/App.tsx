import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './components/ui/ToastProvider';

import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import SoloSetupPage from './pages/SoloSetupPage';
import PlayPage from './pages/PlayPage';
import RulesPage from './pages/RulesPage';
import BattleSetupPage from './pages/BattleSetupPage';
import BattlePage from './pages/BattlePage';
import LabSetupPage from './pages/LabSetupPage';
import LabPage from './pages/LabPage';
import LobbyPage from './pages/LobbyPage';
import MultiplayerPage from './pages/MultiplayerPage';

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ToastProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<LandingPage />} />

                            {/* Setup Pages */}
                            <Route path="setup/solo" element={<SoloSetupPage />} />
                            <Route path="setup/battle" element={<BattleSetupPage />} />
                            <Route path="setup/lab" element={<LabSetupPage />} />
                            <Route path="setup/multiplayer" element={<LobbyPage />} />

                            {/* Game Rooms */}
                            <Route path="game/:id" element={<PlayPage />} />
                            <Route path="battle/:id" element={<BattlePage />} />
                            <Route path="lab/run" element={<LabPage />} />
                            <Route path="room/:id" element={<MultiplayerPage />} />

                            {/* Static */}
                            <Route path="rules" element={<RulesPage />} />

                            {/* Fallback */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </ToastProvider>
        </QueryClientProvider>
    );
}

export default App;
