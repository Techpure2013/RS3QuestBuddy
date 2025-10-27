import React from "react";
import {
	Accordion,
	Text,
	Title,
	List,
	Group,
	ActionIcon,
	ThemeIcon,
	Paper,
	Stack,
	Divider,
	Box,
	Flex,
} from "@mantine/core";
import {
	IconPhotoFilled,
	IconCircleCheck,
	IconInfoCircle,
	IconChecklist,
	IconPointFilled,
	IconHourglassLow,
} from "@tabler/icons-react";
import { QuestStep } from "./../../../Fetchers/useQuestData";
import { QuestImage } from "./../../../Fetchers/handleNewImage";
import { useSettingsStore } from "./../../../pages/Settings/Setting Components/useSettingsStore";
import {
	removeTextFragment,
	replaceChatTag,
	useQuestConditionalSwap,
} from "./../../../util/DescriptionSwap";
type CompactQuestStepProps = {
	step: QuestStep;
	index: number;
	isCompleted: boolean;
	images: QuestImage[];
	onImagePopOut: (src: string, height: number, width: number) => void;
	onStepClick?: (index: number) => void;
	quest: string;
};

export const CompactQuestStep: React.FC<CompactQuestStepProps> = ({
	step,
	index,
	isCompleted,
	images,
	onImagePopOut,
	onStepClick,
	quest,
}) => {
	const filteredRequired =
		step.itemsNeeded?.filter(
			(item) => item.trim() !== "" && item.toLowerCase() !== "none",
		) || [];
	const filteredRecommended =
		step.itemsRecommended?.filter(
			(item) => item.trim() !== "" && item.toLowerCase() !== "none",
		) || [];

	const { settings } = useSettingsStore();
	const hasRequiredItems = filteredRequired.length > 0;
	const hasRecommendedItems = filteredRecommended.length > 0;
	const hasItems = hasRequiredItems || hasRecommendedItems;

	const hasImages = images && images.length > 0;

	const swapResult = useQuestConditionalSwap(quest, step);

	let displayStepDescription = step.stepDescription;
	let displayAdditionalInfo = step.additionalStepInformation || [];
	let activeChat = null;

	if (swapResult) {
		activeChat = swapResult.activeChat;

		if (swapResult.textToDelete) {
			console.log("Attempting to remove text:", {
				// Enclose in quotes to see whitespace clearly
				from: `"${displayStepDescription}"`,
				and: `"${displayAdditionalInfo.join(" | ")}"`,
				removing: `"${swapResult.textToDelete}"`,
			});
			displayStepDescription = removeTextFragment(
				displayStepDescription,
				swapResult.textToDelete,
			);

			displayAdditionalInfo = displayAdditionalInfo.map((info) =>
				removeTextFragment(info, swapResult.textToDelete!),
			);
		}
	}

	if (activeChat) {
		displayStepDescription = replaceChatTag(displayStepDescription, activeChat);
	}

	const filteredInfo = displayAdditionalInfo.filter(
		(info) => info.trim() !== "",
	);
	const hasAdditionalInfo = filteredInfo.length > 0;
	const hasPanelContent = hasItems || hasAdditionalInfo;
	return (
		<Accordion.Item
			value={index.toString()}
			id={index.toString()}
			onClick={() => onStepClick?.(index)}
		>
			<Accordion.Control
				chevron={hasPanelContent ? undefined : <span />}
				onClick={(e) => {
					if (onStepClick) {
						e.preventDefault();
						e.stopPropagation();
						onStepClick(index);
					}
				}}
			>
				<Flex justify="space-between" align="center" gap="md">
					{isCompleted ? (
						<ThemeIcon color="teal" size={24} radius="xl">
							<IconCircleCheck size={16} />
						</ThemeIcon>
					) : (
						<Box w={24} />
					)}
					<Box
						style={{ flex: 1, minWidth: 0 }}
						c={isCompleted ? "green" : undefined}
					>
						<Text c={settings.textColor}>
							<Text fw={700} component="span" c={settings.labelColor}>
								Step {index + 1}:{" "}
							</Text>
							{displayStepDescription}
						</Text>
					</Box>

					<Group
						gap={6}
						justify="flex-end"
						onClick={(e) => e.stopPropagation()}
						style={{ flexShrink: 0 }}
					>
						{hasRequiredItems && (
							<IconChecklist
								size={18}
								color={
									isCompleted
										? "var(--mantine-color-teal-6)"
										: "var(--mantine-color-blue-6)"
								}
								title="Has required items"
							/>
						)}
						{hasRecommendedItems && (
							<IconHourglassLow
								size={18}
								color={
									isCompleted
										? "var(--mantine-color-teal-6)"
										: "var(--mantine-color-gray-6)"
								}
								title="Has recommended items"
							/>
						)}
						{hasAdditionalInfo && (
							<IconInfoCircle
								size={18}
								color={
									isCompleted
										? "var(--mantine-color-teal-6)"
										: "var(--mantine-color-yellow-6)"
								}
								title="Has additional information"
							/>
						)}
						{hasImages &&
							images.map((image, imgIndex) => (
								<div
									key={`step-${index}-img-${imgIndex}`}
									onClick={(e) => e.stopPropagation()}
								>
									<ActionIcon
										variant="subtle"
										color={isCompleted ? "teal" : "gray"}
										title="View step image"
										onClick={() => onImagePopOut(image.src, image.height, image.width)}
										component="div"
									>
										<IconPhotoFilled size={18} />
									</ActionIcon>
								</div>
							))}
					</Group>
				</Flex>
			</Accordion.Control>
			<Accordion.Panel>
				{hasPanelContent && (
					<Stack>
						{hasItems && (
							<Paper p="xs" withBorder radius="md">
								<Stack gap="xs">
									{hasRequiredItems && (
										<div>
											<Group>
												<ThemeIcon variant="light" color="blue" size={30}>
													<IconChecklist size={20} />
												</ThemeIcon>
												<Title order={6} c={settings.labelColor}>
													Items Required
												</Title>
											</Group>
											<Box
												mt="xs"
												style={{
													maxHeight: "7.5rem",
													overflowY: "auto",
													paddingRight: "0.625rem",
												}}
											>
												<List size="sm" withPadding>
													{filteredRequired.map((item, i) => (
														<List.Item
															key={i}
															icon={
																<ThemeIcon color="gray" size={16} radius="xl">
																	<IconPointFilled size={12} />
																</ThemeIcon>
															}
															c={settings.textColor}
														>
															{item}
														</List.Item>
													))}
												</List>
											</Box>
										</div>
									)}

									{hasRequiredItems && hasRecommendedItems && <Divider my="xs" />}

									{hasRecommendedItems && (
										<div>
											<Group>
												<ThemeIcon variant="light" color="gray" size={30}>
													<IconHourglassLow size={20} />
												</ThemeIcon>
												<Title order={6} c={settings.labelColor}>
													Items Recommended
												</Title>
											</Group>
											<Box
												mt="xs"
												style={{
													maxHeight: "7.5rem",
													overflowY: "auto",
													paddingRight: "0.625rem",
												}}
											>
												<List size="sm" withPadding>
													{filteredRecommended.map((item, i) => (
														<List.Item
															key={i}
															icon={
																<ThemeIcon color="gray" size={16} radius="xl">
																	<IconPointFilled size={12} />
																</ThemeIcon>
															}
															c={settings.textColor}
														>
															{item}
														</List.Item>
													))}
												</List>
											</Box>
										</div>
									)}
								</Stack>
							</Paper>
						)}

						{hasAdditionalInfo && (
							<Paper p="xs" withBorder radius="md">
								<Group>
									<ThemeIcon variant="light" size={30}>
										<IconInfoCircle size={20} />
									</ThemeIcon>
									<Title order={6} c={settings.labelColor}>
										Additional Information
									</Title>
								</Group>
								<List size="sm" withPadding mt="xs">
									{filteredInfo.map((info, i) => (
										<List.Item
											key={i}
											mt="xs"
											icon={
												<ThemeIcon color="gray" size={16} radius="xl">
													<IconPointFilled size={12} />
												</ThemeIcon>
											}
											c={settings.textColor}
										>
											{info}
										</List.Item>
									))}
								</List>
							</Paper>
						)}
					</Stack>
				)}
			</Accordion.Panel>
		</Accordion.Item>
	);
};
