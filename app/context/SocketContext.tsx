'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
    socket: Socket | null;
    connected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, connected: false });

let socketSingleton: Socket | null = null;

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!socketSingleton) {
            socketSingleton = io({ reconnectionAttempts: 5, reconnectionDelay: 1000 });
        }

        const s = socketSingleton;
        setSocket(s);

        const onConnect = () => setConnected(true);
        const onDisconnect = () => setConnected(false);

        s.on('connect', onConnect);
        s.on('disconnect', onDisconnect);

        if (s.connected) setConnected(true);

        return () => {
            s.off('connect', onConnect);
            s.off('disconnect', onDisconnect);
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, connected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
