import {
	Accordion,
	AccordionControl,
	AccordionPanel,
	Button,
	ColorPicker,
	Stack,
	Switch,
	TextInput,
} from "@mantine/core";
import { useEffect, useState } from "react";
import FontSizeControls from "./Setting Components/FontSizeInput";

export const Settings: React.FC = () => {
	const [highlight, setHighlight] = useState(false);
	const [colorTextValue, setTextColorValue] = useState<string>("");
	const [swatchTextColors, setTextSwatchColors] = useState<string[]>([]);
	const [labelColor, setLabelColor] = useState("");
	const [swatchLabelColor, setSwatchLabelColor] = useState<string[]>([]);
	const [buttonColor, setButtonColor] = useState("");
	const [buttonSwatchColors, setButtonSwatchColors] = useState<string[]>([]);
	const [hasColor, setHasColor] = useState(false);
	const [hasButtonColor, setHasButtonColor] = useState(false);
	const [hasLabelColor, setHasLabelColor] = useState(false);
	const [userColor, setUserColor] = useState("");
	const [userLabelColor, setUserLabelColor] = useState("");
	const [userButtonColor, setUserButtonColor] = useState("");
	const [compact, setCompact] = useState(false);
	const storedDialogOption = localStorage.getItem("DialogSolverOption");
	const [dialogSolverOption, setDialogSolverOption] = useState<boolean>(() => {
		return storedDialogOption !== null ? JSON.parse(storedDialogOption) : false;
	});
	const [dialogSolverColor, setDialogSolverColor] = useState<string>("");
	const [dialogColorSwatch, setDialogColorSwatch] = useState<string[]>([]);
	const [toolTip, setToolTip] = useState<boolean>(false);
	const maxColors = 5;

	useEffect(() => {
		const storedCompact = localStorage.getItem("isCompact");
		const storedHighlight = localStorage.getItem("isHighlighted");
		const storedDialogSolverColor = localStorage.getItem("dialogSolverColor");
		const storedTextSwatches = localStorage.getItem("swatchColors");
		const storedTextColorValue = localStorage.getItem("textColorValue");
		const storedLabelColor = localStorage.getItem("labelColor");
		const storedLabelSwatch = localStorage.getItem("labelSwatchColors");
		const storedButtonColor = localStorage.getItem("buttonColor");
		const storedButtonSwatchColor = localStorage.getItem("buttonSwatchColors");
		const storedDialogSwatch = localStorage.getItem("dialogSolverSwatch");
		const colorVal = localStorage.getItem("textColorValue");
		const toolTipVal = localStorage.getItem("toolTip");
		if (toolTipVal !== null) {
			setToolTip(JSON.parse(toolTipVal));
		}
		if (storedDialogSolverColor !== null) {
			setDialogSolverColor(storedDialogSolverColor);
		}
		if (colorVal) {
			setUserColor(colorVal);
			setHasColor(true);
		} else {
			setHasColor(false);
		}
		if (storedButtonSwatchColor !== null) {
			const parsedButtonSwatch = JSON.parse(storedButtonSwatchColor);
			setButtonSwatchColors(parsedButtonSwatch);
		}
		if (storedButtonColor !== null) {
			setButtonColor(storedButtonColor);
			setHasButtonColor(true);
			setUserButtonColor(storedButtonColor);
		} else {
			setHasButtonColor(false);
		}
		if (storedLabelSwatch !== null) {
			const parsedLabelSwatch = JSON.parse(storedLabelSwatch);
			setSwatchLabelColor(parsedLabelSwatch);
		}
		if (storedLabelColor !== null) {
			setLabelColor(storedLabelColor);
			setHasLabelColor(true);
			setUserLabelColor(storedLabelColor);
		} else {
			setHasLabelColor(false);
		}
		if (storedDialogSwatch !== null) {
			const parsedSwatch = JSON.parse(storedDialogSwatch);
			setDialogColorSwatch(parsedSwatch);
		}
		if (storedHighlight !== null) {
			const parsedHighlight = JSON.parse(storedHighlight);
			setHighlight(parsedHighlight);
		}
		if (storedTextSwatches !== null) {
			const parsedSwatches = JSON.parse(storedTextSwatches);
			setTextSwatchColors(parsedSwatches);
		}
		if (storedTextColorValue !== null) {
			setTextColorValue(storedTextColorValue);
		}
		if (storedCompact !== null) {
			const parsedCompact = JSON.parse(storedCompact);
			setCompact(parsedCompact);
		}
	}, []);

	useEffect(() => {
		window.localStorage.setItem("isHighlighted", JSON.stringify(highlight));
		window.localStorage.setItem("isCompact", JSON.stringify(compact));
		window.localStorage.setItem(
			"DialogSolverOption",
			JSON.stringify(dialogSolverOption),
		);
		window.localStorage.setItem("toolTip", JSON.stringify(toolTip));
	}, [highlight, compact, dialogSolverOption, toolTip]);

	useEffect(() => {
		window.localStorage.setItem("textColorValue", colorTextValue);
		window.localStorage.setItem("labelColor", labelColor);
		window.localStorage.setItem("dialogSolverColor", dialogSolverColor);
		window.localStorage.setItem("buttonColor", buttonColor);
	}, [
		dialogSolverColor,
		buttonColor,
		userColor,
		userButtonColor,
		userLabelColor,
		labelColor,
		colorTextValue,
	]);

	useEffect(() => {
		window.localStorage.setItem(
			"labelSwatchColors",
			JSON.stringify(swatchLabelColor),
		);
		window.localStorage.setItem("swatchColors", JSON.stringify(swatchTextColors));
		window.localStorage.setItem(
			"buttonSwatchColors",
			JSON.stringify(buttonSwatchColors),
		);
		window.localStorage.setItem(
			"dialogSolverSwatch",
			JSON.stringify(dialogColorSwatch),
		);
	}, [
		dialogColorSwatch,
		swatchTextColors,
		swatchLabelColor,
		buttonSwatchColors,
	]);

	// Helper function to update swatches immutably
	const updateSwatches = (
		setter: React.Dispatch<React.SetStateAction<string[]>>,
		newValue: string,
	) => {
		setter((currentSwatches) => {
			const newSwatches = [...currentSwatches, newValue];
			// If the array is too long, remove the oldest element (at the beginning)
			if (newSwatches.length > maxColors) {
				return newSwatches.slice(1);
			}
			return newSwatches;
		});
	};

	return (
		<div className="SettingsContainer">
			<Stack>
				<Switch
					styles={{
						label: { color: hasColor ? userColor : "" },
					}}
					label={compact ? "Compact Mode On" : "Compact Mode Off"}
					checked={compact || false}
					onChange={(e) => {
						setCompact(e.target.checked);
					}}
				/>
				<Switch
					styles={{
						label: { color: hasColor ? userColor : "" },
					}}
					checked={dialogSolverOption}
					onChange={(event) => setDialogSolverOption(event.target.checked)}
					label={dialogSolverOption ? "Dialog Solver On" : "Dialog Solver Off"}
				/>
				<Switch
					styles={{
						label: { color: hasColor ? userColor : "" },
					}}
					checked={toolTip}
					onChange={(event) => setToolTip(event.target.checked)}
					label={toolTip ? "Tool Tips On" : "Tool Tips Off"}
				/>
			</Stack>
			<Accordion>
				<Accordion.Item key={1} value="Color Your Text">
					<AccordionControl
						styles={{
							control: { color: hasLabelColor ? labelColor : "" },
						}}
					>
						Color Your Text
					</AccordionControl>
					<AccordionPanel>
						<TextInput
							defaultValue={colorTextValue}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									const newValue = event.currentTarget.value;
									setTextColorValue(newValue);
									// FIX: Update swatches immutably
									updateSwatches(setTextSwatchColors, newValue);
								}
							}}
						/>
						<ColorPicker
							suppressHydrationWarning
							value={colorTextValue}
							size="sm"
							swatches={swatchTextColors}
							onChange={setTextColorValue}
							onChangeEnd={(value) => {
								// FIX: Update swatches immutably instead of using .push()
								updateSwatches(setTextSwatchColors, value);
							}}
						/>
						<Button
							onClick={() => {
								setTextSwatchColors([]);
							}}
							variant="outline"
							color={hasButtonColor ? userButtonColor : ""}
						>
							Clear Swatch
						</Button>
					</AccordionPanel>
				</Accordion.Item>
				<Accordion.Item key={2} value="Color Your Labels">
					<AccordionControl
						styles={{
							control: { color: hasLabelColor ? labelColor : "" },
						}}
					>
						Color Your Labels
					</AccordionControl>
					<AccordionPanel>
						<TextInput
							defaultValue={labelColor}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									setLabelColor(event.currentTarget.value);
								}
							}}
						/>
						<ColorPicker
							suppressHydrationWarning
							value={labelColor}
							size="sm"
							swatches={swatchLabelColor}
							onChange={setLabelColor}
							onChangeEnd={(value) => {
								// FIX: Update swatches immutably
								updateSwatches(setSwatchLabelColor, value);
							}}
						/>
						<Button
							onClick={() => {
								setSwatchLabelColor([]);
							}}
							variant="outline"
							color={hasButtonColor ? userButtonColor : ""}
						>
							Clear Swatch
						</Button>
					</AccordionPanel>
				</Accordion.Item>
				<Accordion.Item key={3} value="Color Your Buttons">
					<AccordionControl
						styles={{
							control: { color: hasLabelColor ? labelColor : "" },
						}}
					>
						Color Your Buttons
					</AccordionControl>
					<AccordionPanel>
						<TextInput
							defaultValue={buttonColor}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									setButtonColor(event.currentTarget.value);
								}
							}}
						/>
						<ColorPicker
							suppressHydrationWarning
							value={buttonColor}
							size="sm"
							swatches={buttonSwatchColors}
							onChange={setButtonColor}
							onChangeEnd={(value) => {
								// FIX: Update swatches immutably
								updateSwatches(setButtonSwatchColors, value);
							}}
						/>
						<Button
							color={hasButtonColor ? userButtonColor : ""}
							onClick={() => {
								setButtonSwatchColors([]);
							}}
							variant="outline"
						>
							Clear Swatch
						</Button>
					</AccordionPanel>
				</Accordion.Item>
				<Accordion.Item key={4} value="Change Your FontSize">
					<AccordionControl
						styles={{
							control: { color: hasLabelColor ? labelColor : "" },
						}}
					>
						Change Font Size
					</AccordionControl>
					<AccordionPanel>
						<FontSizeControls />
					</AccordionPanel>
				</Accordion.Item>
			</Accordion>
		</div>
	);
};
