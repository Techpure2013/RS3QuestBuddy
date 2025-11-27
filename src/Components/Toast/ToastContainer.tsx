import React from "react";
import { Stack } from "@mantine/core";
import Toast, { ToastProps } from "./Toast";

export interface ToastContainerProps {
	toasts: Omit<ToastProps, "onClose">[];
	onClose: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
	return (
		<div
			style={{
				position: "fixed",
				top: "1rem",
				right: "1rem",
				zIndex: 9999,
				pointerEvents: "none",
			}}
		>
			<Stack gap="sm" style={{ pointerEvents: "auto" }}>
				{toasts.map((toast) => (
					<Toast key={toast.id} {...toast} onClose={onClose} />
				))}
			</Stack>
		</div>
	);
};

export default ToastContainer;
