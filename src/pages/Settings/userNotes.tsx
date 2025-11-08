import { ActionIcon, Box } from "@mantine/core";
import { useEffect, useState, useCallback } from "react";
import ReactQuill from "react-quill";
import "quill/dist/quill.snow.css";
import "react-quill/dist/quill.snow.css";
import ReactHtmlParser from "@orrisroot/react-html-parser";
import { IconTrash } from "@tabler/icons-react";

const STORAGE_KEY = "displayNote";

const UserNotes: React.FC = () => {
	const [noteValue, setNoteValue] = useState<string>("");
	const [displayNote, setDisplayNote] = useState<string[]>([]);
	const [userColor, setUserColor] = useState("");
	const [hasColor, setHasColor] = useState(false);
	const [, setHasButtonColor] = useState(false);
	const [, setHasLabelColor] = useState(false);

	// Load persisted notes + colors
	useEffect(() => {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				const parsed = JSON.parse(saved);
				if (Array.isArray(parsed)) setDisplayNote(parsed);
			}
		} catch {
			console.warn("Did not find Notes");
		}

		const colorVal = localStorage.getItem("textColorValue");
		const labelCol = localStorage.getItem("labelColor");
		const buttonCol = localStorage.getItem("buttonColor");

		setHasButtonColor(!!buttonCol);
		setHasLabelColor(!!labelCol);

		if (colorVal) {
			setUserColor(colorVal);
			setHasColor(true);
		} else {
			setHasColor(false);
		}
	}, []);

	// Persist notes whenever they change
	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(displayNote));
	}, [displayNote]);

	// Ctrl+S to save current editor content as a note
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.ctrlKey && (event.key === "s" || event.key === "S")) {
				event.preventDefault();
				const savedNoteValue = noteValue.trim();

				if (savedNoteValue && savedNoteValue !== "<p><br></p>") {
					setDisplayNote((prev) => [...prev, savedNoteValue]);
				}

				// Clear editor for next note
				setNoteValue("");
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [noteValue]);

	const handleNoteChange = useCallback((value: string) => {
		setNoteValue(value);
	}, []);

	const removeNote = useCallback((oneBasedIndex: number) => {
		setDisplayNote((prev) => {
			const idx = oneBasedIndex - 1;
			if (idx < 0 || idx >= prev.length) return prev;
			const next = prev.slice(0, idx).concat(prev.slice(idx + 1));
			return next;
		});
	}, []);

	return (
		<>
			<ReactQuill
				style={{ color: hasColor ? userColor : "" }}
				className="Notepad"
				placeholder="Type your notes. Press Ctrl+S to save"
				value={noteValue}
				onChange={handleNoteChange}
			/>

			<h3 style={{ color: hasColor ? userColor : "" }}>Your Notes</h3>

			{displayNote
				.filter((v) => v && v !== "")
				.map((value, index) => {
					const trueIndex = index + 1;
					return (
						<Box
							key={trueIndex}
							className="note"
							style={{ color: hasColor ? userColor : "" }}
						>
							{ReactHtmlParser(value)}
							<ActionIcon
								onClick={() => removeNote(trueIndex)}
								size="sm"
								variant="outline"
								color="#CA4D4D"
							>
								<IconTrash />
							</ActionIcon>
						</Box>
					);
				})}
		</>
	);
};

export default UserNotes;
