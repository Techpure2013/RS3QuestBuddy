// src/pages/Quest Picker/Quest Picker Components/QuestTodoList.tsx

import {
	Stack,
	Text,
	Group,
	ActionIcon,
	Title,
	Center,
	ScrollArea,
	Button,
	ThemeIcon,
} from "@mantine/core";
import { IconNotebook, IconX } from "@tabler/icons-react";
import { NavLink } from "react-router-dom";

interface QuestTodoListProps {
	quests: string[];
	onRemoveQuest: (questName: string) => void;
	onClearAll: () => void; // New prop for the "Clear All" button
}

const QuestTodoList: React.FC<QuestTodoListProps> = ({
	quests,
	onRemoveQuest,
	onClearAll,
}) => {
	if (quests.length === 0) {
		return (
			<Center style={{ height: 200 }}>
				<Stack align="center" gap="md">
					<ThemeIcon variant="light" size={60} radius="xl">
						<IconNotebook style={{ width: "60%", height: "60%" }} />
					</ThemeIcon>
					<Title order={4} c="dimmed">
						Your Plan is Empty
					</Title>
					<Text c="dimmed" size="sm" ta="center">
						Add quests from the main list using the '+' icon to start building your
						adventure plan.
					</Text>
				</Stack>
			</Center>
		);
	}

	const getModifiedQuestName = (name: string) => {
		return name
			.toLowerCase()
			.split(" ")
			.join("")
			.replace(/[!,`']/g, "");
	};

	return (
		<>
			<ScrollArea style={{ height: "clamp(200px, 50vh, 400px)" }} p="xs">
				<Stack>
					{quests.map((questName) => (
						<Group
							key={questName}
							justify="space-between"
							className="todo-item" // Add a class for CSS styling
						>
							<NavLink
								to="/QuestPage"
								state={{
									questName: questName,
									modified: getModifiedQuestName(questName),
								}}
								style={{
									textDecoration: "none",
									color: "inherit",
									flexGrow: 1,
								}}
							>
								<Text>{questName}</Text>
							</NavLink>
							<ActionIcon
								variant="subtle"
								color="red"
								onClick={() => onRemoveQuest(questName)}
								title={`Remove ${questName} from list`}
							>
								<IconX size={16} />
							</ActionIcon>
						</Group>
					))}
				</Stack>
			</ScrollArea>
			<Group justify="flex-end" mt="md">
				<Button variant="outline" color="red" onClick={onClearAll}>
					Clear All
				</Button>
			</Group>
		</>
	);
};
export default QuestTodoList;
