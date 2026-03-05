'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SocketContextType {
    socket: any | null;
    connected: boolean;
    socketUnavailable: boolean; // true on Vercel → polling fallback activates immediately
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    connected: false,
    socketUnavailable: false,
});

// Detect serverless host: anything that is NOT localhost
// On Vercel, server.js never runs, so Socket.IO is unavailable
function isServerlessHost(): boolean {
    if (typeof window === 'undefined') return false;
    const h = window.location.hostname;
    return h !== 'localhost' && h !== '127.0.0.1';
}

let socketSingleton: any | null = null;

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<any | null>(null);
    const [connected, setConnected] = useState(false);
    const [socketUnavailable, setSocketUnavailable] = useState(false);

    useEffect(() => {
        // ── Vercel / any non-localhost host ──────────────────────────────────
        // Socket.IO requires a persistent Node server (server.js).
        // Vercel is serverless — that server never runs.
        // Skip connection entirely: no 404 errors, polling fallback starts instantly.
        if (isServerlessHost()) {
            setSocketUnavailable(true);
            return;
        }

        // ── Local dev (localhost) ─────────────────────────────────────────────
        // Load socket.io-client dynamically and connect to the local server.js
        const initSocket = async () => {
            const { io } = await import('socket.io-client');

            if (!socketSingleton) {
                socketSingleton = io({ reconnectionAttempts: 3, reconnectionDelay: 2000 });
            }

            const s = socketSingleton;
            setSocket(s);

            const onConnect = () => { setConnected(true); setSocketUnavailable(false); };
            const onDisconnect = () => setConnected(false);
            const onFail = () => { setConnected(false); setSocketUnavailable(true); };

            s.on('connect', onConnect);
            s.on('disconnect', onDisconnect);
            s.on('reconnect_failed', onFail);

            if (s.connected) setConnected(true);

            return () => {
                s.off('connect', onConnect);
                s.off('disconnect', onDisconnect);
                s.off('reconnect_failed', onFail);
            };
        };

        initSocket();
    }, []);

    return (
        <SocketContext.Provider value={{ socket, connected, socketUnavailable }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
