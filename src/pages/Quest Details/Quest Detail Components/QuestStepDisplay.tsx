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
	Grid,
	Divider,
	Box,
} from "@mantine/core";
import {
	IconPhotoFilled,
	IconCircleCheck,
	IconInfoCircle,
	IconChecklist,
	IconPointFilled,
	IconClipboardText,
	IconHourglassLow,
} from "@tabler/icons-react";
import { QuestStep } from "./../../../Fetchers/useQuestData";
import { QuestImage } from "./../../../Fetchers/handleNewImage"; // Import the QuestImage type

type CompactQuestStepProps = {
	step: QuestStep;
	index: number;
	isCompleted: boolean;
	images: QuestImage[]; // Accept an array of images
	onImagePopOut: (src: string, height: number, width: number) => void; // Accept a handler
};

export const CompactQuestStep: React.FC<CompactQuestStepProps> = ({
	step,
	index,
	isCompleted,
	images,
	onImagePopOut,
}) => {
	const hasRequiredItems = step.itemsNeeded && step.itemsNeeded.length > 0;
	const hasRecommendedItems =
		step.itemsRecommended && step.itemsRecommended.length > 0;
	const hasItems = hasRequiredItems || hasRecommendedItems;

	return (
		<Accordion.Item value={index.toString()} id={index.toString()}>
			<Accordion.Control
				icon={
					isCompleted ? (
						<ThemeIcon color="teal" size={24} radius="xl">
							<IconCircleCheck size={16} />
						</ThemeIcon>
					) : undefined
				}
			>
				<Text fw={700}>Step {index + 1}</Text>
			</Accordion.Control>
			<Accordion.Panel>
				<Grid>
					<Grid.Col span={hasItems ? 7 : 12}>
						{/* The h="100%" prop was removed from this Paper component */}
						<Paper p="xs" withBorder radius="md">
							<Group justify="space-between">
								<Group gap="xs">
									<ThemeIcon variant="light" color="gray" size={30}>
										<IconClipboardText size={20} />
									</ThemeIcon>
									<Title order={6}>Task</Title>
								</Group>
								{/* FIX: Map over the images array to render icons */}
								{images && images.length > 0 && (
									<Group gap={4} justify="flex-end">
										{images.map((image, imgIndex) => (
											<ActionIcon
												key={imgIndex}
												variant="subtle"
												onClick={() => onImagePopOut(image.src, image.height, image.width)}
											>
												<IconPhotoFilled />
											</ActionIcon>
										))}
									</Group>
								)}
							</Group>
							<Text mt="xs" pl={5}>
								{step.stepDescription}
							</Text>
						</Paper>
					</Grid.Col>

					{hasItems && (
						<Grid.Col span={5}>
							{/* The h="100%" prop was also removed from this Paper component */}
							<Paper p="xs" withBorder radius="md">
								<Stack gap="xs">
									{hasRequiredItems && (
										<div>
											<Group>
												<ThemeIcon variant="light" color="blue" size={30}>
													<IconChecklist size={20} />
												</ThemeIcon>
												<Title order={6}>Items Required</Title>
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
													{step.itemsNeeded.map((item, i) => (
														<List.Item
															key={i}
															icon={
																<ThemeIcon color="gray" size={16} radius="xl">
																	<IconPointFilled size={12} />
																</ThemeIcon>
															}
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
												<Title order={6}>Items Recommended</Title>
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
													{step.itemsRecommended.map((item, i) => (
														<List.Item
															key={i}
															icon={
																<ThemeIcon color="gray" size={16} radius="xl">
																	<IconPointFilled size={12} />
																</ThemeIcon>
															}
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
						</Grid.Col>
					)}
				</Grid>

				{step.additionalStepInformation &&
					step.additionalStepInformation.length > 0 &&
					step.additionalStepInformation[0] !== "" && (
						<Paper p="xs" withBorder mt="md" radius="md">
							<Group>
								<ThemeIcon variant="light" size={30}>
									<IconInfoCircle size={20} />
								</ThemeIcon>
								<Title order={6}>Additional Information</Title>
							</Group>
							<List size="sm" withPadding mt="xs">
								{step.additionalStepInformation.map((info, i) => (
									<List.Item
										key={i}
										mt="xs"
										icon={
											<ThemeIcon color="gray" size={16} radius="xl">
												<IconPointFilled size={12} />
											</ThemeIcon>
										}
									>
										{info}
									</List.Item>
								))}
							</List>
						</Paper>
					)}
			</Accordion.Panel>
		</Accordion.Item>
	);
};
