import React, { useRef, useEffect } from "react";

interface TransferCaptureProps {
	images: string[]; // Array of image URLs
	onImageDataCapture: (imageData: ImageData) => void; // Callback to handle captured image data
}

export const TransferCapture: React.FC<TransferCaptureProps> = ({
	images,
	onImageDataCapture,
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (canvasRef.current) {
			const canvas = canvasRef.current;
			const context = canvas.getContext("2d");

			if (context) {
				images.forEach(async (imageUrl) => {
					const image = new Image();
					image.src = imageUrl;

					image.onload = () => {
						context.drawImage(image, 0, 0, canvas.width, canvas.height);

						const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
						// Invoke the callback with the captured imageData
						onImageDataCapture(imageData);
					};
				});
			}
		}
	}, [images, onImageDataCapture]);

	return <canvas ref={canvasRef} style={{ display: "none" }} />;
};
