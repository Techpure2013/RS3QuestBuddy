import React, { Suspense } from "react";
import { Modal } from "@mantine/core";
import Settings from "./../../Settings/Settings";
import UserNotes from "./../../Settings/userNotes";

// Lazy load components
const UnderGroundPassGrid = React.lazy(
	() =>
		new Promise<{ default: React.ComponentType<any> }>((resolve) => {
			resolve({
				default: require("./UndergroundPassGrid").default,
			});
		}),
);
const LunarGrid = React.lazy(
	() =>
		new Promise<{ default: React.ComponentType<any> }>((resolve) => {
			resolve({
				default: require("./LunarDiplomacyGrid").default,
			});
		}),
);
const ColorCalculator = React.lazy(
	() =>
		new Promise<{ default: React.ComponentType<any> }>((resolve) => {
			resolve({ default: require("./POGCalc").default });
		}),
);

type QuestModalsProps = {
	openedSettings: boolean;
	closeSettings: () => void;
	openedGrid: boolean;
	closeGrid: () => void;
	openedLunarGrid: boolean;
	closeLunarGrid: () => void;
	openedNotes: boolean;
	closeNotes: () => void;
	openedPog: boolean;
	closePog: () => void;
	uiColor: string;
};

export const QuestModals: React.FC<QuestModalsProps> = ({
	openedSettings,
	closeSettings,
	openedGrid,
	closeGrid,
	openedLunarGrid,
	closeLunarGrid,
	openedNotes,
	closeNotes,
	openedPog,
	closePog,
	uiColor,
}) => (
	<>
		<Suspense fallback={null}>
			<Modal title="Underground Pass Grid" opened={openedGrid} onClose={closeGrid}>
				<UnderGroundPassGrid />
			</Modal>
			<Modal
				title="Memorization"
				opened={openedLunarGrid}
				onClose={closeLunarGrid}
			>
				<LunarGrid />
			</Modal>
			<Modal opened={openedPog} onClose={closePog}>
				<ColorCalculator />
			</Modal>
		</Suspense>
		<Modal title="Notes" opened={openedNotes} onClose={closeNotes}>
			<UserNotes />
		</Modal>
		<Modal
			id="Modal"
			title="Settings"
			opened={openedSettings}
			onClose={closeSettings}
			styles={{ title: { color: uiColor } }}
		>
			<Settings />
		</Modal>
	</>
);
