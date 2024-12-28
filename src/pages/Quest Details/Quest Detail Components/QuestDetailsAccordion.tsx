import React from "react";
import { Accordion, List, Image } from "@mantine/core";
import { NavLink } from "react-router-dom";
import { Skills } from "./../../../Fetchers/PlayerStatsSort";
import { PlayerQuestStatus } from "./../../../Fetchers/sortPlayerQuests";
interface UIState {
	hasLabelColor: boolean;
	userLabelColor: string;
	hasColor: boolean;
	userColor: string;
}

interface AccordionComponentProps {
	QuestDetails: any[];
	uiState: UIState;
	expanded: string[];
	setExpanded: (expanded: string[]) => void;
	ignoredRequirements: Set<string>;
	skillLevels: Skills[];
	completedQuests: PlayerQuestStatus[];
	history: any;
}
const AccordionComponent: React.FC<AccordionComponentProps> = ({
	QuestDetails,
	uiState,
	expanded,
	setExpanded,
	ignoredRequirements,
	skillLevels,
	completedQuests,
	history,
}) => {
	const checkRequirement = (
		skillLevels: Skills[],
		requirement: string
	): boolean => {
		let [part1, part2] = requirement.split(" ");
		let requiredLevel: number;
		let skillName: keyof Skills;
		if (part2 !== undefined) {
			if (part2.toLowerCase() === "ranged") {
				part2 = "range";
			}
		}

		if (!isNaN(parseInt(part1, 10))) {
			requiredLevel = parseInt(part1, 10);
			skillName = part2.toLowerCase() as keyof Skills;
		} else if (!isNaN(parseInt(part2, 10))) {
			requiredLevel = parseInt(part2, 10);
			skillName = part1.toLowerCase() as keyof Skills;
		} else {
			return false; // If neither part is numeric, the format is invalid
		}

		// Check if any player in skillLevels matches the requirement
		return skillLevels.some((playerStats) => {
			if (skillName in playerStats) {
				const playerSkillLevel = playerStats[skillName];
				return playerSkillLevel >= requiredLevel;
			} else {
				console.warn(`Skill ${skillName} does not exist in player stats.`);
				return false;
			}
		});
	};

	return (
		<Accordion
			multiple
			defaultValue={expanded}
			onChange={setExpanded}
			chevron={
				<Image
					src={"./assets/QuestIconEdited.png"}
					alt="Quest Icon"
					width="20px"
					height="20px"
				/>
			}
		>
			<Accordion.Item key={"item-1"} value="item-1">
				<Accordion.Control
					styles={{
						control: {
							color: uiState.hasLabelColor ? uiState.userLabelColor : "",
						},
					}}
				>
					Requirements
				</Accordion.Control>
				<Accordion.Panel>
					<div>
						<ul>
							{QuestDetails?.map((quest, questIndex) => {
								return (
									<React.Fragment key={questIndex}>
										{quest.Requirements.map(
											(requirement: string, requirementIndex: number) => {
												// Combine questIndex and requirementIndex to create a unique key
												const uniqueKey = questIndex - requirementIndex;
												let isComplete = false;
												let color = "#C64340";
												let hasSkill = false; // Default to red
												if (skillLevels !== null) {
													hasSkill = checkRequirement(skillLevels, requirement);
													isComplete =
														completedQuests &&
														completedQuests.some((value) => {
															if (value && typeof value === "object" && "title" in value) {
																return (value as { title?: string }).title === requirement;
															}
															return false;
														});
												}

												if (isComplete) {
													color = "#24BF58"; // Green
												}

												const requirementParts = requirement.split(" ");
												const firstPart: number = parseInt(requirementParts[0]);

												return (
													<li
														key={uniqueKey}
														style={{
															display: "block",
														}}
													>
														{!isNaN(firstPart) ||
														requirement === "None" ||
														Array.from(ignoredRequirements).some((prefix) =>
															requirement.startsWith(prefix)
														) ? (
															<span
																style={{
																	color: hasSkill ? "#24BF58" : "#C64340",
																}}
															>
																{requirement}
															</span>
														) : (
															<NavLink
																to="/QuestPage"
																onClick={() => {
																	history.go(0);
																}}
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
																<span>{requirement}</span>
															</NavLink>
														)}
													</li>
												);
											}
										)}
									</React.Fragment>
								);
							})}
						</ul>
					</div>
				</Accordion.Panel>
			</Accordion.Item>
			<Accordion.Item key={"item-2"} value="item-2">
				<Accordion.Control
					className="AccordianControl"
					styles={{
						control: {
							color: uiState.hasLabelColor ? uiState.userLabelColor : "",
						},
					}}
				>
					Start Point
				</Accordion.Control>
				<Accordion.Panel c={uiState.hasColor ? uiState.userColor : ""}>
					<div>
						{QuestDetails?.map((value) => {
							return value.StartPoint;
						})}
					</div>
				</Accordion.Panel>
			</Accordion.Item>
			<Accordion.Item key={"item-3"} value="item-3">
				<Accordion.Control
					className="AccordianControl"
					styles={{
						control: {
							color: uiState.hasLabelColor ? uiState.userLabelColor : "",
						},
					}}
				>
					Is This a Members Quest?
				</Accordion.Control>
				<Accordion.Panel c={uiState.hasColor ? uiState.userColor : ""}>
					<div>
						{QuestDetails?.map((value) => {
							return value.MemberRequirement;
						})}
					</div>
				</Accordion.Panel>
			</Accordion.Item>
			<Accordion.Item key={"item-4"} value="item-4">
				<Accordion.Control
					className="AccordianControl"
					styles={{
						control: {
							color: uiState.hasLabelColor ? uiState.userLabelColor : "",
						},
					}}
				>
					How Long is This Quest?
				</Accordion.Control>
				<Accordion.Panel c={uiState.hasColor ? uiState.userColor : ""}>
					<div>
						{QuestDetails?.map((value) => {
							return value.OfficialLength;
						})}
					</div>
				</Accordion.Panel>
			</Accordion.Item>
			<Accordion.Item key={"item-5"} value="item-5">
				<Accordion.Control
					className="AccordianControl"
					styles={{
						control: {
							color: uiState.hasLabelColor ? uiState.userLabelColor : "",
						},
					}}
				>
					Items You Definitely Need
				</Accordion.Control>
				<Accordion.Panel c={uiState.hasColor ? uiState.userColor : ""}>
					<div>
						<List listStyleType="none">
							{QuestDetails?.map((quest, questIndex) => {
								return (
									<React.Fragment key={questIndex}>
										{quest.ItemsRequired.map((item: string, itemIndex: number) => {
											// Combine questIndex and itemIndex to create a unique key
											const uniqueKey = `${questIndex}-${itemIndex}`;

											return (
												<List.Item key={uniqueKey}>
													{"- "}
													{item}
												</List.Item>
											);
										})}
									</React.Fragment>
								);
							})}
						</List>
					</div>
				</Accordion.Panel>
			</Accordion.Item>
			<Accordion.Item key={"item-6"} value="item-6">
				<Accordion.Control
					className="AccordianControl"
					title="Items You Might Need"
					styles={{
						control: {
							color: uiState.hasLabelColor ? uiState.userLabelColor : "",
						},
					}}
				>
					Items You Might Need
				</Accordion.Control>
				<Accordion.Panel c={uiState.hasColor ? uiState.userColor : ""}>
					<div>
						<List listStyleType="none">
							{QuestDetails?.map((quest, questIndex) => {
								return (
									<React.Fragment key={questIndex}>
										{quest.Recommended.map((item: string, itemIndex: number) => {
											// Combine questIndex and itemIndex to create a unique key
											const uniqueKey = `${questIndex}-${itemIndex}`;

											return (
												<List.Item key={uniqueKey}>
													{"- "}
													{item}
												</List.Item>
											);
										})}
									</React.Fragment>
								);
							})}
						</List>
					</div>
				</Accordion.Panel>
			</Accordion.Item>
			<Accordion.Item key={"item-7"} value="item-7">
				<Accordion.Control
					className="AccordianControl"
					styles={{
						control: {
							color: uiState.hasLabelColor ? uiState.userLabelColor : "",
						},
					}}
				>
					Enemies To Look Out For
				</Accordion.Control>
				<Accordion.Panel c={uiState.hasColor ? uiState.userColor : ""}>
					<div>
						<List listStyleType="none">
							{QuestDetails?.map((quest, questIndex) => (
								<React.Fragment key={questIndex}>
									{quest.EnemiesToDefeat.map((value: string, enemiesIndex: number) => {
										const UniqueID = `${questIndex}-${enemiesIndex}`;
										return (
											<List.Item key={UniqueID}>
												{"- "}
												{value}
											</List.Item>
										);
									})}
								</React.Fragment>
							))}
						</List>
					</div>
				</Accordion.Panel>
			</Accordion.Item>
		</Accordion>
	);
};

export default AccordionComponent;
