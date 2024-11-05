import {
	Accordion,
	AccordionControl,
	AccordionPanel,
	Button,
	ColorPicker,
	Radio,
	Stack,
	TextInput,
} from "@mantine/core";
import { useEffect, useState } from "react";
import FontSizeControls from "./../Handlers/FontSizeInput";
export const Settings: React.FC = () => {
	const [highlight, setHighlight] = useState(false);
	const [removeStep, setRemoveStep] = useState(false);
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
	useEffect(() => {
		const storedHighlight = localStorage.getItem("isHighlighted");
		const storedRemoveStep = localStorage.getItem("removeStep");
		const storedTextSwatches = localStorage.getItem("swatchColors");
		const storedTextColorValue = localStorage.getItem("textColorValue");
		const storedLabelColor = localStorage.getItem("labelColor");
		const storedLabelSwatch = localStorage.getItem("labelSwatchColors");
		const storedButtonColor = localStorage.getItem("buttonColor");
		const storedButtonSwatchColor = localStorage.getItem("buttonSwatchColors");
		const colorVal = localStorage.getItem("textColorValue");
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
		if (storedHighlight !== null) {
			const parsedHighlight = JSON.parse(storedHighlight);
			setHighlight(parsedHighlight);
		}

		if (storedRemoveStep !== null) {
			const parsedRemoveStep = JSON.parse(storedRemoveStep);
			setRemoveStep(parsedRemoveStep);
		}
		if (storedTextSwatches !== null) {
			const parsedSwatches = JSON.parse(storedTextSwatches);
			setTextSwatchColors(parsedSwatches);
		}
		if (storedTextColorValue !== null) {
			setTextColorValue(storedTextColorValue);
		}
	}, []);

	useEffect(() => {
		window.localStorage.setItem("isHighlighted", JSON.stringify(highlight));
		window.localStorage.setItem("removeStep", JSON.stringify(removeStep));
	}, [highlight, removeStep]);
	useEffect(() => {
		window.localStorage.setItem("swatchColors", JSON.stringify(swatchTextColors));
		window.localStorage.setItem("textColorValue", colorTextValue);
		window.localStorage.setItem("labelColor", labelColor);
		window.localStorage.setItem(
			"labelSwatchColors",
			JSON.stringify(swatchLabelColor)
		);
		window.localStorage.setItem("buttonColor", buttonColor);
		window.localStorage.setItem(
			"buttonSwatchColors",
			JSON.stringify(buttonSwatchColors)
		);
	}, [
		swatchTextColors,
		colorTextValue,
		labelColor,
		swatchLabelColor,
		buttonColor,
		buttonSwatchColors,
		userColor,
		userButtonColor,
		userLabelColor,
		colorTextValue,
	]);
	return (
		<div className="SettingsContainer">
			<Stack>
				<Radio
					styles={{
						label: { color: hasColor ? userColor : "" },
					}}
					checked={highlight}
					onChange={(event) => {
						setHighlight(event.currentTarget.checked);
						setRemoveStep(false);
					}}
					label="Highlight green when complete."
				/>
				<Radio
					styles={{
						label: { color: hasColor ? userColor : "" },
					}}
					checked={removeStep}
					onChange={(event) => {
						setRemoveStep(event.currentTarget.checked);
						setHighlight(false);
					}}
					label="Remove step after completion."
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
								if (swatchTextColors.length > 10) {
									swatchTextColors.pop();
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
								if (swatchLabelColor.length > 10) {
									swatchLabelColor.pop();
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
								if (buttonSwatchColors.length > 10) {
									buttonSwatchColors.pop();
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
			</Accordion>
		</div>
	);
};
