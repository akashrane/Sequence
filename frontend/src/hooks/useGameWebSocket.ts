import { useEffect, useState, useRef, useCallback } from 'react';
import { useToast } from '../components/ui/ToastProvider';

export const useGameWebSocket = (roomCode: string | undefined) => {
    const [lastMessage, setLastMessage] = useState<any>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [playerId, setPlayerId] = useState<number | null>(null);
    const [playerCount, setPlayerCount] = useState<number>(0);
    const ws = useRef<WebSocket | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (!roomCode) return;

        // Connect
        // Connect
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        let socketUrl = `ws://localhost:8000/ws/${roomCode}`;

        try {
            // Construct URL object (handling relative paths by providing window.location.origin as base)
            const url = new URL(apiBase, window.location.origin);
            const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
            socketUrl = `${protocol}//${url.host}/ws/${roomCode}`;
        } catch (e) {
            console.warn("Invalid API_URL, falling back to localhost", e);
        }

        console.log(`Connecting to ${socketUrl}...`);

        ws.current = new WebSocket(socketUrl);

        ws.current.onopen = () => {
            console.log('WS Connected');
            setIsConnected(true);
            toast("Connected to Room", "success");
        };

        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('WS Message:', data);

                if (data.type === 'WELCOME') {
                    setPlayerId(data.playerId);
                } else if (data.type === 'PLAYER_COUNT') {
                    setPlayerCount(data.count);
                } else {
                    setLastMessage(data);
                }
            } catch (e) {
                console.error("Failed to parse WS message", e);
            }
        };

        ws.current.onclose = (event) => {
            console.log('WS Closed', event.code, event.reason);
            setIsConnected(false);
            if (event.code !== 1000) {
                toast("Connection Lost", "error");
            }
        };

        ws.current.onerror = (error) => {
            console.error('WS Error', error);
        };

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [roomCode, toast]);

    const sendMessage = useCallback((type: string, payload: any = {}) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type, ...payload }));
        } else {
            console.warn("WS not open, cannot send", type);
            toast("Connection interrupted", "error");
        }
    }, [toast]);

    return { isConnected, lastMessage, sendMessage, playerId, playerCount };
};
