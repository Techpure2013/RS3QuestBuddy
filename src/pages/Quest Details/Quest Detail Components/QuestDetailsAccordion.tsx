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
];

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

			// ✅ Force Quest Points into Other Requirements
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

	// ✅ Deduplicate and sort
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

	return (
		<Grid gutter="lg">
			{/* === Top Row: Required Quests === */}
			<Grid.Col span={12}>
				{hasAnyRequirements ? (
					<Card
						shadow="lg"
						padding="lg"
						radius="md"
						withBorder
						style={{
							border: "2px solid var(--mantine-color-teal-6)",
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

						{/* ✅ Success message if all quests + skills are met */}
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
												border: "2px solid var(--mantine-color-green-6)",
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

										{/* Only show Other Requirements if they exist */}
										{uniqueOtherReqs.length > 0 && (
											<Grid>
												<Grid.Col span={{ base: 12, md: 3 }}>
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
												</Grid.Col>
											</Grid>
										)}
									</>
								);
							}

							// ❌ If not all met → show the normal lists
							return (
								<Grid>
									{/* Quests (alphabetical) */}
									{uniqueQuestReqs.length > 0 && (
										<Grid.Col span={{ base: 12, md: 3 }}>
											<Title order={5} mb="xs" c="teal.4">
												Quests
											</Title>
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
										</Grid.Col>
									)}

									{/* Skills (numerical order) */}
									{uniqueSkillReqs.length > 0 && (
										<Grid.Col span={{ base: 12, md: 3 }}>
											<Title order={5} mb="xs" c="blue.4">
												Skills
											</Title>
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
										</Grid.Col>
									)}

									{/* Ironman/Hardcore */}
									{uniqueIronReqs.length > 0 && (
										<Grid.Col span={{ base: 12, md: 3 }}>
											<Title order={5} mb="xs" c="yellow.6">
												Ironman / Hardcore
											</Title>
											<List spacing="sm" size="sm">
												{uniqueIronReqs.map((requirement, idx) => (
													<List.Item key={idx}>
														<Text span size="sm" fw={500} c="yellow">
															{requirement}
														</Text>
													</List.Item>
												))}
											</List>
										</Grid.Col>
									)}

									{/* Other Requirements */}
									{uniqueOtherReqs.length > 0 && (
										<Grid.Col span={{ base: 12, md: 3 }}>
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
										</Grid.Col>
									)}
								</Grid>
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
							border: "2px solid var(--mantine-color-gray-6)",
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

			{/* === Second Row: Required Items, Recommended Items === */}
			<Grid.Col span={{ base: 12, md: 6 }}>
				<Card
					shadow="sm"
					padding="md"
					radius="md"
					withBorder
					style={{
						border: "2px solid var(--mantine-color-orange-6)",
						background: "linear-gradient(135deg, #1e1e1e, #141414)",
					}}
				>
					<Group mb="sm">
						<IconPackage size={20} color="var(--mantine-color-orange-5)" />
						<Title order={4} c="orange.4">
							Required Items
						</Title>
					</Group>
					<List spacing="sm" size="sm">
						{deduplicatedQuestDetails?.map((quest, questIndex) =>
							quest.ItemsRequired.map((item: string, itemIndex: number) => {
								const uniqueKey = `${quest.Quest}-req-${questIndex}-${itemIndex}`;
								const isChecked = checkedItemsRequired.has(uniqueKey);

								return (
									<List.Item key={uniqueKey}>
										<Checkbox
											size="sm"
											label={item}
											checked={isChecked}
											onChange={() => handleCheckedItemsRequired(uniqueKey)}
										/>
									</List.Item>
								);
							}),
						)}
					</List>
				</Card>
			</Grid.Col>

			<Grid.Col span={{ base: 12, md: 6 }}>
				<Card
					shadow="sm"
					padding="md"
					radius="md"
					withBorder
					style={{
						border: "2px solid var(--mantine-color-blue-6)",
						background: "linear-gradient(135deg, #1e1e1e, #141414)",
					}}
				>
					<Group mb="sm">
						<IconBox size={20} color="var(--mantine-color-blue-5)" />
						<Title order={4} c="blue.4">
							Recommended Items
						</Title>
					</Group>
					<List spacing="sm" size="sm">
						{deduplicatedQuestDetails?.map((quest, questIndex) =>
							quest.Recommended.map((item: string, itemIndex: number) => {
								const uniqueKey = `${quest.Quest}-rec-${questIndex}-${itemIndex}`;
								const isChecked = checkedItemsRecommended.has(uniqueKey);

								return (
									<List.Item key={uniqueKey}>
										<Checkbox
											size="sm"
											label={item}
											checked={isChecked}
											onChange={() => handleCheckedItemsRecommended(uniqueKey)}
										/>
									</List.Item>
								);
							}),
						)}
					</List>
				</Card>
			</Grid.Col>

			{/* === Bottom Row: Enemies === */}
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
							border: "2px solid var(--mantine-color-red-6)",
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
									// ✅ Extract all levels (handles multiple like "70, 72, 75, or 78")
									const levelMatches = enemy.match(/\d+/g);
									const levels = levelMatches
										? levelMatches.map((n) => parseInt(n, 10))
										: [];

									// ✅ Extract quantity (numbers or "at least X")
									const quantityMatch = enemy.match(/^(at least\s*\d+|\d+)/i);
									const quantity = quantityMatch ? quantityMatch[0] : null;

									// ✅ Dangerous if ANY level > 30
									const isDangerous = levels.some((lvl) => lvl > 30);

									return (
										<List.Item key={idx}>
											{isDangerous ? (
												<Group gap="xs">
													<Badge color="red" size="sm" variant="filled">
														Dangerous
													</Badge>
													<Text fw={600} c="red.5">
														{quantity
															? `${quantity} ${enemy.replace(quantity, "").trim()}`
															: enemy}
													</Text>
												</Group>
											) : (
												<Text>
													{quantity
														? `${quantity} ${enemy.replace(quantity, "").trim()}`
														: enemy}
												</Text>
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
