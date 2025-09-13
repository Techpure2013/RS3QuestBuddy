// src/pages/Quest Picker/Quest Picker Components/QuestDisplay.tsx
import React from "react";
import { Carousel } from "@mantine/carousel";
import {
	Accordion,
	AccordionControl,
	ActionIcon,
	Group,
	Tooltip,
	Text, // Import Mantine's Text component
} from "@mantine/core";
import { NavLink } from "react-router-dom";
import {
	IconArrowRight,
	IconArrowLeft,
	IconPlus,
	IconCheck,
} from "@tabler/icons-react";

// Define a unified quest type for internal use
type Quest = {
	title: string;
};

interface QuestDisplayProps {
	quests: Quest[];
	isCompact: boolean;
	onQuestClick: (questName: string) => void;
	labelColor?: string;
	todoList: string[];
	onAddToTodo: (questName: string) => void;
	onRemoveFromTodo: (questName: string) => void;
}

const QuestItemContent: React.FC<{ quest: Quest }> = ({ quest }) => {
	const questImage =
		"./Rewards/" +
		quest.title.toLowerCase().replace(/[^a-zA-Z0-9]/g, "") +
		"reward.webp";

	return (
		<div className="caroQTitle">
			{quest.title}
			<img loading="lazy" src={questImage} alt="Reward" aria-hidden="true" />
		</div>
	);
};

export const QuestDisplay: React.FC<QuestDisplayProps> = ({
	quests,
	isCompact,
	onQuestClick,
	labelColor,
	todoList,
	onAddToTodo,
	onRemoveFromTodo,
}) => {
	const getModifiedQuestName = (name: string) => {
		return name
			.toLowerCase()
			.split(" ")
			.join("")
			.replace(/[!,`']/g, "");
	};

	if (!quests) return null;

	if (isCompact) {
		return (
			<Accordion>
				{quests.map((quest) => {
					const isAdded = todoList.includes(quest.title);
					return (
						<Accordion.Item key={quest.title} value={quest.title}>
							{/* REMOVED rightSection and wrapped children in a Group */}
							<AccordionControl
								chevron={null}
								styles={{
									control: { color: labelColor || "" },
									chevron: { display: "none" },
								}}
							>
								<Group justify="space-between" wrap="nowrap" gap="xs">
									{/* The NavLink now only wraps the text */}
									<NavLink
										to="/QuestPage"
										state={{
											questName: quest.title,
											modified: getModifiedQuestName(quest.title),
										}}
										style={{
											textDecoration: "none",
											color: "inherit",
											flex: 1, // Allow the link to take up available space
										}}
										onClick={() => onQuestClick(quest.title)}
									>
										{/* Using <Text> allows for nice truncation if names are long */}
										<Text truncate="end">{quest.title}</Text>
									</NavLink>

									{/* The ActionIcon is now a sibling to the NavLink, inside the Group */}
									<Tooltip label={isAdded ? "Remove from To-Do" : "Add to To-Do"}>
										<ActionIcon
											variant={isAdded ? "filled" : "subtle"}
											color={isAdded ? "teal" : "gray"}
											onClick={(e) => {
												e.preventDefault(); // Prevent accordion from toggling
												e.stopPropagation(); // Stop the click from propagating to the control
												isAdded ? onRemoveFromTodo(quest.title) : onAddToTodo(quest.title);
											}}
										>
											{isAdded ? <IconCheck size={16} /> : <IconPlus size={16} />}
										</ActionIcon>
									</Tooltip>
								</Group>
							</AccordionControl>
						</Accordion.Item>
					);
				})}
			</Accordion>
		);
	}

	// The Carousel view is correct and does not need changes
	return (
		<div className="caroContainer">
			<Carousel
				slideSize={{ base: "100%" }}
				height={450}
				nextControlIcon={<IconArrowRight size={24} />}
				previousControlIcon={<IconArrowLeft size={24} />}
			>
				{quests.map((quest) => {
					const isAdded = todoList.includes(quest.title);
					return (
						<Carousel.Slide key={quest.title}>
							<Tooltip label={isAdded ? "Remove from To-Do" : "Add to To-Do"}>
								<ActionIcon
									variant={isAdded ? "filled" : "light"}
									color={isAdded ? "teal" : "gray"}
									onClick={(e) => {
										e.preventDefault(); // Prevent navigation
										e.stopPropagation();
										isAdded ? onRemoveFromTodo(quest.title) : onAddToTodo(quest.title);
									}}
									style={{
										position: "absolute",
										top: 10,
										right: 10,
										zIndex: 2,
									}}
								>
									{isAdded ? <IconCheck size={18} /> : <IconPlus size={18} />}
								</ActionIcon>
							</Tooltip>
							<NavLink
								to="/QuestPage"
								state={{
									questName: quest.title,
									modified: getModifiedQuestName(quest.title),
								}}
								style={{ textDecoration: "none" }}
							>
								<QuestItemContent quest={quest} />
							</NavLink>
						</Carousel.Slide>
					);
				})}
			</Carousel>
		</div>
	);
};
