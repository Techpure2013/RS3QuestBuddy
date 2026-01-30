import React, { useCallback, useMemo, useState } from "react";
import {
	Button,
	Modal,
	ActionIcon,
	Group,
	Badge,
	Text,
	Paper,
	Stack,
	Divider,
	SimpleGrid,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
	IconBrandDiscord,
	IconCoffee,
	IconPlus,
	IconSettings,
	IconX,
	IconList,
} from "@tabler/icons-react";
import { useSettings } from "../../Entrance/Entrance Components/SettingsContext";

import { usePlayerSelector, usePlayerActions } from "../../state/usePlayerSelector";
import { useQuestTodo } from "./Quest Picker Components/useQuestTodo";
import { useToast } from "../../Components/Toast/useToast";

import { SearchControls } from "./Quest Picker Components/SearchControls";
import MenuInterface from "./Quest Picker Components/MenuInterface";
import { ironmanQuestOrder } from "../../Handlers/ironmanQuestOrder";
import Settings from "../Settings/Settings";
import UserNotes from "../Settings/userNotes";
import QuestTodoList from "./Quest Picker Components/QuestTodoList";
import QuestDisplay from "./Quest Picker Components/QuestDisplay";
import { fetchQuestBundleNormalized } from "../../idb/questBundleClient";

import type { QuestAge, QuestSeries } from "../../state/types";
import type { EnrichedQuest } from "../../state/playerModel";

// Strong typing for filters and sorts
export type Filter =
	| { type: "Quest Age"; value: QuestAge }
	| { type: "Series"; value: QuestSeries }
	| { type: "Reward"; value: string };

export type SortKey =
	| "Quest Points"
	| "Release Date"
	| "Efficient Ironman Quests";

const QuestCarousel: React.FC = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const debouncedQuery = searchQuery; // if you want actual debouncing, swap to a useDebounce hook

	// Toast notifications
	const toast = useToast();

	// PlayerStore selectors
	const playerName = usePlayerSelector((s) => s.player.playerName);
	const playerFound = usePlayerSelector((s) => s.ui.playerFound);
	const hideCompleted = usePlayerSelector((s) => s.player.hideCompleted);
	const showEligibleOnly = usePlayerSelector((s) => s.player.showEligibleOnly);
	const isLoading = usePlayerSelector((s) => s.ui.loading);
	const questPoints = usePlayerSelector((_, d) => d.totalQuestPoints());
	const displayQuests = usePlayerSelector((_, d) => d.displayQuests());
	const remainingQuestsCount = usePlayerSelector((_, d) => d.remainingCount());
	const completedCount = usePlayerSelector((_, d) => d.completedQuests().length);

	// PlayerStore actions with toast callbacks
	const { fetchPlayer, setHideCompleted, setShowEligibleOnly, clearPlayer } = usePlayerActions({
		onFetchError: (error) => toast.error(error),
		onFetchSuccess: (name) => toast.success(`Successfully loaded data for ${name}!`),
	});

	const searchForPlayer = useCallback(
		async (name: string) => {
			if (isLoading) return;
			await fetchPlayer(name);
		},
		[isLoading, fetchPlayer]
	);

	const clearPlayerSearch = useCallback(() => {
		clearPlayer();
	}, [clearPlayer]);

	const toggleHideCompleted = useCallback(() => {
		setHideCompleted(!hideCompleted);
	}, [setHideCompleted, hideCompleted]);

	const toggleShowEligibleOnly = useCallback(() => {
		setShowEligibleOnly(!showEligibleOnly);
	}, [setShowEligibleOnly, showEligibleOnly]);

	const { todoQuests, addQuestToTodo, removeQuestFromTodo, clearQuestTodo } =
		useQuestTodo();

	const { settings, closeSettingsModal, openSettingsModal } = useSettings();

	const [notesModal, { open: openNotes, close: closeNotes }] =
		useDisclosure(false);
	const [todoModal, { open: openTodo, close: closeTodo }] = useDisclosure(false);

	const [activeFilters, setActiveFilters] = useState<Filter[]>([]);
	const [activeSort, setActiveSort] = useState<SortKey | null>(null);

	// For Ironman sort
	const orderMap = useMemo(
		() => new Map(ironmanQuestOrder.map((name, i) => [name, i] as const)),
		[],
	);

	// Handlers (stable)
	const handleFilterChange = useCallback((next: Filter) => {
		setActiveFilters((current) => {
			const idx = current.findIndex((f) => f.type === next.type);
			if (idx !== -1) {
				const nextArr = current.slice();
				nextArr[idx] = next;
				return nextArr;
			}
			return [...current, next];
		});
	}, []);

	const handleSortChange = useCallback((next: SortKey | null) => {
		setActiveSort(next);
	}, []);

	const removeFilter = useCallback((to: Filter) => {
		setActiveFilters((current) =>
			current.filter((f) => !(f.type === to.type && f.value === to.value)),
		);
	}, []);

	const clearSort = useCallback(() => {
		setActiveSort(null);
	}, []);

	const clearAll = useCallback(() => {
		setActiveFilters([]);
		setActiveSort(null);
	}, []);

	const activeFilterCount = activeFilters.length + (activeSort ? 1 : 0);

	// Stable signature for base list to reduce recomputes
	const base = displayQuests || [];
	const baseSig = useMemo(
		() =>
			`${base.length}:${base[0]?.questName ?? ""}:${
				base[Math.floor(base.length / 2)]?.questName ?? ""
			}:${base.at(-1)?.questName ?? ""}`,
		[base],
	);

	const getQuestTitle = (quest: EnrichedQuest): string =>
		quest?.questName || quest?.title || "";

	// Build the filtered/sorted list for display
	const filteredQuests: EnrichedQuest[] = useMemo(() => {
		const q = debouncedQuery.trim().toLowerCase();

		// Text search
		const searchFiltered = q
			? base.filter((quest) => {
					const title = getQuestTitle(quest).toLowerCase();
					return title.includes(q);
				})
			: base;

		// Menu filters
		let menuFiltered = searchFiltered;
		if (activeFilters.length > 0) {
			menuFiltered = searchFiltered.filter((quest) =>
				activeFilters.every((f) => {
					switch (f.type) {
						case "Quest Age":
							return quest.questAge === f.value;
						case "Series":
							return quest.series === f.value;
						case "Reward":
							return quest.rewards?.some((reward) =>
								reward.toLowerCase().includes(f.value.toLowerCase())
							) ?? false;
						default:
							return true;
					}
				}),
			);
		}

		// If filters removed everything, fallback to search result instead of empty
		let listToSort =
			menuFiltered.length === 0 && activeFilters.length > 0
				? searchFiltered
				: menuFiltered;

		// Sorting
		if (activeSort === "Efficient Ironman Quests") {
			listToSort = [...listToSort].sort((a, b) => {
				const aIdx = orderMap.get(a.questName) ?? Infinity;
				const bIdx = orderMap.get(b.questName) ?? Infinity;
				return aIdx - bIdx;
			});
		} else if (activeSort === "Quest Points") {
			listToSort = [...listToSort].sort(
				(a, b) => (b.questPoints || 0) - (a.questPoints || 0),
			);
		} else if (activeSort === "Release Date") {
			listToSort = [...listToSort].sort((a, b) => {
				const aDate = a.releaseDate
					? new Date(a.releaseDate)
					: new Date("2100-01-01");
				const bDate = b.releaseDate
					? new Date(b.releaseDate)
					: new Date("2100-01-01");
				return aDate.getTime() - bDate.getTime();
			});
		}

		// Final fallback: if everything ends empty, show base
		return listToSort.length === 0 ? base : listToSort;
	}, [baseSig, debouncedQuery, activeFilters, activeSort, orderMap, hideCompleted, showEligibleOnly]);

	// Prefetch quest bundle so QuestPage is instant
	const handleQuestClick = useCallback(async (questName: string) => {
		try {
			await fetchQuestBundleNormalized(questName);
		} catch (e) {
			console.error("Failed to prefetch bundle:", e);
		} finally {
			window.scrollTo(0, 0);
		}
	}, []);

	const handleAddToTodo = useCallback(
		(name: string) => addQuestToTodo(name),
		[addQuestToTodo],
	);

	const handleRemoveFromTodo = useCallback(
		(name: string) => removeQuestFromTodo(name),
		[removeQuestFromTodo],
	);

	const openDiscord = useCallback(() => {
		const newWindow = window.open(
			"https://discord.gg/qFftZF7Usa",
			"_blank",
			"noopener,noreferrer",
		);
		if (newWindow) newWindow.opener = null;
	}, []);

	const openCoffee = useCallback(() => {
		const newWindow = window.open("https://buymeacoffee.com/rs3questbuddy");
		if (newWindow) newWindow.opener = null;
	}, []);

	return (
		<>
			{settings.isSettingsModalOpen && (
				<Modal
					title="Settings"
					opened={settings.isSettingsModalOpen}
					onClose={closeSettingsModal}
					suppressHydrationWarning
				>
					<Settings />
				</Modal>
			)}

			{notesModal && (
				<Modal title="Notes" opened={notesModal} onClose={closeNotes}>
					<UserNotes />
				</Modal>
			)}

			{todoModal && (
				<Modal title="Quest To-Do List" opened={todoModal} onClose={closeTodo}>
					<QuestTodoList
						quests={todoQuests}
						onRemoveQuest={removeQuestFromTodo}
						onClearAll={clearQuestTodo}
					/>
				</Modal>
			)}

			<Paper
				p="md"
				mb="xl"
				withBorder
				style={{
					borderColor: "var(--mantine-color-dark-4)",
					backgroundColor: "rgba(19, 21, 23, 0.5)",
				}}
			>
				<Stack>
					<SimpleGrid cols={{ base: 1, lg: 2 }}>
						<Group style={{ justifyContent: "center" }}>
							<Button
								leftSection={<IconList size={18} />}
								variant="filled"
								onClick={openTodo}
								rightSection={
									todoQuests.length > 0 ? (
										<Badge circle color="blue" size="sm">
											{todoQuests.length}
										</Badge>
									) : null
								}
							>
								To-Do List
							</Button>

							<MenuInterface
								onFilterChange={handleFilterChange}
								onSortChange={handleSortChange}
								activeFilterCount={activeFilterCount}
							/>
						</Group>

						<Group style={{ justifyContent: "center" }}>
							<Button
								variant={hideCompleted ? "filled" : "outline"}
								onClick={toggleHideCompleted}
								disabled={!playerFound}
								color={hideCompleted ? "teal" : undefined}
							>
								{hideCompleted ? "Showing Incomplete" : "Hide Completed"}
							</Button>
							<Button
								variant={showEligibleOnly ? "filled" : "outline"}
								onClick={toggleShowEligibleOnly}
								disabled={!playerFound}
								color={showEligibleOnly ? "blue" : undefined}
							>
								{showEligibleOnly ? "Eligible Only" : "Show All Quests"}
							</Button>
							<Button variant="outline" onClick={clearPlayerSearch}>
								New Player Search
							</Button>
						</Group>
					</SimpleGrid>

					<Divider label="Search" labelPosition="center" color="dark.3" my="xs" />

					<SearchControls
						onPlayerSearch={searchForPlayer}
						onQuestSearchChange={setSearchQuery}
						isLoading={isLoading}
						playerFound={playerFound}
						initialPlayerName={playerName}
						labelColor={settings.labelColor || undefined}
					/>
				</Stack>
			</Paper>

			{(activeFilters.length > 0 || activeSort) && (
				<Group mt="md" mb="md" justify="center" gap="xs">
					{activeFilters.length > 0 && <Text size="sm">Filtered by:</Text>}

					{activeFilters.map((filter) => (
						<Badge
							key={`${filter.type}-${filter.value}`}
							size="lg"
							variant="light"
							rightSection={
								<ActionIcon
									size="xs"
									color="blue"
									radius="xl"
									variant="transparent"
									onClick={() => removeFilter(filter)}
								>
									<IconX style={{ width: "70%", height: "70%" }} />
								</ActionIcon>
							}
						>
							{filter.type}: {filter.value}
						</Badge>
					))}

					{activeSort && (
						<>
							<Text size="sm">Sorted by:</Text>
							<Badge
								size="lg"
								variant="light"
								color="green"
								rightSection={
									<ActionIcon
										size="xs"
										color="green"
										radius="xl"
										variant="transparent"
										onClick={clearSort}
									>
										<IconX style={{ width: "70%", height: "70%" }} />
									</ActionIcon>
								}
							>
								{activeSort}
							</Badge>
						</>
					)}

					<Button size="compact-sm" variant="light" color="red" onClick={clearAll}>
						Clear All
					</Button>
				</Group>
			)}

			{playerFound && (hideCompleted || showEligibleOnly) && (
				<div className="caroQTitle">
					<h3>
						{hideCompleted && showEligibleOnly
							? "Showing quests you can do now"
							: hideCompleted
								? "Hiding completed quests"
								: "Showing only eligible quests"}
					</h3>
					<p>
						{playerName} has {questPoints} Quest Points ({completedCount} completed, {remainingQuestsCount} remaining)
					</p>
				</div>
			)}

			<QuestDisplay
				quests={filteredQuests}
				isCompact={settings.isCompact}
				onQuestClick={handleQuestClick}
				labelColor={settings.labelColor || undefined}
				todoList={todoQuests}
				onAddToTodo={handleAddToTodo}
				onRemoveFromTodo={handleRemoveFromTodo}
			/>

			<ActionIcon
				color={settings.buttonColor || ""}
				size="sm"
				variant="outline"
				onClick={openCoffee}
				styles={{
					root: { position: "fixed", bottom: "1.375rem", left: "5.425rem" },
				}}
			>
				<IconCoffee />
			</ActionIcon>
			<ActionIcon
				color={settings.buttonColor || ""}
				size="sm"
				variant="outline"
				onClick={openDiscord}
				styles={{
					root: { position: "fixed", bottom: "1.375rem", left: "3.750rem" },
				}}
			>
				<IconBrandDiscord />
			</ActionIcon>
			<ActionIcon
				color={settings.buttonColor || ""}
				onClick={openNotes}
				size="sm"
				variant="outline"
				styles={{
					root: { position: "fixed", bottom: "1.375rem", left: "0.313rem" },
				}}
			>
				<IconPlus />
			</ActionIcon>
			<ActionIcon
				variant="outline"
				size="sm"
				color={settings.buttonColor || ""}
				styles={{
					root: { bottom: "1.375rem", left: "2.050rem", position: "fixed" },
				}}
				onClick={openSettingsModal}
			>
				<IconSettings />
			</ActionIcon>
		</>
	);
};

export default QuestCarousel;
