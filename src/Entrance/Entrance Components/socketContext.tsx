import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

// Define the type for the context value
interface SocketContextValue {
	socket: Socket | null;
}

// Create the context
const SocketContext = createContext<SocketContextValue | undefined>(undefined);

// Create the provider component
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [socket, setSocket] = useState<Socket | null>(null);

	// useEffect(() => {
	// 	// Initialize the socket instance
	// 	const socketInstance: Socket = io("http://localhost:42069");
	// 	setSocket(socketInstance); // Set the socket instance in state

	// 	// Log connection success
	// 	socketInstance.on("connect", () => {
	// 		console.log("Connected to server:", socketInstance.id);
	// 	});

	// 	// Log connection errors
	// 	socketInstance.on("connect_error", (err) => {
	// 		console.error("Connection error:", err.message);
	// 	});

	// 	// Cleanup on unmount
	// 	return () => {
	// 		socketInstance.disconnect();
	// 	};
	// }, []);

	return (
		<SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>
	);
};

// Create a custom hook to use the socket
export const useSocket = (): Socket | null => {
	const context = useContext(SocketContext);
	if (!context) {
		throw new Error("useSocket must be used within a SocketProvider");
	}
	return context.socket;
};
