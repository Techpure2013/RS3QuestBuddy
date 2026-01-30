import React, { useEffect, useMemo, useRef, useState } from "react";
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
	Badge,
	Collapse,
	Box,
} from "@mantine/core";
import { NavLink } from "react-router-dom";
import {
	IconArrowRight,
	IconPlus,
	IconCheck,
	IconStarFilled,
	IconChevronDown,
	IconChevronRight,
} from "@tabler/icons-react";
import type { EnrichedQuest } from "./../../../state/playerModel";
import { useSettings } from "./../../../Entrance/Entrance Components/SettingsContext";
import {
	getParentGroupName,
	getSubquestOrder,
} from "../../../Handlers/questGroups";

// --- Reusable Components ---

const QuestRewardsList: React.FC<{ rewards: string[] }> = ({ rewards }) => {
	const { settings } = useSettings();
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

const QuestCard: React.FC<QuestCardProps> = React.memo(function QuestCard({
	quest,
	isAdded,
	onAddToTodo,
	onRemoveFromTodo,
	onQuestClick,
	getModifiedQuestName,
}) {
	const { settings } = useSettings();
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
					to={`/${encodeURIComponent(quest.questName)}`}
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
});

// --- Grouped Quest Card for multi-part quests ---

interface GroupedQuestCardProps {
	parentName: string;
	subquests: EnrichedQuest[];
	todoList: string[];
	onAddToTodo: (name: string) => void;
	onRemoveFromTodo: (name: string) => void;
	onQuestClick: (name: string) => void;
}

const GroupedQuestCard: React.FC<GroupedQuestCardProps> = React.memo(
	function GroupedQuestCard({
		parentName,
		subquests,
		todoList,
		onAddToTodo,
		onRemoveFromTodo,
		onQuestClick,
	}) {
		const { settings } = useSettings();
		const [expanded, setExpanded] = useState(false);

		// Sort subquests by their defined order
		const sortedSubquests = useMemo(() => {
			return [...subquests].sort((a, b) => {
				const orderA = getSubquestOrder(a.questName);
				const orderB = getSubquestOrder(b.questName);
				return orderA - orderB;
			});
		}, [subquests]);

		// Get short name (part after the colon)
		const getShortName = (questName: string) => {
			const colonIndex = questName.indexOf(":");
			return colonIndex !== -1 ? questName.slice(colonIndex + 1).trim() : questName;
		};

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
				{/* Header - clickable to expand/collapse */}
				<Group
					justify="space-between"
					mb="sm"
					style={{ cursor: "pointer" }}
					onClick={() => setExpanded(!expanded)}
				>
					<Group gap="sm">
						{expanded ? (
							<IconChevronDown size={20} color="gray" />
						) : (
							<IconChevronRight size={20} color="gray" />
						)}
						<Text fz="lg" fw={700} c={settings.labelColor || "teal.3"}>
							{parentName}
						</Text>
					</Group>
					<Badge color="blue" variant="light" size="lg">
						{subquests.length} parts
					</Badge>
				</Group>

				<Divider />

				{/* Collapsed state - show brief info */}
				{!expanded && (
					<Text size="sm" c="dimmed" mt="md">
						Click to view {subquests.length} subquests in order
					</Text>
				)}

				{/* Expanded state - show subquests list */}
				<Collapse in={expanded}>
					<Stack gap="xs" mt="md">
						{sortedSubquests.map((quest, index) => {
							const isAdded = todoList.includes(quest.questName);
							return (
								<Box
									key={quest.questName}
									p="xs"
									style={{
										borderRadius: "4px",
										background: "rgba(255,255,255,0.03)",
									}}
								>
									<Group justify="space-between" wrap="nowrap">
										<Group gap="xs" style={{ flex: 1, minWidth: 0 }}>
											<Text size="sm" c="dimmed" fw={600} style={{ minWidth: "24px" }}>
												{index + 1}.
											</Text>
											<Text size="sm" c={settings.textColor || "white"} truncate="end">
												{getShortName(quest.questName)}
											</Text>
										</Group>
										<Group gap="xs" wrap="nowrap">
											<Tooltip label={isAdded ? "Remove from To-Do" : "Add to To-Do"}>
												<ActionIcon
													variant={isAdded ? "filled" : "light"}
													color={isAdded ? "teal" : "gray"}
													size="sm"
													onClick={(e) => {
														e.stopPropagation();
														isAdded
															? onRemoveFromTodo(quest.questName)
															: onAddToTodo(quest.questName);
													}}
												>
													{isAdded ? <IconCheck size={14} /> : <IconPlus size={14} />}
												</ActionIcon>
											</Tooltip>
											<NavLink
												to={`/${encodeURIComponent(quest.questName)}`}
												style={{ textDecoration: "none" }}
												onClick={() => onQuestClick(quest.questName)}
											>
												<ActionIcon
													variant="light"
													color={settings.buttonColor || "blue"}
													size="sm"
												>
													<IconArrowRight size={14} />
												</ActionIcon>
											</NavLink>
										</Group>
									</Group>
									{/* Rewards for this subquest */}
									{quest.rewards && quest.rewards.length > 0 && (
										<Box mt="sm" ml="28px" pt="xs" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
											<Title order={6} c={settings.labelColor || "dimmed"} mb="xs">
												Rewards
											</Title>
											<QuestRewardsList rewards={quest.rewards} />
										</Box>
									)}
								</Box>
							);
						})}
					</Stack>
				</Collapse>
			</Card>
		);
	}
);

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

const PAGE_SIZE = 60; // tweak as desired (30, 60, 90...)

const QuestDisplay: React.FC<QuestDisplayProps> = React.memo(
	function QuestDisplay({
		quests,
		isCompact,
		onQuestClick,
		labelColor,
		todoList,
		onAddToTodo,
		onRemoveFromTodo,
	}) {
		const { settings } = useSettings();

		// Always define helpers and hooks in the same order on every render
		const getModifiedQuestName = (name: string) =>
			name
				.toLowerCase()
				.split(" ")
				.join("")
				.replace(/[!,`']/g, "");

		// Infinite scroll state/hooks must be declared unconditionally (even if unused)
		const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
		const loaderRef = useRef<HTMLDivElement | null>(null);

		// Reset visible chunk whenever the source list changes
		useEffect(() => {
			setVisibleCount(PAGE_SIZE);
		}, [quests]);

		// Auto-increase visible chunk when sentinel is visible
		useEffect(() => {
			const el = loaderRef.current;
			if (!el) return;

			const io = new IntersectionObserver(
				(entries) => {
					const first = entries[0];
					if (first?.isIntersecting) {
						setVisibleCount((c) => Math.min(c + PAGE_SIZE, quests.length));
					}
				},
				{ root: null, rootMargin: "1500px 0px", threshold: 0 },
			);

			io.observe(el);
			return () => io.disconnect();
		}, [quests.length]);

		// Compute the visible slice once (grid branch uses it; compact branch ignores it)
		const visibleQuests = useMemo(
			() => quests.slice(0, visibleCount),
			[quests, visibleCount],
		);

		// Group quests by parent for multi-part quests
		type DisplayItem =
			| { type: "single"; quest: EnrichedQuest }
			| { type: "group"; parentName: string; subquests: EnrichedQuest[] };

		const groupedDisplayItems = useMemo(() => {
			const items: DisplayItem[] = [];
			const groupedQuests = new Map<string, EnrichedQuest[]>();
			const processedParents = new Set<string>();

			// First pass: identify and group subquests
			for (const quest of visibleQuests) {
				const parentName = getParentGroupName(quest.questName);
				if (parentName) {
					if (!groupedQuests.has(parentName)) {
						groupedQuests.set(parentName, []);
					}
					groupedQuests.get(parentName)!.push(quest);
				}
			}

			// Second pass: create display items in order
			for (const quest of visibleQuests) {
				const parentName = getParentGroupName(quest.questName);
				if (parentName) {
					// Only add the group once (on first subquest encountered)
					if (!processedParents.has(parentName)) {
						processedParents.add(parentName);
						const subquests = groupedQuests.get(parentName)!;
						items.push({ type: "group", parentName, subquests });
					}
					// Skip individual subquests since they're in the group
				} else {
					// Regular quest
					items.push({ type: "single", quest });
				}
			}

			return items;
		}, [visibleQuests]);

		if (!quests || quests.length === 0) return null;

		// --- Compact (Accordion) view ---
		if (isCompact) {
			return (
				<Accordion>
					{visibleQuests.map((quest) => {
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
												component="div" // render as div
												role="button"
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
													to={`/${encodeURIComponent(quest.questName)}`}
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

		// --- Grid view with infinite scroll (uses groupedDisplayItems and loaderRef) ---
		return (
			<>
				<SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
					{groupedDisplayItems.map((item) =>
						item.type === "group" ? (
							<GroupedQuestCard
								key={item.parentName}
								parentName={item.parentName}
								subquests={item.subquests}
								todoList={todoList}
								onAddToTodo={onAddToTodo}
								onRemoveFromTodo={onRemoveFromTodo}
								onQuestClick={onQuestClick}
							/>
						) : (
							<QuestCard
								key={item.quest.questName}
								quest={item.quest}
								isAdded={todoList.includes(item.quest.questName)}
								onAddToTodo={onAddToTodo}
								onRemoveFromTodo={onRemoveFromTodo}
								onQuestClick={onQuestClick}
								getModifiedQuestName={getModifiedQuestName}
							/>
						)
					)}
				</SimpleGrid>

				{visibleCount < quests.length && (
					<div
						ref={loaderRef}
						style={{ height: "1px", width: "100%", marginTop: "1rem" }}
					/>
				)}
			</>
		);
	},
);

export default QuestDisplay;
