'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
    socket: Socket | null;
    connected: boolean;
    socketUnavailable: boolean; // true when server has no Socket.IO (e.g. Vercel)
}

const SocketContext = createContext<SocketContextType>({ socket: null, connected: false, socketUnavailable: false });

let socketSingleton: Socket | null = null;

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [socketUnavailable, setSocketUnavailable] = useState(false);

    useEffect(() => {
        if (!socketSingleton) {
            // Limit reconnection attempts — on Vercel there is no socket server
            socketSingleton = io({ reconnectionAttempts: 3, reconnectionDelay: 2000 });
        }

        const s = socketSingleton;
        setSocket(s);

        const onConnect = () => { setConnected(true); setSocketUnavailable(false); };
        const onDisconnect = () => setConnected(false);
        // After all reconnect attempts fail, mark socket as unavailable
        const onReconnectFailed = () => { setConnected(false); setSocketUnavailable(true); };

        s.on('connect', onConnect);
        s.on('disconnect', onDisconnect);
        s.on('reconnect_failed', onReconnectFailed);

        if (s.connected) setConnected(true);

        return () => {
            s.off('connect', onConnect);
            s.off('disconnect', onDisconnect);
            s.off('reconnect_failed', onReconnectFailed);
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, connected, socketUnavailable }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);

