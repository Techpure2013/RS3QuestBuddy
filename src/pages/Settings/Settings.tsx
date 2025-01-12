import {
	Accordion,
	AccordionControl,
	AccordionPanel,
	Button,
	Checkbox,
	ColorPicker,
	Radio,
	Stack,
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
	const storedExpandAllAccordions = localStorage.getItem("expandAllAccordions");
	const storedDialogOption = localStorage.getItem("DialogSolverOption");
	const [expandAllAccordions, setExpandAllAccordions] = useState<boolean>(() => {
		return storedExpandAllAccordions !== null
			? JSON.parse(storedExpandAllAccordions)
			: false;
	});
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
		const toolTip = localStorage.getItem("toolTip");
		if (toolTip !== null) {
			setToolTip(JSON.parse(toolTip));
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
		//Save Highlight Option
		window.localStorage.setItem("isHighlighted", JSON.stringify(highlight));
		//Save Compact Option
		window.localStorage.setItem("isCompact", JSON.stringify(compact));
		//Save Expanded Option
		localStorage.setItem(
			"expandAllAccordions",
			JSON.stringify(expandAllAccordions)
		);
		window.localStorage.setItem(
			"DialogSolverOption",
			JSON.stringify(dialogSolverOption)
		);
		window.localStorage.setItem("toolTip", JSON.stringify(toolTip));
	}, [highlight, compact, expandAllAccordions, dialogSolverOption, toolTip]);
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
			JSON.stringify(swatchLabelColor)
		);
		window.localStorage.setItem("swatchColors", JSON.stringify(swatchTextColors));
		window.localStorage.setItem(
			"buttonSwatchColors",
			JSON.stringify(buttonSwatchColors)
		);
		window.localStorage.setItem(
			"dialogSolverSwatch",
			JSON.stringify(dialogColorSwatch)
		);
	}, [
		dialogColorSwatch,
		swatchTextColors,
		swatchLabelColor,
		buttonSwatchColors,
	]);

	return (
		<div className="SettingsContainer">
			<Stack>
				<Checkbox
					styles={{
						label: { color: hasColor ? userColor : "" },
					}}
					checked={highlight}
					onChange={(event) => {
						setHighlight(event.currentTarget.checked);
					}}
					label={
						highlight
							? "Highlight green when complete turn off."
							: "Highlight green when complete turn on."
					}
				/>
				<Checkbox
					styles={{
						label: { color: hasColor ? userColor : "" },
					}}
					label={compact ? "Compact Mode Off" : "Compact Mode On"}
					checked={compact || false} // Ensures `checked` is always a boolean
					onChange={(e) => {
						setCompact(e.target.checked); // Update state based on the checkbox value
					}}
				/>
				<Checkbox
					styles={{
						label: { color: hasColor ? userColor : "" },
					}}
					checked={expandAllAccordions}
					onChange={(event) => setExpandAllAccordions(event.target.checked)}
					label={
						expandAllAccordions
							? "Close all accordion sections by default"
							: "Expand all accordion sections by default"
					}
				/>
				<Checkbox
					styles={{
						label: { color: hasColor ? userColor : "" },
					}}
					checked={dialogSolverOption}
					onChange={(event) => setDialogSolverOption(event.target.checked)}
					label={
						dialogSolverOption ? "Turn off Dialog Solver" : "Turn on Dialog Solver"
					}
				/>
				<Checkbox
					styles={{
						label: { color: hasColor ? userColor : "" },
					}}
					checked={toolTip}
					onChange={(event) => setToolTip(event.target.checked)}
					label={toolTip ? "Turn off Tool Tips" : "Turn on Tool Tips"}
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
									setTextColorValue(event.currentTarget.value);
									swatchTextColors.push(event.currentTarget.value);
								}
							}}
						></TextInput>
						<ColorPicker
							value={colorTextValue}
							size="sm"
							swatches={swatchTextColors}
							onChange={(value) => {
								setTextColorValue(value);
							}}
							onChangeEnd={(value) => {
								swatchTextColors.push(value);
								if (swatchTextColors.length == maxColors) {
									swatchTextColors.reverse();
									swatchTextColors.pop();
									swatchTextColors.reverse();
								}
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
						></TextInput>
						<ColorPicker
							value={labelColor}
							size="sm"
							swatches={swatchLabelColor}
							onChange={(value) => {
								setLabelColor(value);
							}}
							onChangeEnd={(value) => {
								swatchLabelColor.push(value);
								if (swatchLabelColor.length == maxColors) {
									swatchLabelColor.reverse();
									swatchLabelColor.pop();
									swatchLabelColor.reverse();
								}
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
						></TextInput>
						<ColorPicker
							value={buttonColor}
							size="sm"
							swatches={buttonSwatchColors}
							onChange={(value) => {
								setButtonColor(value);
							}}
							onChangeEnd={(value) => {
								buttonSwatchColors.push(value);
								if (buttonSwatchColors.length == maxColors) {
									buttonSwatchColors.reverse();
									buttonSwatchColors.pop();
									buttonSwatchColors.reverse();
								}
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
				<Accordion.Item key={5} value="Dialog Solver Color">
					<AccordionControl
						styles={{
							control: { color: hasLabelColor ? labelColor : "" },
						}}
					>
						Change Your Dialog Solver Color
					</AccordionControl>
					<AccordionPanel>
						<TextInput
							defaultValue={dialogSolverColor}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									setDialogSolverColor(event.currentTarget.value);
								}
							}}
						></TextInput>
						<ColorPicker
							value={dialogSolverColor}
							size="sm"
							swatches={dialogColorSwatch}
							format="rgba"
							onChange={(value) => {
								setDialogSolverColor(value);
							}}
							onChangeEnd={(value) => {
								dialogColorSwatch.push(value);
								if (dialogColorSwatch.length == maxColors) {
									dialogColorSwatch.reverse();
									dialogColorSwatch.pop();
									dialogColorSwatch.reverse();
								}
							}}
						/>
						<Button
							color={hasButtonColor ? userButtonColor : ""}
							onClick={() => {
								setDialogColorSwatch([]);
							}}
							variant="outline"
						>
							Clear Swatch
						</Button>
					</AccordionPanel>
				</Accordion.Item>
			</Accordion>
		</div>
	);
};
