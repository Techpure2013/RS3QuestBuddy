import React, { useState, useEffect } from "react";
import {
	Modal,
	Checkbox,
	Button,
	Group,
	Stack,
	Text,
	ScrollArea,
	Title,
} from "@mantine/core";

interface QuestStorageManagerProps {
	opened: boolean;
	onClose: () => void;
}

const STORAGE_PREFIX = "lastActiveStep-";

const QuestStorageManager: React.FC<QuestStorageManagerProps> = ({
	opened,
	onClose,
}) => {
	const [storedQuests, setStoredQuests] = useState<string[]>([]);
	const [selectedQuests, setSelectedQuests] = useState<string[]>([]);

	useEffect(() => {
		if (opened) {
			const questKeys = Object.keys(localStorage).filter((key) =>
				key.startsWith(STORAGE_PREFIX),
			);
			const questNames = questKeys.map((key) => key.replace(STORAGE_PREFIX, ""));
			setStoredQuests(questNames);
			setSelectedQuests([]); // Reset selection when modal opens
		}
	}, [opened]);

	const handleDeleteSelected = () => {
		selectedQuests.forEach((questName) => {
			localStorage.removeItem(`${STORAGE_PREFIX}${questName}`);
		});
		// Refresh the list after deletion
		const remainingQuests = storedQuests.filter(
			(q) => !selectedQuests.includes(q),
		);
		setStoredQuests(remainingQuests);
		setSelectedQuests([]);
	};

	const handleDeleteAll = () => {
		storedQuests.forEach((questName) => {
			localStorage.removeItem(`${STORAGE_PREFIX}${questName}`);
		});
		// Clear the state after deleting all
		setStoredQuests([]);
		setSelectedQuests([]);
	};

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={<Title order={4}>Manage Saved Quest Progress</Title>}
			centered
			size="md"
		>
			<Stack>
				{storedQuests.length > 0 ? (
					<>
						<Text size="sm">
							Select the quest progress you wish to delete from your browser's storage.
						</Text>
						<ScrollArea mah={300}>
							<Checkbox.Group value={selectedQuests} onChange={setSelectedQuests}>
								<Stack gap="xs" p="xs">
									{storedQuests.map((questName) => (
										<Checkbox key={questName} value={questName} label={questName} />
									))}
								</Stack>
							</Checkbox.Group>
						</ScrollArea>
						<Group justify="flex-end" mt="md">
							<Button variant="outline" color="red" onClick={handleDeleteAll}>
								Delete All ({storedQuests.length})
							</Button>
							<Button
								color="red"
								disabled={selectedQuests.length === 0}
								onClick={handleDeleteSelected}
							>
								Delete Selected ({selectedQuests.length})
							</Button>
						</Group>
					</>
				) : (
					<Text>No saved quest progress found in storage.</Text>
				)}
			</Stack>
		</Modal>
	);
};
export default QuestStorageManager;
