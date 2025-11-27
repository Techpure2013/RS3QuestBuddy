import React, { createContext, useContext, useState, useCallback } from "react";
import ToastContainer from "./ToastContainer";
import { ToastType } from "./Toast";

interface ToastData {
	id: string;
	message: string;
	type: ToastType;
	duration?: number;
}

interface ToastContextValue {
	showToast: (message: string, type?: ToastType, duration?: number) => void;
	success: (message: string, duration?: number) => void;
	error: (message: string, duration?: number) => void;
	info: (message: string, duration?: number) => void;
	warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [toasts, setToasts] = useState<ToastData[]>([]);

	const removeToast = useCallback((id: string) => {
		setToasts((prev) => prev.filter((toast) => toast.id !== id));
	}, []);

	const showToast = useCallback(
		(message: string, type: ToastType = "info", duration = 3000) => {
			const id = `toast-${Date.now()}-${Math.random()}`;
			const newToast: ToastData = { id, message, type, duration };
			setToasts((prev) => [...prev, newToast]);
		},
		[]
	);

	const success = useCallback(
		(message: string, duration?: number) => showToast(message, "success", duration),
		[showToast]
	);

	const error = useCallback(
		(message: string, duration?: number) => showToast(message, "error", duration),
		[showToast]
	);

	const info = useCallback(
		(message: string, duration?: number) => showToast(message, "info", duration),
		[showToast]
	);

	const warning = useCallback(
		(message: string, duration?: number) => showToast(message, "warning", duration),
		[showToast]
	);

	const value: ToastContextValue = {
		showToast,
		success,
		error,
		info,
		warning,
	};

	return (
		<ToastContext.Provider value={value}>
			{children}
			<ToastContainer toasts={toasts} onClose={removeToast} />
		</ToastContext.Provider>
	);
};

export const useToast = (): ToastContextValue => {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return context;
};
