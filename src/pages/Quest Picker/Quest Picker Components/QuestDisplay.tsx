// Quest Picker Components/QuestDisplay.tsx
import React from "react";
import { Carousel } from "@mantine/carousel";
import { Accordion, AccordionControl } from "@mantine/core";
import { NavLink } from "react-router-dom";
import { IconArrowRight, IconArrowLeft } from "@tabler/icons-react";

// Define a unified quest type for internal use
type Quest = {
	title: string;
};

interface QuestDisplayProps {
	quests: Quest[];
	isCompact: boolean;
	onQuestClick: (questName: string) => void;
	labelColor?: string;
}

const QuestItemContent: React.FC<{ quest: Quest }> = ({ quest }) => {
	const questImage =
		"./Rewards/" +
		quest.title.toLowerCase().replace(/[^a-zA-Z0-9]/g, "") +
		"reward.webp";

	return (
		<div className="caroQTitle">
			{quest.title}
			<img loading="lazy" src={questImage} alt="Reward" aria-hidden="true" />
		</div>
	);
};

export const QuestDisplay: React.FC<QuestDisplayProps> = ({
	quests,
	isCompact,
	onQuestClick,
	labelColor,
}) => {
	const getModifiedQuestName = (name: string) => {
		return name
			.toLowerCase()
			.split(" ")
			.join("")
			.replace(/[!,`']/g, "");
	};

	if (!quests) return null;

	if (isCompact) {
		return (
			<Accordion>
				{quests.map((quest) => (
					<Accordion.Item key={quest.title} value={quest.title}>
						<NavLink
							to="/QuestPage"
							state={{
								questName: quest.title,
								modified: getModifiedQuestName(quest.title),
							}}
							style={{ textDecoration: "none", color: "inherit" }}
							onClick={() => onQuestClick(quest.title)}
						>
							<AccordionControl
								chevron={null}
								styles={{
									control: { color: labelColor || "" },
									chevron: { display: "none" },
								}}
							>
								{quest.title}
							</AccordionControl>
						</NavLink>
					</Accordion.Item>
				))}
			</Accordion>
		);
	}

	return (
		<div className="caroContainer">
			<Carousel
				slideSize={{ base: "100%" }}
				height={450}
				nextControlIcon={<IconArrowRight size={24} />}
				previousControlIcon={<IconArrowLeft size={24} />}
			>
				{quests.map((quest) => (
					<Carousel.Slide key={quest.title}>
						<NavLink
							to="/QuestPage"
							state={{
								questName: quest.title,
								modified: getModifiedQuestName(quest.title),
							}}
							style={{ textDecoration: "none" }}
						>
							<QuestItemContent quest={quest} />
						</NavLink>
					</Carousel.Slide>
				))}
			</Carousel>
		</div>
	);
};
