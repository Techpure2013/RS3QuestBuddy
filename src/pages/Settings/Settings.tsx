import {
	Accordion,
	AccordionControl,
	AccordionPanel,
	Button,
	ColorPicker,
	Select,
	Stack,
	Switch,
} from "@mantine/core";
import { lazy, Suspense } from "react";
import { useDisclosure } from "@mantine/hooks";
// --- CHANGE 1: Import the correct context hook ---
import { useSettings } from "./../../Entrance/Entrance Components/SettingsContext";
import FontSizeControls from "./Setting Components/FontSizeInput";

const QuestStorageManager = lazy(
	() => import("./Setting Components/QuestStorageManager"),
);

const Settings: React.FC = () => {
	// --- CHANGE 2: Call the correct context hook ---
	const {
		settings,
		updateSetting,
		addColorToSwatch,
		toggleExpandedMode,
		toggleAutoScroll,
	} = useSettings();
	const [isOpen, { open, close }] = useDisclosure(false);

	const hasTextColor = !!settings.textColor;
	const hasLabelColor = !!settings.labelColor;
	const hasButtonColor = !!settings.buttonColor;

	return (
		<div className="SettingsContainer">
			<Stack>
				<Button onClick={open}>Manage Saved Quest Progress</Button>
				<Suspense fallback={<div>Loading...</div>}>
					<QuestStorageManager opened={isOpen} onClose={close} />
				</Suspense>

				<Switch
					styles={{ label: { color: hasTextColor ? settings.textColor : "" } }}
					label={settings.isCompact ? "Compact Mode On" : "Compact Mode Off"}
					checked={settings.isCompact}
					onChange={(e) => updateSetting("isCompact", e.currentTarget.checked)}
				/>
				<Switch
					styles={{ label: { color: hasTextColor ? settings.textColor : "" } }}
					label={
						settings.dialogSolverEnabled ? "Dialog Solver On" : "Dialog Solver Off"
					}
					checked={settings.dialogSolverEnabled}
					onChange={(e) =>
						updateSetting("dialogSolverEnabled", e.currentTarget.checked)
					}
				/>
				<Switch
					styles={{ label: { color: hasTextColor ? settings.textColor : "" } }}
					label={settings.toolTipsEnabled ? "Tool Tips On" : "Tool Tips Off"}
					checked={settings.toolTipsEnabled}
					onChange={(e) => updateSetting("toolTipsEnabled", e.currentTarget.checked)}
				/>
				<Switch
					styles={{ label: { color: hasTextColor ? settings.textColor : "" } }}
					label={settings.isExpandedMode ? "Expanded Mode On" : "Expanded Mode Off"}
					checked={settings.isExpandedMode}
					onChange={toggleExpandedMode}
				/>
				<Switch
					styles={{ label: { color: hasTextColor ? settings.textColor : "" } }}
					label={settings.autoScrollEnabled ? "Auto-Scroll On" : "Auto-Scroll Off"}
					checked={settings.autoScrollEnabled}
					onChange={toggleAutoScroll}
				/>

				<Select
					label="Background Theme"
					value={settings.backgroundTheme}
					onChange={(value) => updateSetting("backgroundTheme", (value as "default" | "brown") || "default")}
					data={[
						{ value: "default", label: "Default (Blue)" },
						{ value: "brown", label: "Brown" },
					]}
					styles={{
						label: { color: hasLabelColor ? settings.labelColor : "" },
					}}
				/>
			</Stack>

			<Accordion mt="md">
				<Accordion.Item key="text-color" value="Color Your Text">
					<AccordionControl
						styles={{ control: { color: hasLabelColor ? settings.labelColor : "" } }}
					>
						Color Your Text
					</AccordionControl>
					<AccordionPanel>
						<ColorPicker
							format="hex"
							value={settings.textColor}
							onChange={(value) => updateSetting("textColor", value)}
							onChangeEnd={(value) => addColorToSwatch("textSwatches", value)}
							swatches={settings.textSwatches}
						/>
						<Button
							mt="xs"
							variant="outline"
							color={hasButtonColor ? settings.buttonColor : "blue"}
							onClick={() => updateSetting("textSwatches", [])}
						>
							Clear Swatches
						</Button>
					</AccordionPanel>
				</Accordion.Item>

				<Accordion.Item key="label-color" value="Color Your Labels">
					<AccordionControl
						styles={{ control: { color: hasLabelColor ? settings.labelColor : "" } }}
					>
						Color Your Labels
					</AccordionControl>
					<AccordionPanel>
						<ColorPicker
							format="hex"
							value={settings.labelColor}
							onChange={(value) => updateSetting("labelColor", value)}
							onChangeEnd={(value) => addColorToSwatch("labelSwatches", value)}
							swatches={settings.labelSwatches}
						/>
						<Button
							mt="xs"
							variant="outline"
							color={hasButtonColor ? settings.buttonColor : "blue"}
							onClick={() => updateSetting("labelSwatches", [])}
						>
							Clear Swatches
						</Button>
					</AccordionPanel>
				</Accordion.Item>

				<Accordion.Item key="button-color" value="Color Your Buttons">
					<AccordionControl
						styles={{ control: { color: hasLabelColor ? settings.labelColor : "" } }}
					>
						Color Your Buttons
					</AccordionControl>
					<AccordionPanel>
						<ColorPicker
							format="hex"
							value={settings.buttonColor}
							onChange={(value) => updateSetting("buttonColor", value)}
							onChangeEnd={(value) => addColorToSwatch("buttonSwatches", value)}
							swatches={settings.buttonSwatches}
						/>
						<Button
							mt="xs"
							variant="outline"
							color={hasButtonColor ? settings.buttonColor : "blue"}
							onClick={() => updateSetting("buttonSwatches", [])}
						>
							Clear Swatches
						</Button>
					</AccordionPanel>
				</Accordion.Item>

				<Accordion.Item key="font-size" value="Change Your FontSize">
					<AccordionControl
						styles={{ control: { color: hasLabelColor ? settings.labelColor : "" } }}
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
export default Settings;
