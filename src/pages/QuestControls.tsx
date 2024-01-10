import React, { useState, useEffect } from "react";
import { Button, Flex } from "@mantine/core";
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
				<Flex className="ButtonGroupTwo" gap="sm">
					<Button variant="outline" color="#EEF3FF" onClick={handleScrollPrev}>
						Prev Step
					</Button>
					<Button variant="outline" color="#EEF3FF" onClick={handleScrollNext}>
						Next Step
					</Button>
					{showStepReq ? (
						<Button
							variant="outline"
							color="#EEF3FF"
							onClick={toggleShowStepReq}
						>
							Show Step Details
						</Button>
					) : (
						<Button
							variant="outline"
							color="#EEF3FF"
							onClick={toggleShowStepReq}
						>
							Show Quest Details
						</Button>
					)}
					<Button
						variant="outline"
						color="#EEF3FF"
						onClick={() => {
							questImageVis();
						}}
					>
						View Quest Images
					</Button>
				</Flex>
			</MantineProvider>
		</>
	);
};

export default QuestControls;
