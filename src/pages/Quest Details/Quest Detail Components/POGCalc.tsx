import React, { useState } from "react";

// Helper function to handle calculations for Cyan, Magenta, and Yellow
const getCrystalShape = (sides: number): string => {
	switch (sides) {
		case 1:
			return "circle";
		case 2:
			return "almond";
		case 3:
			return "triangle";
		case 4:
			return "square";
		case 5:
			return "pentagon";
		case 6:
			return "hexagon";
		default:
			return `${sides}-sided shape`;
	}
};

const calculateCrystals = (color: string, targetIntensity: number): string => {
	let result = "";

	if (color === "Cyan") {
		const sides = targetIntensity / 9;
		if (Number.isInteger(sides)) {
			result = `Use a Blue and Green ${getCrystalShape(
				sides
			)} crystal, each with ${sides} sides.`;
		} else {
			result = "No valid combination for Cyan with this intensity.";
		}
	} else if (color === "Magenta") {
		if (targetIntensity === 27) {
			result = `Use a Red ${getCrystalShape(3)} and an Indigo ${getCrystalShape(
				4
			)}.`;
		} else if (targetIntensity % 15 === 0) {
			const sides = targetIntensity / 15;
			result = `Use a Red ${getCrystalShape(
				sides
			)} with ${sides} sides and a Violet ${getCrystalShape(sides * 2)} with ${
				sides * 2
			} sides.`;
		} else if (targetIntensity % 6 === 0) {
			const sides = targetIntensity / 6;
			result = `Use a Red ${getCrystalShape(sides)} and a Blue ${getCrystalShape(
				sides
			)}, each with ${sides} sides.`;
		} else {
			result = "No valid combination for Magenta with this intensity.";
		}
	} else if (color === "Yellow") {
		if (targetIntensity % 5 === 0) {
			const sides = targetIntensity / 5;
			result = `Use a Red and Green ${getCrystalShape(
				sides
			)} crystal, each with ${sides} sides.`;
		} else if (targetIntensity % 8 === 0) {
			const greenSides = targetIntensity / 8;
			result = `Use a Green ${getCrystalShape(
				greenSides
			)} crystal with ${greenSides} sides and an Orange ${getCrystalShape(
				greenSides * 2
			)} crystal with ${greenSides * 2} sides.`;
		} else if (targetIntensity % 3 === 0) {
			const combinedSides = targetIntensity / 3;
			result = `Use two Yellow crystals with sides adding up to ${combinedSides}.`;
		} else {
			result = "No valid combination for Yellow with this intensity.";
		}
	}

	return result;
};

const ColorCalculator: React.FC = () => {
	const [color, setColor] = useState<string>("Cyan");
	const [targetIntensity, setTargetIntensity] = useState<number>(0);
	const [result, setResult] = useState<string>("");

	const handleCalculate = () => {
		const calculationResult = calculateCrystals(color, targetIntensity);
		setResult(calculationResult);
	};

	return (
		<div style={{ padding: "20px", fontFamily: "Arial" }}>
			<h1>Crystal Color Calculator</h1>

			<label htmlFor="colorSelect">Select Color:</label>
			<select
				id="colorSelect"
				value={color}
				onChange={(e) => setColor(e.target.value)}
			>
				<option value="Cyan">Cyan</option>
				<option value="Magenta">Magenta</option>
				<option value="Yellow">Yellow</option>
			</select>

			<div style={{ margin: "10px 0" }}>
				<label htmlFor="intensityInput">Target Intensity:</label>
				<input
					id="intensityInput"
					type="number"
					value={targetIntensity}
					onChange={(e) => setTargetIntensity(Number(e.target.value))}
					style={{ marginLeft: "10px" }}
				/>
			</div>

			<button
				onClick={handleCalculate}
				style={{
					padding: "10px 20px",
					backgroundColor: "#007BFF",
					color: "#FFF",
					border: "none",
					borderRadius: "5px",
				}}
			>
				Calculate
			</button>

			{result && (
				<div
					style={{
						marginTop: "20px",
						padding: "10px",
						border: "1px solid #ccc",
						borderRadius: "5px",
					}}
				>
					<strong>Result:</strong> {result}
				</div>
			)}
		</div>
	);
};

export default ColorCalculator;
