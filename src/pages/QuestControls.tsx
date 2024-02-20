import React, { useState, useEffect } from "react";
import { ActionIcon, Button, Flex, Modal, Stack } from "@mantine/core";
import { MantineProvider } from "@mantine/core";
import { useQuestControllerStore } from "../Handlers/HandlerStore";
import { IconPlus, IconSettings } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { Settings } from "./Settings";
import useNotesDisclosure from "../Handlers/useDisclosure";
import { UserNotes } from "./userNotes";

const QuestControls: React.FC<{
	scrollNext: () => void;
	scrollPrev: () => void;
	handleStepChange: (nextStep: number) => void;
}> = ({ scrollNext, scrollPrev, handleStepChange }) => {
	const [active, setActive] = useState(0);
	const { showStepReq, toggleShowStepReq, questImageVis } =
		useQuestControllerStore();
	const handleScrollNext = () => {
		const nextStep = active + 1;
		setActive(nextStep);
		handleStepChange(nextStep); // Call handleStepChange with the updated step
		scrollNext();
		scrollIntoView(nextStep);
	};
	const [opened, { open, close }] = useDisclosure(false);
	const [userColor, setUserColor] = useState("");
	const [userLabelColor, setUserLabelColor] = useState("");
	const [userButtonColor, setUserButtonColor] = useState("");
	const [hasColor, setHasColor] = useState(false);
	const [hasButtonColor, setHasButtonColor] = useState(false);
	const [hasLabelColor, setHasLabelColor] = useState(false);
	const [isOpened, { openNotes, closedNotes }] = useNotesDisclosure(false);
	useEffect(() => {
		const colorVal = localStorage.getItem("textColorValue");
		const labelCol = localStorage.getItem("labelColor");
		const buttonCol = localStorage.getItem("buttonColor");
		if (buttonCol) {
			setUserButtonColor(buttonCol);
			setHasButtonColor(true);
		} else {
			setHasButtonColor(false);
		}
		if (labelCol) {
			setUserLabelColor(labelCol);
			setHasLabelColor(true);
		} else {
			setHasLabelColor(false);
		}
		if (colorVal) {
			setUserColor(colorVal);
			setHasColor(true);
		} else {
			setHasColor(false);
		}
	}, [
		userButtonColor,
		userLabelColor,
		userColor,
		hasColor,
		hasLabelColor,
		hasButtonColor,
		opened,
	]);
	const handleScrollPrev = () => {
		const nextStep = active - 1;
		setActive(nextStep);
		handleStepChange(nextStep); // Call handleStepChange with the updated step
		scrollPrev();
		scrollIntoView(nextStep);
	};
	const scrollIntoView = (step: number) => {
		const element = document.getElementById(step.toString());
		if (element) {
			element.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	};

	useEffect(() => {
		console.log("QuestControls component initialized");
		return () => {
			console.log("Quest Controls Component unmounted");
		};
	}, []);

	return (
		<>
			<MantineProvider defaultColorScheme="dark">
				<Modal
					title="Notes"
					opened={isOpened}
					onClose={() => {
						closedNotes();
					}}
					styles={{
						title: {
							fontSize: "34px",
							textAlign: "center",
						}
					}}
				>
					<UserNotes />
				</Modal>
				<Modal
					title="Settings"
					opened={opened}
					onClose={() => {
						close();
					}}
					styles={{
						title: {
							fontSize: "34px",
							textAlign: "center",
							color: hasColor ? userColor : "currentColor",
						}
					}}
				>
					<Settings />
				</Modal>
				<Flex styles={{ root: { margin: "5px", gap: "5px" } }}>
					<ActionIcon
						color={hasButtonColor ? userButtonColor : "currentColor"}
						onClick={openNotes}
						size={"sm"}
						variant="outline"
					>
						<IconPlus />
					</ActionIcon>
					<ActionIcon
						onClick={open}
						variant="outline"
						color={hasButtonColor ? userButtonColor : "currentColor"}
						size={"sm"}
					>
						<IconSettings />
					</ActionIcon>
				</Flex>
				<Stack className="ButtonGroupTwo" gap="sm">
					<Button
						variant="outline"
						color={hasButtonColor ? userButtonColor : "currentColor"}
						onClick={handleScrollPrev}
					>
						Prev Step
					</Button>
					<Button
						variant="outline"
						color={hasButtonColor ? userButtonColor : "currentColor"}
						onClick={handleScrollNext}
					>
						Next Step
					</Button>
					{showStepReq ? (
						<Button
							variant="outline"
							color={hasButtonColor ? userButtonColor : "currentColor"}
							onClick={toggleShowStepReq}
						>
							Show Step Details
						</Button>
					) : (
						<Button
							variant="outline"
							color={hasButtonColor ? userButtonColor : "currentColor"}
							onClick={toggleShowStepReq}
						>
							Show Quest Details
						</Button>
					)}
					<Button
						variant="outline"
						color={hasButtonColor ? userButtonColor : "currentColor"}
						onClick={() => {
							questImageVis();
						}}
					>
						View Quest Images
					</Button>
				</Stack>
			</MantineProvider>
		</>
	);
};

export default QuestControls;
