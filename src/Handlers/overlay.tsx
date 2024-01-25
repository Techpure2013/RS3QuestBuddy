import * as a1lib from "alt1";
//import { useEffect } from "react";
//import image from "./../../Images/A Clockwork Syringe/AClockworkSyringe.png";
import { TransferCapture } from "./ImageCapture";
export const OverlayComponent: React.FC = () => {
	const imageUrl = ["./../../Images/A Clockwork Syringe/AClockworkSyringe.png"]; // Provide a valid image URL here
	const handleImage = (imageData: ImageData) => {
		const data = a1lib.encodeImageString(imageData);
		alt1.overLayImage(688, 788, data, 300, 5000);
	};
	return <TransferCapture images={imageUrl} onImageDataCapture={handleImage} />;
};
