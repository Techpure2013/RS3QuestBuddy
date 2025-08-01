import React, { useEffect, useMemo, useState } from "react";
import { Button, Modal, ActionIcon, Group, Badge, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
	IconBrandDiscord,
	IconCoffee,
	IconPlus,
	IconSettings,
	IconX,
} from "@tabler/icons-react";

// Imported Types
import { EnrichedQuest } from "./Quest Picker Components/useQuestData";

// Imported Hooks
import { useUISettings } from "./Quest Picker Components/useUISettings";
import { useQuestData } from "./Quest Picker Components/useQuestData";
import { SearchControls } from "./Quest Picker Components/SearchControls";
import { QuestDisplay } from "./Quest Picker Components/QuestDisplay";
import MenuInterface from "./Quest Picker Components/MenuInterface";
import { ironmanQuestOrder } from "./../../Quest Data/ironmanQuestOrder";
import { Settings } from "./../Settings/Settings";
import { UserNotes } from "../Settings/userNotes";

const QuestCarousel: React.FC = () => {
	// --- HOOKS ---
	const [searchQuery, setSearchQuery] = useState("");
	const { uiState, loadUserSettings } = useUISettings();
	const {
		playerName,
		playerFound,
		isSorted,
		isLoading,
		questPoints,
		displayQuests,
		remainingQuestsCount,
		searchForPlayer,
		clearPlayerSearch,
		setSortState,
	} = useQuestData();

	const [settingsModal, { open: openSettings, close: closeSettings }] =
		useDisclosure(false);
	const [notesModal, { open: openNotes, close: closeNotes }] =
		useDisclosure(false);
	const [activeFilters, setActiveFilters] = useState<
		{ type: string; value: string }[]
	>([]);
	const [activeSort, setActiveSort] = useState<string | null>(null);
	useEffect(() => {
		const KEY_TO_CLEAR_ON_RELOAD = "staticQuestList";

		const navigationEntries = performance.getEntriesByType("navigation");

		if (navigationEntries.length > 0) {
			const navTiming = navigationEntries[0] as PerformanceNavigationTiming;

			if (navTiming.type === "reload") {
				console.log(
					`Page was reloaded. Removing '${KEY_TO_CLEAR_ON_RELOAD}' from localStorage.`,
				);
				sessionStorage.removeItem(KEY_TO_CLEAR_ON_RELOAD);
			}
		}
	}, []);
	// --- DATA FILTERING ---
	const handleFilterChange = (type: string, value: string) => {
		if (
			value === "Quest Points" ||
			value === "Release Date" ||
			value === "Efficient Ironman Quests"
		) {
			setActiveSort(value);
		} else {
			setActiveFilters((currentFilters) => {
				const existingFilterIndex = currentFilters.findIndex(
					(f) => f.type === type,
				);
				const newFilter = { type, value };
				if (existingFilterIndex !== -1) {
					const newFilters = [...currentFilters];
					newFilters[existingFilterIndex] = newFilter;
					return newFilters;
				} else {
					return [...currentFilters, newFilter];
				}
			});
		}
	};
	const removeFilter = (filterToRemove: { type: string; value: string }) => {
		setActiveFilters((currentFilters) =>
			currentFilters.filter(
				(f) => f.type !== filterToRemove.type || f.value !== filterToRemove.value,
			),
		);
	};
	const clearSort = () => {
		setActiveSort(null);
	};
	const clearAll = () => {
		setActiveFilters([]);
		setActiveSort(null);
	};

	const getQuestTitle = (quest: EnrichedQuest): string =>
		quest?.questName || quest?.title || "";

	let fullyFilteredQuests: EnrichedQuest[] = useMemo(() => {
		const searchFiltered =
			displayQuests?.filter((quest) =>
				getQuestTitle(quest).toLowerCase().includes(searchQuery.toLowerCase()),
			) || [];

		let menuFiltered = searchFiltered;
		if (activeFilters.length > 0) {
			menuFiltered = searchFiltered.filter((quest) => {
				return activeFilters.every((filter) => {
					switch (filter.type) {
						case "Quest Age":
							return quest.questAge === filter.value;
						case "Series":
							return quest.series === filter.value;
						default:
							return true;
					}
				});
			});
		}

		let listToSort =
			menuFiltered.length === 0 && activeFilters.length > 0
				? searchFiltered
				: menuFiltered;

		if (activeSort === "Efficient Ironman Quests") {
			const orderMap = new Map(
				ironmanQuestOrder.map((questName, index) => [questName, index]),
			);
			listToSort = [...listToSort].sort((a, b) => {
				const indexA = orderMap.get(a.questName) ?? Infinity;
				const indexB = orderMap.get(b.questName) ?? Infinity;
				return indexA - indexB;
			});
		} else if (activeSort === "Quest Points") {
			listToSort = [...listToSort].sort((a, b) => {
				const pointsA = a.questPoints || 0;
				const pointsB = b.questPoints || 0;
				return pointsB - pointsA;
			});
		} else if (activeSort === "Release Date") {
			listToSort = [...listToSort].sort((a, b) => {
				const dateA = a.releaseDate
					? new Date(a.releaseDate)
					: new Date("2100-01-01");
				const dateB = b.releaseDate
					? new Date(b.releaseDate)
					: new Date("2100-01-01");
				return dateA.getTime() - dateB.getTime();
			});
		}
		return listToSort;
	}, [displayQuests, searchQuery, activeFilters, activeSort]);
	if (fullyFilteredQuests.length === 0) {
		fullyFilteredQuests = displayQuests;
	}
	// --- EVENT HANDLERS ---
	const handleSettingsClose = () => {
		closeSettings();
		loadUserSettings();
	};
	function openDiscord(): void {
		const newWindow = window.open(
			"https://discord.gg/qFftZF7Usa",
			"_blank",
			"noopener,noreferrer",
		);
		if (newWindow) newWindow.opener = null;
	}
	function openCoffee(): void {
		const newWindow = window.open("https://buymeacoffee.com/rs3questbuddy");
		if (newWindow) newWindow.opener = null;
	}
	const handleQuestClick = (questName: string) => {
		window.scrollTo(0, 0);
	};

	// --- RENDER ---
	return (
		<>
			<Modal
				title="Settings"
				opened={settingsModal}
				onClose={handleSettingsClose}
				suppressHydrationWarning
			>
				<Settings />
			</Modal>
			<Modal title="Notes" opened={notesModal} onClose={closeNotes}>
				<UserNotes />
			</Modal>

			<div className="QuestFilters">
				<MenuInterface onFilterChange={handleFilterChange} />
			</div>

			<SearchControls
				onPlayerSearch={searchForPlayer}
				onQuestSearchChange={setSearchQuery}
				isLoading={isLoading}
				playerFound={playerFound}
				initialPlayerName={playerName}
				labelColor={uiState.hasLabelColor ? uiState.userLabelColor : undefined}
			/>

			<div>
				{!isSorted ? (
					<>
						<Button
							variant="outline"
							onClick={() => setSortState(true)}
							disabled={!playerFound}
						>
							Sort Out Completed Quests
						</Button>
						<Button variant="outline" onClick={clearPlayerSearch}>
							New Player Search
						</Button>
					</>
				) : (
					<Button
						variant="outline"
						onClick={() => setSortState(false)}
						disabled={!playerFound}
					>
						Un-Sort
					</Button>
				)}
			</div>

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

			{isSorted && playerFound && (
				<div className="caroQTitle">
					<h3>Quests have been sorted by quests you can do!</h3>
					<p>
						{playerName} has a total of {questPoints} Quest Points and has{" "}
						{remainingQuestsCount} quests you can do at this current time!
					</p>
				</div>
			)}

			<QuestDisplay
				quests={fullyFilteredQuests.map((q) => ({
					title: getQuestTitle(q),
				}))}
				isCompact={uiState.isCompact}
				onQuestClick={handleQuestClick}
				labelColor={uiState.hasLabelColor ? uiState.userLabelColor : undefined}
			/>
			<ActionIcon
				color={uiState.hasButtonColor ? uiState.userButtonColor : ""}
				size={"sm"}
				variant="outline"
				onClick={openCoffee}
				styles={{
					root: {
						position: "fixed",
						bottom: "1.375rem",
						left: "5.425rem",
					},
				}}
			>
				<IconCoffee />
			</ActionIcon>
			<ActionIcon
				color={uiState.hasButtonColor ? uiState.userButtonColor : ""}
				size={"sm"}
				variant="outline"
				onClick={openDiscord}
				styles={{
					root: {
						position: "fixed",
						bottom: "1.375rem",
						left: "3.750rem",
					},
				}}
			>
				<IconBrandDiscord />
			</ActionIcon>
			<ActionIcon
				color={uiState.hasButtonColor ? uiState.userButtonColor : ""}
				onClick={openNotes}
				size={"sm"}
				variant="outline"
				styles={{
					root: {
						position: "fixed",
						bottom: "1.375rem",
						left: "0.313rem",
					},
				}}
			>
				<IconPlus />
			</ActionIcon>
			<ActionIcon
				variant="outline"
				size={"sm"}
				color={uiState.hasButtonColor ? uiState.userButtonColor : ""}
				styles={{
					root: { bottom: "1.375rem", left: "2.050rem", position: "fixed" },
				}}
				onClick={openSettings}
			>
				<IconSettings />
			</ActionIcon>
		</>
	);
};

export default QuestCarousel;
