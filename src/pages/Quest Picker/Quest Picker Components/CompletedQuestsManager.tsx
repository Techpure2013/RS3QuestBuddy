import React, { useCallback, useMemo, useRef, useState } from "react";
import {
	Button,
	Checkbox,
	Group,
	ScrollArea,
	Stack,
	Text,
	TextInput,
	Badge,
	Select,
	Divider,
	ActionIcon,
	Tooltip,
} from "@mantine/core";
import { IconSearch, IconArrowDown } from "@tabler/icons-react";
import { usePlayerSelector } from "../../../state/usePlayerSelector";
import { PlayerStore } from "../../../state/playerStore";
import type { EnrichedQuest } from "../../../state/playerModel";

interface CompletedQuestsManagerProps {
	onClose: () => void;
}

const CompletedQuestsManager: React.FC<CompletedQuestsManagerProps> = ({ onClose }) => {
	const [search, setSearch] = useState("");
	const [seriesFilter, setSeriesFilter] = useState<string | null>(null);
	const lastClickedIdx = useRef<number | null>(null);

	const allQuests = usePlayerSelector((_, d) => d.enrichedQuests());
	const completedNames = usePlayerSelector((s) => s.player.completedQuestNames);

	const completedSet = useMemo(() => new Set(completedNames), [completedNames]);

	// Build series list for the dropdown
	const seriesOptions = useMemo(() => {
		const seriesCounts = new Map<string, number>();
		for (const q of allQuests) {
			if (q.series && q.series !== "No Series") {
				seriesCounts.set(q.series, (seriesCounts.get(q.series) || 0) + 1);
			}
		}
		return [...seriesCounts.entries()]
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([name, count]) => ({
				value: name,
				label: `${name} (${count})`,
			}));
	}, [allQuests]);

	const filtered = useMemo(() => {
		let result = allQuests;

		if (seriesFilter) {
			result = result.filter((q) => q.series === seriesFilter);
		}

		const q = search.trim().toLowerCase();
		if (q) {
			result = result.filter((quest) =>
				quest.questName.toLowerCase().includes(q)
			);
		}

		return result;
	}, [allQuests, search, seriesFilter]);

	const totalCompleted = completedSet.size;
	const totalQuests = allQuests.length;
	const filteredCompleted = useMemo(
		() => filtered.filter((q) => completedSet.has(q.questName)).length,
		[filtered, completedSet]
	);

	const toggleQuest = useCallback(
		(questName: string, checked: boolean, index: number, shiftKey: boolean) => {
			// Shift+click range selection
			if (shiftKey && lastClickedIdx.current !== null) {
				const start = Math.min(lastClickedIdx.current, index);
				const end = Math.max(lastClickedIdx.current, index);
				const rangeNames = filtered.slice(start, end + 1).map((q) => q.questName);
				const merged = new Set(completedNames);
				for (const n of rangeNames) {
					if (checked) merged.add(n);
					else merged.delete(n);
				}
				PlayerStore.setCompletedQuests([...merged]);
			} else {
				if (checked) {
					PlayerStore.markQuestCompleted(questName);
				} else {
					PlayerStore.markQuestIncomplete(questName);
				}
			}
			lastClickedIdx.current = index;
		},
		[filtered, completedNames]
	);

	const selectAllVisible = useCallback(() => {
		const names = filtered.map((q) => q.questName);
		const merged = new Set(completedNames);
		for (const n of names) merged.add(n);
		PlayerStore.setCompletedQuests([...merged]);
	}, [filtered, completedNames]);

	const deselectAllVisible = useCallback(() => {
		const visibleNames = new Set(filtered.map((q) => q.questName));
		const remaining = completedNames.filter((n) => !visibleNames.has(n));
		PlayerStore.setCompletedQuests(remaining);
	}, [filtered, completedNames]);

	const clearAll = useCallback(() => {
		PlayerStore.setCompletedQuests([]);
	}, []);

	// "Complete up to here" — mark this quest and everything above it in the current list
	const completeUpTo = useCallback(
		(index: number) => {
			const names = filtered.slice(0, index + 1).map((q) => q.questName);
			const merged = new Set(completedNames);
			for (const n of names) merged.add(n);
			PlayerStore.setCompletedQuests([...merged]);
		},
		[filtered, completedNames]
	);

	const isFiltering = !!search || !!seriesFilter;

	return (
		<Stack gap="sm">
			<Group justify="space-between">
				<Text size="sm" c="dimmed">
					{totalCompleted} of {totalQuests} quests completed
				</Text>
				<Badge color="teal" variant="light" size="lg">
					{totalCompleted}
				</Badge>
			</Group>

			<TextInput
				placeholder="Search quests..."
				leftSection={<IconSearch size={16} />}
				value={search}
				onChange={(e) => setSearch(e.currentTarget.value)}
			/>

			<Select
				placeholder="Filter by series..."
				data={seriesOptions}
				value={seriesFilter}
				onChange={setSeriesFilter}
				clearable
				searchable
				size="sm"
			/>

			<Group gap="xs">
				<Button size="compact-sm" variant="light" color="teal" onClick={selectAllVisible}>
					{isFiltering ? `Select Filtered (${filtered.length})` : "Select All"}
				</Button>
				<Button size="compact-sm" variant="light" color="gray" onClick={deselectAllVisible}>
					{isFiltering ? "Deselect Filtered" : "Deselect All"}
				</Button>
				{totalCompleted > 0 && (
					<Button size="compact-sm" variant="light" color="red" onClick={clearAll}>
						Clear All
					</Button>
				)}
			</Group>

			{isFiltering && (
				<Text size="xs" c="dimmed">
					{filteredCompleted} of {filtered.length} filtered quests completed
				</Text>
			)}

			<Divider />

			<Text size="xs" c="dimmed" ta="center">
				Shift+click to select a range. Use the arrow to complete everything above.
			</Text>

			<ScrollArea h={400} offsetScrollbars>
				<Stack gap={4}>
					{filtered.map((quest: EnrichedQuest, index: number) => (
						<Group
							key={quest.questName}
							gap={4}
							wrap="nowrap"
							style={{
								padding: "2px 8px",
								borderRadius: "4px",
								backgroundColor: completedSet.has(quest.questName)
									? "rgba(38, 166, 91, 0.08)"
									: "transparent",
							}}
						>
							<Checkbox
								label={quest.questName}
								checked={completedSet.has(quest.questName)}
								onChange={(e) =>
									toggleQuest(
										quest.questName,
										e.currentTarget.checked,
										index,
										(e.nativeEvent as MouseEvent).shiftKey
									)
								}
								color="teal"
								style={{ flex: 1 }}
							/>
							<Tooltip label="Complete this and all above" position="left">
								<ActionIcon
									variant="subtle"
									color="teal"
									size="xs"
									onClick={() => completeUpTo(index)}
								>
									<IconArrowDown size={14} />
								</ActionIcon>
							</Tooltip>
						</Group>
					))}
					{filtered.length === 0 && (
						<Text c="dimmed" ta="center" size="sm" py="md">
							No quests match your search.
						</Text>
					)}
				</Stack>
			</ScrollArea>

			<Button fullWidth onClick={onClose} variant="light">
				Done
			</Button>
		</Stack>
	);
};

export default CompletedQuestsManager;
