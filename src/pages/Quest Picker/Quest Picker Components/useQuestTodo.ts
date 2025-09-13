// src/hooks/useQuestTodo.ts
import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "questTodoList";

export const useQuestTodo = () => {
	// State to hold the list of quest titles
	const [todoQuests, setTodoQuests] = useState<string[]>([]);

	// On initial load, read the list from localStorage
	useEffect(() => {
		try {
			const storedList = localStorage.getItem(STORAGE_KEY);
			if (storedList) {
				setTodoQuests(JSON.parse(storedList));
			}
		} catch (error) {
			console.error("Failed to parse quest to-do list from localStorage", error);
			setTodoQuests([]); // Reset to empty on error
		}
	}, []);

	// Helper function to save the list to localStorage
	const saveList = (list: string[]) => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
		} catch (error) {
			console.error("Failed to save quest to-do list to localStorage", error);
		}
	};

	// Function to add a quest to the list
	const addQuestToTodo = useCallback((questName: string) => {
		setTodoQuests((prevList) => {
			// Prevent duplicates
			if (prevList.includes(questName)) {
				return prevList;
			}
			const newList = [...prevList, questName];
			saveList(newList);
			return newList;
		});
	}, []);

	// Function to remove a quest from the list
	const removeQuestFromTodo = useCallback((questName: string) => {
		setTodoQuests((prevList) => {
			const newList = prevList.filter((q) => q !== questName);
			saveList(newList);
			return newList;
		});
	}, []);
	const clearQuestTodo = useCallback(() => {
		setTodoQuests([]);
		saveList([]); // Also clear it from localStorage
	}, []);
	return { todoQuests, addQuestToTodo, removeQuestFromTodo, clearQuestTodo };
};
