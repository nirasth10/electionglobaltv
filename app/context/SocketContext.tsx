'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SocketContextType {
    socket: any | null;
    connected: boolean;
    socketUnavailable: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    connected: false,
    socketUnavailable: false,
});

/**
 * Returns the Socket.IO server URL to connect to.
 *
 * - Localhost  → same origin (server.js bundles Next.js + Socket.IO together)
 * - Vercel     → external Render server via NEXT_PUBLIC_SOCKET_URL
 */
function getSocketUrl(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    const h = window.location.hostname;
    const isLocal = h === 'localhost' || h === '127.0.0.1';

    if (isLocal) {
        // Local: server.js runs Socket.IO on same host/port as Next.js
        return undefined; // undefined = same origin
    }

    // Production (Vercel): point to Render socket server
    return process.env.NEXT_PUBLIC_SOCKET_URL || undefined;
}

let socketSingleton: any | null = null;

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<any | null>(null);
    const [connected, setConnected] = useState(false);
    const [socketUnavailable, setSocketUnavailable] = useState(false);

    useEffect(() => {
        const socketUrl = getSocketUrl();

        // If we're on Vercel but NEXT_PUBLIC_SOCKET_URL was not configured,
        // there's nowhere to connect — fall back to polling immediately.
        if (typeof window !== 'undefined') {
            const h = window.location.hostname;
            const isLocal = h === 'localhost' || h === '127.0.0.1';
            if (!isLocal && !socketUrl) {
                console.warn('[SocketContext] NEXT_PUBLIC_SOCKET_URL is not set. Socket unavailable.');
                setSocketUnavailable(true);
                return;
            }
        }

        const initSocket = async () => {
            const { io } = await import('socket.io-client');

            if (!socketSingleton) {
                socketSingleton = io(socketUrl ?? '', {
                    reconnectionAttempts: 5,
                    reconnectionDelay: 2000,
                    transports: ['websocket', 'polling'],
                });
            }

            const s = socketSingleton;
            setSocket(s);

            const onConnect = () => {
                setConnected(true);
                setSocketUnavailable(false);
                console.log('[SocketContext] Connected to socket server');
            };
            const onDisconnect = () => setConnected(false);
            const onFail = () => {
                setConnected(false);
                setSocketUnavailable(true);
                console.warn('[SocketContext] Socket reconnection failed – using polling fallback');
            };

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
