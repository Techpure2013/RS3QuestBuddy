import { ActionIcon, Box } from "@mantine/core";
import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import ReactHtmlParser from "@orrisroot/react-html-parser";
import { IconTrash } from "@tabler/icons-react";
export const UserNotes: React.FC = () => {
	const [noteValue, setNoteValue] = useState<string>("");
	const [originalNote, setOriginalNote] = useState<string>("");
	const [displayNote, setDisplayNote] = useState([""]);
	const [userColor, setUserColor] = useState("");
	const [, setUserLabelColor] = useState("");
	const [, setUserButtonColor] = useState("");
	const [hasColor, setHasColor] = useState(false);
	const [, setHasButtonColor] = useState(false);
	const [, setHasLabelColor] = useState(false);
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			// Check if the user presses Ctrl + S
			if (event.ctrlKey && event.key === "s") {
				// Prevent the default browser save behavior
				event.preventDefault();

				// Save the note value
				const savedNoteValue = originalNote || noteValue;
				console.log("Note saved:", savedNoteValue);
				// You can perform further actions like sending the data to a server or storing it locally.
				if (savedNoteValue !== "" && savedNoteValue !== "<p><br></p>") {
					displayNote.push(savedNoteValue);
					window.localStorage.setItem("displayNote", JSON.stringify(displayNote));
				}
				// Reset the editor for a new note
				setNoteValue("");
				setOriginalNote("");
			}
		};

		// Add event listener when the component mounts
		window.addEventListener("keydown", handleKeyDown);

		// Remove event listener when the component unmounts
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [noteValue, originalNote]);

	const handleNoteChange = (value: string) => {
		setNoteValue(value);
	};
	useEffect(() => {
		const displayN = localStorage.getItem("displayNote");
		const colorVal = localStorage.getItem("textColorValue");
		const labelCol = localStorage.getItem("labelColor");
		const buttonCol = localStorage.getItem("buttonColor");
		if (buttonCol) {
			setUserButtonColor(buttonCol);
			setHasButtonColor(true);
		} else {
			setHasButtonColor(false);
		}
		if (labelCol) {
			setUserLabelColor(labelCol);
			setHasLabelColor(true);
		} else {
			setHasLabelColor(false);
		}
		if (colorVal) {
			setUserColor(colorVal);
			setHasColor(true);
		} else {
			setHasColor(false);
		}
		if (displayN) {
			const parsedNotes = JSON.parse(displayN);
			setDisplayNote(parsedNotes);
		} else {
			console.warn("Did not find Notes");
		}
	}, []);
	useEffect(() => {
		// Update the original note when noteValue changes
		setOriginalNote(noteValue);
	}, [noteValue]);
	const removeNote = (value: number) => {
		setDisplayNote((prevDisplayNote) => {
			const updatedDisplayNote = prevDisplayNote.filter((_, i) => i + 1 !== value);

			// Update localStorage with the latest state
			localStorage.setItem("displayNote", JSON.stringify(updatedDisplayNote));

			return updatedDisplayNote;
		});
	};
	return (
		<>
			<ReactQuill
				style={{
					backgroundColor: "#1e2832",
					color: hasColor ? userColor : "white",
				}}
				className="Notepad"
				placeholder="Type in your notes. Press ctrl + s To save"
				value={noteValue}
				onChange={handleNoteChange}
			/>

			<h3 style={{ color: hasColor ? userColor : "#4e85bc" }}>Your Notes</h3>

			{displayNote.map((value, index) => {
				const trueIndex = index + 1;
				console.log(value);
				if (value !== "") {
					return (
						<>
							<Box
								key={trueIndex}
								style={{
									backgroundColor: "#1e2832",
									color: hasColor ? userColor : "white",
									borderRadius: "5px" /* Optional: Rounded corners */,
									boxShadow:
										"5px 5px 5px rgba(0, 0, 0, 0.7)" /* Shadow on the bottom right */,
									fontFamily: "rs3Font",
									textAlign: "left",
									padding: "5px",
								}}
							>
								{ReactHtmlParser(value)}
								<ActionIcon
									onClick={() => {
										removeNote(trueIndex);
									}}
									size={"sm"}
									variant="outline"
									color="#CA4D4D"
									styles={{
										root: {},
									}}
								>
									<IconTrash />
								</ActionIcon>
							</Box>
							<div className="autoPad2" />
						</>
					);
				}
			})}
		</>
	);
};
