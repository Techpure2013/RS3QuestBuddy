import React from "react";
import { Socket } from "socket.io-client";
export declare const SocketProvider: React.FC<{
    children: React.ReactNode;
}>;
export declare const useSocket: () => Socket | null;
