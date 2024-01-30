import React, { useState, useEffect } from "react";
import { ActionIcon, Button, Flex, Modal, Stack } from "@mantine/core";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles/global.css";
import "@mantine/core/styles/Accordion.css";
import "@mantine/core/styles/List.css";
import "@mantine/core/styles/ScrollArea.css";
import "@mantine/core/styles/UnstyledButton.css";
import "@mantine/core/styles/VisuallyHidden.css";
import "@mantine/core/styles/Paper.css";
import "@mantine/core/styles/Popover.css";
import "@mantine/core/styles/CloseButton.css";
import "@mantine/core/styles/Group.css";
import "@mantine/core/styles/Loader.css";
import "@mantine/core/styles/Overlay.css";
import "@mantine/core/styles/ModalBase.css";
import "@mantine/core/styles/Input.css";
import "@mantine/core/styles/Flex.css";
import "./../index.css";
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
			<MantineProvider>
				<Modal
					title="Notes"
					opened={isOpened}
					onClose={() => {
						closedNotes();
					}}
					styles={{
						header: {
							backgroundColor: "#3d3d3d",
						},
						title: {
							fontSize: "34px",
							textAlign: "center",
						},
						body: { backgroundColor: "#3d3d3d" },
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
						header: {
							backgroundColor: "#3d3d3d",
						},
						title: {
							fontSize: "34px",
							textAlign: "center",
							color: hasColor ? userColor : "#4e85bc",
						},
						body: { backgroundColor: "#3d3d3d" },
					}}
				>
					<Settings />
				</Modal>
				<Flex styles={{ root: { margin: "5px", gap: "5px" } }}>
					<ActionIcon
						color={hasButtonColor ? userButtonColor : "#EEF3FF"}
						onClick={openNotes}
						size={"sm"}
						variant="outline"
					>
						<IconPlus />
					</ActionIcon>
					<ActionIcon
						onClick={open}
						variant="outline"
						color={hasButtonColor ? userButtonColor : "#EEF3FF"}
						size={"sm"}
					>
						<IconSettings />
					</ActionIcon>
				</Flex>
				<Stack className="ButtonGroupTwo" gap="sm">
					<Button
						variant="outline"
						color={hasButtonColor ? userButtonColor : "#EEF3FF"}
						onClick={handleScrollPrev}
					>
						Prev Step
					</Button>
					<Button
						variant="outline"
						color={hasButtonColor ? userButtonColor : "#EEF3FF"}
						onClick={handleScrollNext}
					>
						Next Step
					</Button>
					{showStepReq ? (
						<Button
							variant="outline"
							color={hasButtonColor ? userButtonColor : "#EEF3FF"}
							onClick={toggleShowStepReq}
						>
							Show Step Details
						</Button>
					) : (
						<Button
							variant="outline"
							color={hasButtonColor ? userButtonColor : "#EEF3FF"}
							onClick={toggleShowStepReq}
						>
							Show Quest Details
						</Button>
					)}
					<Button
						variant="outline"
						color={hasButtonColor ? userButtonColor : "#EEF3FF"}
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
