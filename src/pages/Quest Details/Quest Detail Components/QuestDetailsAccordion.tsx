import React, { useEffect, useState } from "react";
import {
	Card,
	List,
	Checkbox,
	Text,
	Title,
	Badge,
	Group,
	Divider,
	Grid,
} from "@mantine/core";
import {
	IconChecklist,
	IconBox,
	IconSwords,
	IconPackage,
} from "@tabler/icons-react";
import { NavLink } from "react-router-dom";
import { Skills } from "./../../../Fetchers/PlayerStatsSort";
import { PlayerQuestStatus } from "./../../../Fetchers/sortPlayerQuests";

interface UIState {
	hasLabelColor: boolean;
	userLabelColor: string;
	hasColor: boolean;
	userColor: string;
}

interface QuestDetailsGridProps {
	QuestDetails: any[];
	uiState: UIState;
	ignoredRequirements: Set<string>;
	skillLevels: Skills;
	completedQuests: PlayerQuestStatus[];
}

const OTHER_REQUIREMENT_PREFIXES = [
	"Meet Naressa in Senntisten",
	"Unabridged",
	"Be ",
	"Access",
	"Ability to",
	"Time Served",
	"Find",
	"Complete",
	"Rescue Mad Eadgar from the Troll Stronghold",
	"Able To",
	"Claim Kudos",
	"You must be using the standard spells or be able to use Spellbook Swap",
	"Completion of",
	"To make",
	"Achieve",
	"Bring Leela to Senliten's tomb",
	"If Icthlarin's Little Helper was completed prior to the addition of Stolen Hearts and Diamond in the Rough, they must be completed before Contact! can be started (or completed).",
	"Work on the Tai Bwo Wannai Cleanup",
];

// rem breakpoints
const BP_ONE_COL = 40; // < 40rem => 1 column
const BP_TWO_COL = 60; // >= 60rem => 3 columns, otherwise 2

const sectionGap = "1rem";
const cardBorder = "0.125rem";
const minColRem = 16;

const useRemWidth = () => {
	const [remWidth, setRemWidth] = useState<number>(() =>
		typeof window !== "undefined" ? window.innerWidth / 16 : 100,
	);
	useEffect(() => {
		const onResize = () =>
			setRemWidth(typeof window !== "undefined" ? window.innerWidth / 16 : 100);
		onResize();
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, []);
	return remWidth;
};

const QuestDetailsGrid: React.FC<QuestDetailsGridProps> = ({
	QuestDetails,
	ignoredRequirements,
	skillLevels,
	completedQuests,
}) => {
	const REQUIRED_STORAGE_KEY = "checkedItemsRequired";
	const RECOMMENDED_STORAGE_KEY = "checkedItemsRecommended";

	const deduplicatedQuestDetails = Array.isArray(QuestDetails)
		? QuestDetails.filter(
				(quest, index, self) =>
					index === self.findIndex((q) => q.Quest === quest.Quest),
			)
		: [];

	const [checkedItemsRequired, setCheckedItemsRequired] = useState<Set<string>>(
		() => {
			const storedItems = sessionStorage.getItem(REQUIRED_STORAGE_KEY);
			return storedItems ? new Set(JSON.parse(storedItems)) : new Set();
		},
	);

	const [checkedItemsRecommended, setCheckedItemsRecommended] = useState<
		Set<string>
	>(() => {
		const storedItems = sessionStorage.getItem(RECOMMENDED_STORAGE_KEY);
		return storedItems ? new Set(JSON.parse(storedItems)) : new Set();
	});

	useEffect(() => {
		sessionStorage.setItem(
			REQUIRED_STORAGE_KEY,
			JSON.stringify([...checkedItemsRequired]),
		);
	}, [checkedItemsRequired]);

	useEffect(() => {
		sessionStorage.setItem(
			RECOMMENDED_STORAGE_KEY,
			JSON.stringify([...checkedItemsRecommended]),
		);
	}, [checkedItemsRecommended]);

	const handleCheckedItemsRequired = (uniqueKey: string) => {
		setCheckedItemsRequired((prev) => {
			const newSet = new Set(prev);
			newSet.has(uniqueKey) ? newSet.delete(uniqueKey) : newSet.add(uniqueKey);
			return newSet;
		});
	};

	const handleCheckedItemsRecommended = (uniqueKey: string) => {
		setCheckedItemsRecommended((prev) => {
			const newSet = new Set(prev);
			newSet.has(uniqueKey) ? newSet.delete(uniqueKey) : newSet.add(uniqueKey);
			return newSet;
		});
	};

	const checkRequirement = (playerStats: Skills | null, requirement: string) => {
		if (!playerStats) return false;

		let [part1, part2] = requirement.split(" ");
		let requiredLevel: number;
		let skillName: keyof Skills;

		if (part2?.toLowerCase() === "ranged") part2 = "range";

		if (!isNaN(parseInt(part1, 10))) {
			requiredLevel = parseInt(part1, 10);
			skillName = part2?.toLowerCase() as keyof Skills;
		} else if (part2 && !isNaN(parseInt(part2, 10))) {
			requiredLevel = parseInt(part2, 10);
			skillName = part1.toLowerCase() as keyof Skills;
		} else {
			return false;
		}

		return skillName in playerStats
			? playerStats[skillName] >= requiredLevel
			: false;
	};

	// --- Categorize requirements ---
	const questReqs: string[] = [];
	const skillReqs: string[] = [];
	const ironReqs: string[] = [];
	const otherReqs: string[] = [];

	deduplicatedQuestDetails.forEach((quest) => {
		quest.Requirements.forEach((req: string) => {
			if (req.toLowerCase() === "none") return;

			const firstPartIsNumber = !isNaN(parseInt(req.split(" ")[0]));

			// Force Quest Points into Other Requirements
			if (req.toLowerCase().includes("quest point")) {
				otherReqs.push(req);
			} else if (
				req.toLowerCase().includes("ironman") ||
				req.toLowerCase().includes("ironwoman") ||
				req.toLowerCase().includes("ironmen") ||
				req.toLowerCase().includes("hardcore")
			) {
				ironReqs.push(req);
			} else if (
				OTHER_REQUIREMENT_PREFIXES.some((prefix) => req.startsWith(prefix))
			) {
				otherReqs.push(req);
			} else if (firstPartIsNumber) {
				skillReqs.push(req);
			} else {
				questReqs.push(req);
			}
		});
	});

	// Deduplicate and sort
	const uniqueQuestReqs = Array.from(new Set(questReqs)).sort((a, b) =>
		a.localeCompare(b),
	);

	const uniqueSkillReqs = Array.from(new Set(skillReqs)).sort(
		(a, b) => parseInt(a.split(" ")[0]) - parseInt(b.split(" ")[0]),
	);

	const uniqueIronReqs = Array.from(new Set(ironReqs)).sort((a, b) =>
		a.localeCompare(b),
	);

	const uniqueOtherReqs = Array.from(new Set(otherReqs)).sort((a, b) =>
		a.localeCompare(b),
	);

	const hasAnyRequirements =
		uniqueQuestReqs.length ||
		uniqueSkillReqs.length ||
		uniqueIronReqs.length ||
		uniqueOtherReqs.length;

	// Responsive column counts based on rem width
	const remWidth = useRemWidth();
	const trioCols = remWidth < BP_ONE_COL ? 1 : remWidth < BP_TWO_COL ? 2 : 3;
	const itemsCols = remWidth < BP_ONE_COL ? 1 : 2;

	return (
		<Grid gutter="lg" style={{ gap: sectionGap }}>
			{/* === Required Quests & Skills === */}
			<Grid.Col span={12}>
				{hasAnyRequirements ? (
					<Card
						shadow="lg"
						padding="lg"
						radius="md"
						withBorder
						style={{
							border: `${cardBorder} solid var(--mantine-color-teal-6)`,
							background: "linear-gradient(135deg, #1e1e1e, #141414)",
						}}
					>
						<Group mb="sm">
							<IconChecklist size={24} color="var(--mantine-color-teal-5)" />
							<Title order={2} c="teal.3">
								Required Quests & Skills
							</Title>
						</Group>
						<Divider mb="sm" />

						{(() => {
							const allQuestsMet =
								uniqueQuestReqs.length === 0 ||
								uniqueQuestReqs.every((req) =>
									completedQuests?.some((q) => q.title === req),
								);

							const allSkillsMet =
								uniqueSkillReqs.length === 0 ||
								uniqueSkillReqs.every((req) => checkRequirement(skillLevels, req));

							if (allQuestsMet && allSkillsMet) {
								return (
									<>
										<Card
											shadow="sm"
											padding="sm"
											radius="md"
											withBorder
											style={{
												marginBottom: "1rem",
												border: `${cardBorder} solid var(--mantine-color-green-6)`,
												background: "linear-gradient(135deg, #1a2e1a, #141414)",
											}}
										>
											<Text fw={600} c="green.4">
												✅ All required quests and skills are met!
											</Text>
											{uniqueOtherReqs.length > 0 && (
												<Text size="sm" c="orange.4">
													⚠️ Other requirements still need to be checked manually.
												</Text>
											)}
										</Card>

										{uniqueOtherReqs.length > 0 && (
											<>
												<Divider my="sm" />
												<Title order={5} mb="xs" c="orange.6">
													Other Requirements
												</Title>
												<List spacing="sm" size="sm">
													{uniqueOtherReqs.map((requirement, idx) => (
														<List.Item key={idx}>
															<Text span size="sm" fw={500} c="orange">
																{requirement}
															</Text>
														</List.Item>
													))}
												</List>
											</>
										)}
									</>
								);
							}

							// Responsive 3/2/1 columns (no horizontal scroll)
							const subCardBase: React.CSSProperties = {
								width: "100%",
								boxSizing: "border-box",
								background: "linear-gradient(135deg, #151515, #101010)",
								overflowWrap: "anywhere",
							};

							return (
								<div
									style={{
										display: "grid",
										gap: sectionGap,
										gridTemplateColumns: `repeat(${trioCols}, 1fr)`,
										alignItems: "start",
									}}
								>
									{/* Quests */}
									{uniqueQuestReqs.length > 0 && (
										<Card
											padding="md"
											radius="md"
											withBorder
											style={{
												...subCardBase,
												border: `${cardBorder} solid var(--mantine-color-teal-6)`,
											}}
										>
											<Title order={5} mb="xs" c="teal.4">
												Quests
											</Title>
											<Divider mb="xs" />
											<List spacing="sm" size="sm">
												{uniqueQuestReqs.map((requirement, idx) => {
													const isComplete = completedQuests?.some(
														(q) => q.title === requirement,
													);
													const color = isComplete ? "#24BF58" : "#C64340";

													if (ignoredRequirements.has(requirement)) {
														return (
															<List.Item key={idx}>
																<Text span size="sm" fw={500} c="orange">
																	{requirement}
																</Text>
															</List.Item>
														);
													}

													return (
														<List.Item key={idx}>
															<NavLink
																to="/QuestPage"
																state={{
																	questName: requirement,
																	modified: requirement.toLowerCase().replace(/[!,']/g, ""),
																}}
																style={{
																	display: "block",
																	color: color,
																	textDecoration: "none",
																}}
															>
																{requirement}
															</NavLink>
														</List.Item>
													);
												})}
											</List>
										</Card>
									)}

									{/* Skills */}
									{uniqueSkillReqs.length > 0 && (
										<Card
											padding="md"
											radius="md"
											withBorder
											style={{
												...subCardBase,
												border: `${cardBorder} solid var(--mantine-color-blue-6)`,
											}}
										>
											<Title order={5} mb="xs" c="blue.4">
												Skills
											</Title>
											<Divider mb="xs" />
											<List spacing="sm" size="sm">
												{uniqueSkillReqs.map((requirement, idx) => {
													const hasSkill = checkRequirement(skillLevels, requirement);
													const color = hasSkill ? "#24BF58" : "#C64340";
													return (
														<List.Item key={idx}>
															<Text span size="sm" fw={500} c={color}>
																{requirement}
															</Text>
														</List.Item>
													);
												})}
											</List>
										</Card>
									)}

									{/* Other Requirements */}
									{uniqueOtherReqs.length > 0 && (
										<Card
											padding="md"
											radius="md"
											withBorder
											style={{
												...subCardBase,
												border: `${cardBorder} solid var(--mantine-color-orange-6)`,
											}}
										>
											<Title order={5} mb="xs" c="orange.6">
												Other Requirements
											</Title>
											<Divider mb="xs" />
											<List spacing="sm" size="sm">
												{uniqueOtherReqs.map((requirement, idx) => (
													<List.Item key={idx}>
														<Text span size="sm" fw={500} c="orange">
															{requirement}
														</Text>
													</List.Item>
												))}
											</List>
										</Card>
									)}
								</div>
							);
						})()}
					</Card>
				) : (
					<Card
						shadow="sm"
						padding="md"
						radius="md"
						withBorder
						style={{
							border: `${cardBorder} solid var(--mantine-color-gray-6)`,
							background: "linear-gradient(135deg, #1e1e1e, #141414)",
						}}
					>
						<Group>
							<IconChecklist size={20} color="var(--mantine-color-gray-5)" />
							<Title order={4}>No Required Quests</Title>
						</Group>
						<Text size="sm" c="dimmed">
							This quest does not require any other quests to be completed.
						</Text>
					</Card>
				)}
			</Grid.Col>

			{/* === Items: Single Card with two panels (Required left, Recommended right) === */}
			<Grid.Col span={12}>
				<Card
					shadow="sm"
					padding="lg"
					radius="md"
					withBorder
					style={{
						border: "0.125rem solid var(--mantine-color-gray-6)",
						background: "linear-gradient(135deg, #1e1e1e, #141414)",
					}}
				>
					{(function ItemsGrid() {
						// rem-based responsive columns
						const remWidth =
							typeof window !== "undefined" ? window.innerWidth / 16 : 100;
						const cols = remWidth < 40 ? 1 : 2; // < 40rem => stack

						// Collect items and normalize "None"
						const requiredItems = deduplicatedQuestDetails
							?.flatMap((q) => q.ItemsRequired || [])
							.filter(Boolean);
						const recommendedItems = deduplicatedQuestDetails
							?.flatMap((q) => q.Recommended || [])
							.filter(Boolean);

						const requiredIsNone =
							!requiredItems ||
							requiredItems.length === 0 ||
							requiredItems.every((it) => String(it).trim().toLowerCase() === "none");

						const recommendedIsNone =
							!recommendedItems ||
							recommendedItems.length === 0 ||
							recommendedItems.every(
								(it) => String(it).trim().toLowerCase() === "none",
							);

						const gridStyle: React.CSSProperties = {
							display: "grid",
							gap: "1rem",
							gridTemplateColumns: `repeat(${cols}, minmax(16rem, 1fr))`,
							alignItems: "start",
						};

						const panelBase: React.CSSProperties = {
							width: "100%",
							boxSizing: "border-box",
							background: "linear-gradient(135deg, #151515, #101010)",
							borderRadius: "0.5rem",
							padding: "1rem",
						};

						const emptyBox: React.CSSProperties = {
							border: "0.125rem solid var(--mantine-color-gray-6)",
							background: "linear-gradient(135deg, #1e1e1e, #121212)",
							padding: "0.75rem 1rem",
							borderRadius: "0.5rem",
						};

						return (
							<div style={gridStyle}>
								{/* Required Items (Orange) */}
								<div
									style={{
										...panelBase,
										border: "0.125rem solid var(--mantine-color-orange-6)",
									}}
								>
									<Group mb="sm">
										<IconPackage size={20} color="var(--mantine-color-orange-5)" />
										<Title order={4} c="orange.4">
											Required Items
										</Title>
									</Group>

									{requiredIsNone ? (
										<div style={emptyBox}>
											<Group gap="xs">
												<Text fw={600} c="gray.3">
													No Required Items
												</Text>
											</Group>
											<Text size="sm" c="dimmed">
												This quest does not require any specific items.
											</Text>
										</div>
									) : (
										<List spacing="sm" size="sm">
											{requiredItems
												.map((item, idx) => ({ item, idx }))
												.map(({ item, idx }) => {
													const uniqueKey = `req-${idx}-${String(item)}`;
													const isChecked = checkedItemsRequired.has(uniqueKey);
													return (
														<List.Item key={uniqueKey}>
															<Checkbox
																size="sm"
																label={String(item)}
																checked={isChecked}
																onChange={() => handleCheckedItemsRequired(uniqueKey)}
															/>
														</List.Item>
													);
												})}
										</List>
									)}
								</div>

								{/* Recommended Items (Blue) */}
								<div
									style={{
										...panelBase,
										border: "0.125rem solid var(--mantine-color-blue-6)",
									}}
								>
									<Group mb="sm">
										<IconBox size={20} color="var(--mantine-color-blue-5)" />
										<Title order={4} c="blue.4">
											Recommended Items
										</Title>
									</Group>

									{recommendedIsNone ? (
										<div style={emptyBox}>
											<Group gap="xs">
												<Text fw={600} c="gray.3">
													No Recommended Items
												</Text>
											</Group>
											<Text size="sm" c="dimmed">
												There are no specific recommendations for this quest.
											</Text>
										</div>
									) : (
										<List spacing="sm" size="sm">
											{recommendedItems
												.map((item, idx) => ({ item, idx }))
												.map(({ item, idx }) => {
													const uniqueKey = `rec-${idx}-${String(item)}`;
													const isChecked = checkedItemsRecommended.has(uniqueKey);
													return (
														<List.Item key={uniqueKey}>
															<Checkbox
																size="sm"
																label={String(item)}
																checked={isChecked}
																onChange={() => handleCheckedItemsRecommended(uniqueKey)}
															/>
														</List.Item>
													);
												})}
										</List>
									)}
								</div>
							</div>
						);
					})()}
				</Card>
			</Grid.Col>

			{/* === Enemies === */}
			<Grid.Col span={12}>
				{deduplicatedQuestDetails?.some(
					(quest) =>
						quest.EnemiesToDefeat &&
						quest.EnemiesToDefeat.length > 0 &&
						!quest.EnemiesToDefeat.includes("None"),
				) && (
					<Card
						shadow="sm"
						padding="md"
						radius="md"
						withBorder
						style={{
							border: `${cardBorder} solid var(--mantine-color-red-6)`,
							background: "linear-gradient(135deg, #1e1e1e, #141414)",
						}}
					>
						<Group mb="xs">
							<IconSwords size={18} color="var(--mantine-color-red-5)" />
							<Title order={5} c="red.4">
								Enemies
							</Title>
						</Group>
						<List spacing="xs" size="sm">
							{deduplicatedQuestDetails
								?.flatMap((quest) => quest.EnemiesToDefeat)
								.filter((enemy) => enemy.toLowerCase() !== "none")
								.sort((a, b) => a.localeCompare(b))
								.map((enemy: string, idx: number) => {
									// Extract numeric tokens
									const numMatches = enemy.match(/\d+/g);
									const nums = numMatches ? numMatches.map((n) => parseInt(n, 10)) : [];

									// Quantity at start
									const quantityMatch = enemy.match(/^(at least\s*\d+|\d+)/i);
									const quantity = quantityMatch ? quantityMatch[0] : null;

									// Skip quantity number for danger check if it's the leading token
									const numbersForDanger =
										quantity &&
										nums.length > 0 &&
										enemy.trim().toLowerCase().startsWith(quantity.toLowerCase())
											? nums.slice(1)
											: nums;

									const isDangerous = numbersForDanger.some((n) => n > 30);

									const text = quantity
										? `${quantity} ${enemy.replace(quantity, "").trim()}`
										: enemy;

									return (
										<List.Item key={idx}>
											{isDangerous ? (
												<Group gap="xs">
													<Badge color="red" size="sm" variant="filled">
														Dangerous
													</Badge>
													<Text fw={600} c="red.5">
														{text}
													</Text>
												</Group>
											) : (
												<Text>{text}</Text>
											)}
										</List.Item>
									);
								})}
						</List>
					</Card>
				)}
			</Grid.Col>
		</Grid>
	);
};

export default QuestDetailsGrid;
