import React from "react";
import {
	Accordion,
	AccordionControl,
	ActionIcon,
	Group,
	Tooltip,
	Text,
	AccordionPanel,
	List,
	ThemeIcon,
	Stack,
	Button,
	Card,
	Title,
	SimpleGrid,
	Divider,
} from "@mantine/core";
import { NavLink } from "react-router-dom";
import {
	IconArrowRight,
	IconPlus,
	IconCheck,
	IconStarFilled,
} from "@tabler/icons-react";
import { EnrichedQuest } from "./useQuestData";
import { useSettingsStore } from "./../../../pages/Settings/Setting Components/useSettingsStore";
// --- Reusable Components ---

const QuestRewardsList: React.FC<{ rewards: string[] }> = ({ rewards }) => {
	const { settings } = useSettingsStore();
	if (!rewards || rewards.length === 0) {
		return (
			<Text c={settings.textColor || "dimmed"} size="sm" mt="xs">
				No specific item rewards for this quest.
			</Text>
		);
	}
	return (
		<List
			spacing="xs"
			size="sm"
			center
			icon={
				<ThemeIcon color={settings.labelColor || "yellow"} size={16} radius="xl">
					<IconStarFilled style={{ width: "70%", height: "70%" }} />
				</ThemeIcon>
			}
		>
			{rewards.map((reward, index) => (
				<List.Item c={settings.textColor || "teal"} key={index}>
					{reward}
				</List.Item>
			))}
		</List>
	);
};

// --- QuestCard for the Grid View ---

interface QuestCardProps {
	quest: EnrichedQuest;
	isAdded: boolean;
	onAddToTodo: (name: string) => void;
	onRemoveFromTodo: (name: string) => void;
	onQuestClick: (name: string) => void;
	getModifiedQuestName: (name: string) => string;
}

const QuestCard: React.FC<QuestCardProps> = ({
	quest,
	isAdded,
	onAddToTodo,
	onRemoveFromTodo,
	onQuestClick,
	getModifiedQuestName,
}) => {
	const { settings } = useSettingsStore();
	return (
		<Card
			shadow="lg"
			padding="lg"
			radius="md"
			withBorder
			style={{
				height: "100%",
				display: "flex",
				flexDirection: "column",
				border: "0.125rem solid var(--mantine-color-dark-4)",
				background: "linear-gradient(135deg, #1A1B1E, #101113)",
			}}
		>
			<Group justify="space-between" mb="sm">
				<Text fz="lg" fw={700} c={settings.labelColor || "teal.3"} truncate="end">
					{quest.questName}
				</Text>
				<Tooltip label={isAdded ? "Remove from To-Do" : "Add to To-Do"}>
					<ActionIcon
						variant={isAdded ? "filled" : "light"}
						color={isAdded ? "teal" : "gray"}
						size="lg"
						onClick={() =>
							isAdded
								? onRemoveFromTodo(quest.questName)
								: onAddToTodo(quest.questName)
						}
					>
						{isAdded ? <IconCheck size={20} /> : <IconPlus size={20} />}
					</ActionIcon>
				</Tooltip>
			</Group>

			<Divider />

			<Stack gap="xs" mt="md">
				<Title order={6} c={settings.labelColor || "dimmed"}>
					Rewards
				</Title>
				<QuestRewardsList rewards={quest.rewards} />
			</Stack>

			<Group mt="auto" pt="md">
				<NavLink
					to="/QuestPage"
					state={{
						questName: quest.questName,
						modified: getModifiedQuestName(quest.questName),
					}}
					style={{ textDecoration: "none", width: "100%" }}
					onClick={() => onQuestClick(quest.questName)}
				>
					<Button
						variant="filled"
						color={settings.buttonColor || "dark"}
						fullWidth
						rightSection={<IconArrowRight size={16} />}
					>
						View Quest Page
					</Button>
				</NavLink>
			</Group>
		</Card>
	);
};

// --- Main Display Component ---

interface QuestDisplayProps {
	quests: EnrichedQuest[];
	isCompact: boolean;
	onQuestClick: (questName: string) => void;
	labelColor?: string;
	todoList: string[];
	onAddToTodo: (questName: string) => void;
	onRemoveFromTodo: (questName: string) => void;
}

const QuestDisplay: React.FC<QuestDisplayProps> = ({
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
	const { settings } = useSettingsStore();
	if (!quests || quests.length === 0) return null;

	// --- Accordion View (Compact Mode) ---
	if (isCompact) {
		return (
			<Accordion>
				{quests.map((quest) => {
					const isAdded = todoList.includes(quest.questName);
					return (
						<Accordion.Item
							c={settings.textColor}
							key={quest.questName}
							value={quest.questName}
						>
							<AccordionControl
								chevron={null}
								styles={{
									control: { color: labelColor || "" },
									chevron: { display: "none" },
								}}
							>
								<Group justify="space-between" wrap="nowrap" gap="xs">
									<Text truncate="end">{quest.questName}</Text>
									<Tooltip label={isAdded ? "Remove from To-Do" : "Add to To-Do"}>
										<ActionIcon
											variant={isAdded ? "filled" : "subtle"}
											color={isAdded ? "teal" : "gray"}
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												isAdded
													? onRemoveFromTodo(quest.questName)
													: onAddToTodo(quest.questName);
											}}
										>
											{isAdded ? <IconCheck size={16} /> : <IconPlus size={16} />}
										</ActionIcon>
									</Tooltip>
								</Group>
							</AccordionControl>
							<AccordionPanel>
								<Card
									withBorder
									shadow="sm"
									radius="md"
									padding="lg"
									style={{
										border: "0.125rem solid var(--mantine-color-dark-4)",
										background: "linear-gradient(135deg, #1A1B1E, #101113)",
									}}
								>
									<Stack gap="md">
										<Group>
											<NavLink
												to="/QuestPage"
												state={{
													questName: quest.questName,
													modified: getModifiedQuestName(quest.questName),
												}}
												style={{ textDecoration: "none" }}
												onClick={() => onQuestClick(quest.questName)}
											>
												<Button
													variant="filled"
													color="dark"
													size="sm"
													rightSection={<IconArrowRight size={14} />}
												>
													View Quest Page
												</Button>
											</NavLink>
										</Group>
										<div>
											<Title order={5} c="dimmed">
												Rewards
											</Title>
											<QuestRewardsList rewards={quest.rewards} />
										</div>
									</Stack>
								</Card>
							</AccordionPanel>
						</Accordion.Item>
					);
				})}
			</Accordion>
		);
	}

	// --- Grid View (Default Mode) ---
	return (
		<SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
			{quests.map((quest) => (
				<QuestCard
					key={quest.questName}
					quest={quest}
					isAdded={todoList.includes(quest.questName)}
					onAddToTodo={onAddToTodo}
					onRemoveFromTodo={onRemoveFromTodo}
					onQuestClick={onQuestClick}
					getModifiedQuestName={getModifiedQuestName}
				/>
			))}
		</SimpleGrid>
	);
};
export default QuestDisplay;
