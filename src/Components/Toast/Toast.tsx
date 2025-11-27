import React, { useEffect } from "react";
import { Paper, Group, Text, ActionIcon } from "@mantine/core";
import { IconX, IconCheck, IconAlertCircle, IconInfoCircle } from "@tabler/icons-react";
import "./Toast.css";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastProps {
	id: string;
	message: string;
	type: ToastType;
	duration?: number;
	onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, duration = 3000, onClose }) => {
	useEffect(() => {
		const timer = setTimeout(() => {
			onClose(id);
		}, duration);

		return () => clearTimeout(timer);
	}, [id, duration, onClose]);

	const getIcon = () => {
		switch (type) {
			case "success":
				return <IconCheck size={20} />;
			case "error":
				return <IconAlertCircle size={20} />;
			case "warning":
				return <IconAlertCircle size={20} />;
			case "info":
			default:
				return <IconInfoCircle size={20} />;
		}
	};

	const getColor = () => {
		switch (type) {
			case "success":
				return "teal";
			case "error":
				return "red";
			case "warning":
				return "yellow";
			case "info":
			default:
				return "blue";
		}
	};

	return (
		<Paper
			className={`toast toast-${type}`}
			p="md"
			withBorder
			shadow="md"
			style={{
				borderColor: `var(--mantine-color-${getColor()}-6)`,
				backgroundColor: "rgba(19, 21, 23, 0.95)",
				backdropFilter: "blur(10px)",
			}}
		>
			<Group justify="space-between" gap="md">
				<Group gap="sm">
					<div style={{ color: `var(--mantine-color-${getColor()}-6)` }}>
						{getIcon()}
					</div>
					<Text size="sm" c={getColor()}>
						{message}
					</Text>
				</Group>
				<ActionIcon
					variant="subtle"
					color={getColor()}
					onClick={() => onClose(id)}
					size="sm"
				>
					<IconX size={16} />
				</ActionIcon>
			</Group>
		</Paper>
	);
};

export default Toast;
